import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  Plus,
  User,
  LogOut,
  GraduationCap,
  Store,
  Building2,
  Sparkles,
  Heart,
  X,
} from 'lucide-react';

export default function Navbar({
  currentUser,
  onOpenSellModal,
  onOpenAuthModal,
  onLogout,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  category,
  setCategory,
  favoritesCount = 0,
  showFavoritesOnly = false,
  onToggleFavoritesView,
}) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const locationRef = useRef(null);
  const roleRef = useRef(null);

  const LOCATIONS = [
    'All Campus',
    'Hostel Block A (Boys)',
    'Hostel Block B (Boys)',
    'Hostel Block C (Girls)',
    'Engineering & Lab Block',
    'Main Library & Study Area',
    'Staff Quarters',
  ];

  const CATEGORIES = [
    'Books',
    'Electronics',
    'Lab Equipment',
    'Furniture',
    'Others',
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 transition-all">
      
      {/* 1. Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Campus Connect Brand Logo */}
          <div
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
            onClick={() => {
              setCategory('All');
              setSearch('');
              if (showFavoritesOnly && onToggleFavoritesView) onToggleFavoritesView();
            }}
          >
            {/* Logo Icon Badge */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#002f34] to-[#004f56] flex items-center justify-center text-white shadow-sm border border-[#23e5db]/40 group-hover:scale-105 group-hover:border-[#23e5db] transition-all">
              <svg className="w-5 h-5 text-[#23e5db]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            {/* Logo Text */}
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002f34]">
                CAMPUS
              </span>
              <span className="ml-1 sm:ml-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black tracking-wider uppercase bg-[#ffce32] text-[#002f34] shadow-xs">
                CONNECT
              </span>
            </div>
          </div>

          {/* Location Selector */}
          <div className="relative hidden md:block w-56 lg:w-64" ref={locationRef}>
            <div
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#002f34] shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-[#002f34] truncate">
                  {locationFilter || 'All Campus'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#002f34] transition-colors shrink-0" />
            </div>

            {locationOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocationFilter(loc === 'All Campus' ? '' : loc);
                      setLocationOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer ${
                      (locationFilter === loc || (!locationFilter && loc === 'All Campus'))
                        ? 'bg-teal-50/80 text-[#002f34] font-black'
                        : 'text-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Search Bar */}
          <div className="flex-1 flex items-stretch max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find Books, Laptops, Drafters, Cycles..."
                className="w-full h-11 pl-4 pr-9 bg-slate-50 hover:bg-white focus:bg-white border border-r-0 border-slate-200 focus:border-[#002f34] rounded-l-xl text-xs sm:text-sm font-medium text-[#002f34] placeholder-slate-400 outline-none transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {}}
              className="w-11 sm:w-12 h-11 bg-[#002f34] hover:bg-[#00474f] active:scale-98 text-white flex items-center justify-center rounded-r-xl transition-all cursor-pointer shrink-0 shadow-xs"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Saved Favorites Heart Toggle Button */}
          <button
            type="button"
            onClick={onToggleFavoritesView}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
              showFavoritesOnly
                ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-300 shadow-sm'
                : 'text-[#002f34] hover:bg-slate-100'
            }`}
            title={showFavoritesOnly ? 'Show all listings' : 'View saved favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                favoritesCount > 0
                  ? 'fill-rose-500 text-rose-500'
                  : showFavoritesOnly
                  ? 'text-rose-500'
                  : 'text-[#002f34]'
              }`}
            />
            {favoritesCount > 0 && (
              <span className="bg-rose-500 text-white rounded-full text-[10px] font-black px-1.5 py-0.2 min-w-4.5 text-center shadow-xs">
                {favoritesCount}
              </span>
            )}
            <span className="hidden xl:inline text-xs font-bold">
              {showFavoritesOnly ? (favoritesCount > 0 ? 'Favorites Active' : 'Favorites') : 'Saved'}
            </span>
          </button>

          {/* User Profile / Login Portals */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 bg-white shadow-2xs"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                    currentUser.role === 'staff' ? 'bg-amber-600 text-white' : currentUser.role === 'seller' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left -space-y-0.5">
                    <span className="text-xs font-bold text-[#002f34] max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                      {currentUser.role === 'staff' ? '🏛️ Faculty' : currentUser.role === 'seller' ? '🏷️ Seller' : '🎓 Student'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                      <p className="text-xs font-black text-[#002f34] truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-teal-800 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <span>{currentUser.role === 'staff' ? '🏛️ Faculty / Staff' : currentUser.role === 'seller' ? '🏷️ Campus Seller' : '🎓 Student'}</span>
                        {currentUser.isVerifiedStudent && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-sky-50 text-sky-700 border border-sky-200" title="College Email Verified Student">
                            Verified 🛡️
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {currentUser.hostelBlock || currentUser.department || currentUser.storeName || 'Campus'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenSellModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#002f34] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#002f34]" />
                      <span>Post a Listing</span>
                    </button>

                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Switch Role / Portal</span>
                    </button>

                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black text-white bg-[#002f34] hover:bg-[#00474f] active:scale-95 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ffce32]" />
                <span>Sign In / Select Role</span>
              </button>
            )}

            {/* "+ SELL" Action Button */}
            <button
              type="button"
              onClick={onOpenSellModal}
              className="p-[3px] rounded-full bg-gradient-to-tr from-[#ffce32] via-[#23e5db] to-[#3a77ff] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              title="Post free classified ad"
            >
              <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white text-[#002f34] font-black text-xs sm:text-sm tracking-wider hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4 stroke-[3] text-[#002f34]" />
                <span>SELL</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Header: ALL CATEGORIES Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-6 h-10 overflow-x-auto scrollbar-none text-xs font-bold text-[#002f34]">
            
            {/* ALL CATEGORIES Button */}
            <button
              type="button"
              onClick={() => setCategory('All')}
              className={`flex items-center gap-1 uppercase tracking-wider py-1 cursor-pointer transition-colors ${
                category === 'All' ? 'text-[#002f34] font-black border-b-2 border-[#002f34]' : 'text-slate-600 hover:text-[#002f34]'
              }`}
            >
              <span>ALL CATEGORIES</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Category Links */}
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-1 cursor-pointer whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'text-[#002f34] font-black border-b-2 border-[#002f34]'
                    : 'text-slate-600 hover:text-[#002f34]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
