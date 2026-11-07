import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CategoryBanner from './components/CategoryBanner';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import Footer from './components/Footer';
import PostProductModal from './components/PostProductModal';
import AuthModal from './components/AuthModal';
import LoginModule from './components/LoginModule';
import ReportModal from './components/ReportModal';
import { fetchProducts, markProductSold, deleteProduct, getMe } from './api';
import {
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Plus,
  ArrowRight,
  Flame,
  Smartphone,
  Heart,
  SlidersHorizontal,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [allKnownProducts, setAllKnownProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Gateway: Show Login Module first if user is not authenticated
  const [showLoginGateway, setShowLoginGateway] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return !saved;
    } catch {
      return true;
    }
  });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [sort, setSort] = useState('newest');
  const [locationFilter, setLocationFilter] = useState('');

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  // Favorites persistence helpers
  const getInitialFavorites = () => {
    try {
      const saved = localStorage.getItem('campus_favorites');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') return (item._id || item.id || '').toString().trim();
          return String(item || '').trim();
        })
        .filter((id) => Boolean(id) && id !== 'undefined' && id !== 'null');
    } catch {
      return [];
    }
  };

  const persistFavorites = (favList) => {
    const cleanList = Array.from(new Set(favList.map(String).filter(Boolean)));
    localStorage.setItem('campus_favorites', JSON.stringify(cleanList));
    return cleanList;
  };

  // Favorites state (persisted)
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reportingProduct, setReportingProduct] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('student');

  const handleOpenAuth = (role = 'student') => {
    setAuthRole(role);
    setShowLoginGateway(true);
  };

  const handleOpenSell = () => {
    if (!currentUser) {
      showToast('Please sign in as a student, faculty or seller to post an ad', 'info');
      setShowLoginGateway(true);
      return;
    }
    setIsSellModalOpen(true);
  };

  // Synchronized favorite toggle with toast feedback
  const handleToggleFavorite = (id) => {
    const targetId = String(id || '').trim();
    if (!targetId) return;

    setFavorites((prev) => {
      const isFav = prev.some((favId) => String(favId) === targetId);
      const updated = isFav
        ? prev.filter((favId) => String(favId) !== targetId)
        : [...prev, targetId];
      persistFavorites(updated);
      showToast(
        isFav ? 'Removed from saved favorites' : '❤️ Saved to your Favorites!',
        isFav ? 'info' : 'success'
      );
      return updated;
    });
  };


  // Verify and refresh user profile
  useEffect(() => {
    const token = localStorage.getItem('campus_token');
    if (token) {
      getMe()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            localStorage.setItem('campus_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('campus_token');
          localStorage.removeItem('campus_user');
          setCurrentUser(null);
        });
    }
  }, []);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;
      if (condition && condition !== 'All') params.condition = condition;
      if (sort) params.sort = sort;

      const data = await fetchProducts(params);
      let list = data.products || [];

      // Filter by location if selected
      if (locationFilter && locationFilter !== 'All Campus') {
        list = list.filter((p) =>
          p.seller?.hostelBlock?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      setProducts(list);

      // Keep complete list of all active products for favorites lookup
      const allData = await fetchProducts({});
      const masterList = (allData.products || []).filter((p) => !p.isSold);
      setAllKnownProducts(masterList);

      // Automatically prune stale IDs from favorites that no longer exist in DB
      const activeIds = new Set(masterList.map((p) => String(p._id)));
      setFavorites((prev) => {
        const valid = prev.filter((favId) => activeIds.has(String(favId)));
        if (valid.length !== prev.length) {
          persistFavorites(valid);
        }
        return valid;
      });
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not connect to backend server. Make sure MongoDB and backend are running.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, sort, locationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Handle Mark Sold
  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this item as sold and remove it from the marketplace?')) {
      return;
    }
    try {
      await markProductSold(id);
      const targetId = String(id);
      setProducts((prev) => prev.filter((p) => String(p._id) !== targetId));
      setAllKnownProducts((prev) => prev.filter((p) => String(p._id) !== targetId));
      setFavorites((prev) => {
        const updated = prev.filter((favId) => String(favId) !== targetId);
        persistFavorites(updated);
        return updated;
      });
      showToast('Listing marked as sold!');
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product listing.');
    }
  };

  // Handle Delete Listing
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) {
      return;
    }
    try {
      await deleteProduct(id);
      const targetId = String(id);
      setProducts((prev) => prev.filter((p) => String(p._id) !== targetId));
      setAllKnownProducts((prev) => prev.filter((p) => String(p._id) !== targetId));
      setFavorites((prev) => {
        const updated = prev.filter((favId) => String(favId) !== targetId);
        persistFavorites(updated);
        return updated;
      });
      showToast('Listing removed successfully');
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product listing.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setCurrentUser(null);
    setShowLoginGateway(true);
    showToast('Logged out. Please select your role to continue.');
  };

  // Only products that are actually selected as favorite and active
  const favoriteProducts = allKnownProducts.filter((p) =>
    favorites.some((favId) => String(favId) === String(p._id)) && !p.isSold
  );

  // Displayed items: in favorites view, show only selected favorites matching search
  const displayedProducts = showFavoritesOnly
    ? favoriteProducts.filter((p) => {
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
        }
        return true;
      })
    : products;

  // Real favorites count matches actual existing favorited products
  const activeFavoritesCount = favoriteProducts.length;

  // Show Login Module FIRST if user is not authenticated and hasn't chosen guest preview
  if (showLoginGateway) {
    return (
      <LoginModule
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setShowLoginGateway(false);
          loadProducts();
          showToast(`Welcome back, ${user.name}! Authenticated as ${user.role}.`);
        }}
        onContinueAsGuest={() => {
          setShowLoginGateway(false);
          showToast('Browsing Campus Connect as Guest', 'info');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans selection:bg-[#002f34] selection:text-white">
      
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-toast">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-slate-900/90 text-white border-teal-500/40 shadow-slate-950/20'
                : 'bg-white/95 text-slate-800 border-slate-200 shadow-slate-400/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-sky-500" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onOpenSellModal={handleOpenSell}
        onOpenAuthModal={() => setShowLoginGateway(true)}
        onLogout={handleLogout}
        search={search}
        setSearch={setSearch}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        category={category}
        setCategory={(cat) => {
          setCategory(cat);
          setShowFavoritesOnly(false);
        }}
        favoritesCount={activeFavoritesCount}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesView={() => setShowFavoritesOnly((prev) => !prev)}
      />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
        
        {/* Promotional Banner & Browse Categories */}
        {!showFavoritesOnly && (
          <CategoryBanner
            selectedCategory={category}
            onSelectCategory={(cat) => {
              setCategory(cat);
              setShowFavoritesOnly(false);
            }}
            onPostAd={handleOpenSell}
          />
        )}

        {/* Backend Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={loadProducts}
              className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. Products Recommendations Section */}
        <div className="space-y-6">
          
          {/* Section Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            {showFavoritesOnly ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center shadow-xs">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#002f34] tracking-tight">
                      Saved Favorites ({displayedProducts.length})
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Items you have bookmarked for quick inspection and WhatsApp messaging
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                >
                  ← Browse All Listings
                </button>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#002f34] tracking-tight">
                      Fresh recommendations
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live
                    </span>
                  </div>
                  {category !== 'All' && (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Filtering by category: <span className="font-bold text-[#002f34]">{category}</span>
                    </p>
                  )}
                </div>

                {/* Quick Filters: Condition & Sort */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Condition Filter */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-[#002f34] shadow-2xs">
                    <span className="font-bold text-slate-400">Condition:</span>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="font-bold bg-transparent outline-none cursor-pointer text-[#002f34]"
                    >
                      <option value="All">All Conditions</option>
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Gently Used">Gently Used</option>
                      <option value="Fair">Fair Condition</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-[#002f34] shadow-2xs">
                    <span className="font-bold text-slate-400">Sort by:</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="font-bold bg-transparent outline-none cursor-pointer text-[#002f34]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Product Grid / Loading / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  currentUser={currentUser}
                  onMarkSold={handleMarkSold}
                  onDelete={handleDeleteProduct}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  isFavorite={favorites.some((favId) => String(favId) === String(product._id))}
                  onToggleFavorite={handleToggleFavorite}
                  isFavoriteView={showFavoritesOnly}
                  onReport={(p) => setReportingProduct(p)}
                />
              ))}

              {/* Promo Card ("Want to see your stuff here?") */}
              {!showFavoritesOnly && (
                <div className="product-card border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between items-center text-center bg-white/70 hover:bg-white hover:border-teal-500 transition-all">
                  <div className="space-y-3.5 my-auto">
                    <div className="w-14 h-14 rounded-2xl bg-[#ffce32] flex items-center justify-center mx-auto text-[#002f34] shadow-md shadow-[#ffce32]/30">
                      <Plus className="w-7 h-7 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-black text-[#002f34] leading-snug">
                      Want to see your stuff here?
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                      Earn extra money by selling your textbooks, cycles, and hostel items to campus peers.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenSell}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#002f34] hover:bg-[#00474f] active:scale-95 transition-all shadow-xs cursor-pointer mt-4"
                  >
                    Start Selling Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 px-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-18 h-18 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                {showFavoritesOnly ? (
                  <Heart className="w-9 h-9 text-rose-400" />
                ) : (
                  <ShoppingBag className="w-9 h-9" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#002f34]">
                  {showFavoritesOnly ? 'No saved favorites yet' : 'Oops... No ads found'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-xs mx-auto">
                  {showFavoritesOnly
                    ? 'Click the heart icon on any ad card to save it here for later.'
                    : search || category !== 'All'
                    ? 'Try changing your search keywords or switching category to All.'
                    : 'Be the first student to post an ad in this category!'}
                </p>
              </div>
              <div className="pt-2">
                {showFavoritesOnly ? (
                  <button
                    onClick={() => setShowFavoritesOnly(false)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#002f34] hover:bg-[#00474f] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Browse All Ads
                  </button>
                ) : (
                  <button
                    onClick={handleOpenSell}
                    className="px-5 py-2.5 text-xs font-bold text-[#002f34] bg-[#ffce32] hover:bg-[#ffd753] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Post an Ad
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Campus Connect Mobile Promo Strip */}
        <div className="bg-gradient-to-r from-white via-slate-50 to-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#002f34] to-[#004f56] text-[#23e5db] flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#002f34] tracking-tight">
                TRY THE CAMPUS CONNECT PLATFORM
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Buy, sell and find just about anything from verified students across Kongu Engineering College.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenSell}
              className="px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-[#002f34] hover:bg-[#00474f] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Post Free Ad Now
            </button>
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setCategory(cat);
          setShowFavoritesOnly(false);
        }}
        onSelectLocation={(loc) => {
          setLocationFilter(loc);
          setShowFavoritesOnly(false);
        }}
      />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currentUser={currentUser}
        onMarkSold={handleMarkSold}
        onDelete={handleDeleteProduct}
        isFavorite={selectedProduct ? favorites.some((favId) => String(favId) === String(selectedProduct._id)) : false}
        onToggleFavorite={handleToggleFavorite}
        onReport={(p) => setReportingProduct(p)}
      />

      <ReportModal
        product={reportingProduct}
        isOpen={!!reportingProduct}
        onClose={() => setReportingProduct(null)}
        currentUser={currentUser}
        onReportSuccess={(msg) => showToast(msg, 'success')}
        onRequireAuth={() => {
          showToast('Please sign in with your college account to report listings.', 'info');
          setShowLoginGateway(true);
        }}
      />

      <PostProductModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onProductCreated={loadProducts}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('seller')}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authRole}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadProducts();
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    </div>
  );
}
