import React from 'react';
import {
  Heart,
  MessageCircle,
  MapPin,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  BookOpen,
  Laptop,
  FlaskConical,
  Armchair,
  HelpCircle,
  Clock,
  Sparkles,
  Flag,
  ShieldCheck,
} from 'lucide-react';

const categoryIcons = {
  Books: BookOpen,
  Electronics: Laptop,
  'Lab Equipment': FlaskConical,
  Furniture: Armchair,
  Others: HelpCircle,
};

const conditionColors = {
  'Brand New': { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50/90' },
  'Like New': { dot: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50/90' },
  'Gently Used': { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50/90' },
  'Fair': { dot: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50/90' },
};

export default function ProductCard({
  product,
  currentUser,
  onMarkSold,
  onDelete,
  onSelectProduct,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteView = false,
  onReport,
}) {
  const {
    _id,
    title,
    description,
    category,
    condition = 'Like New',
    price,
    imageUrl,
    seller,
    createdAt,
  } = product;

  // Format WhatsApp link
  const rawNumber = seller?.whatsappNumber || '';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const whatsappMessage = encodeURIComponent(
    `Hi ${seller?.name || 'Seller'}, I am interested in your listing "${title}" (₹${price}) on Campus Connect. Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${whatsappMessage}`;

  const CategoryIcon = categoryIcons[category] || ShoppingBag;
  const conditionStyle = conditionColors[condition] || conditionColors['Like New'];

  // Time formatting
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const isOwner = currentUser && (
    currentUser.id === seller?._id ||
    currentUser._id === seller?._id ||
    currentUser.id === seller
  );

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="product-card group relative flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-6">
            <CategoryIcon className="w-12 h-12 stroke-[1.5] text-slate-300 mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Favorite Heart Button (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(_id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 z-20 cursor-pointer ${
            isFavorite
              ? 'bg-white text-rose-500 ring-2 ring-rose-400/50 shadow-rose-200'
              : 'bg-white/85 text-slate-600 hover:bg-white hover:text-rose-500 hover:scale-110'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isFavorite
                ? 'fill-rose-500 text-rose-500 animate-heart-pop'
                : 'stroke-[2.2]'
            }`}
          />
        </button>

        {/* Condition Tag Pill (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md shadow-xs ${conditionStyle.bg} ${conditionStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${conditionStyle.dot} animate-pulse`} />
            {condition}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Category Pill */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-2xl font-black text-[#002f34] tracking-tight">
              ₹ {Number(price || 0).toLocaleString('en-IN')}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              <CategoryIcon className="w-3 h-3 text-[#002f34]" />
              {category}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-bold text-[#002f34] line-clamp-1 group-hover:text-[#004f56] transition-colors"
            title={title}
          >
            {title}
          </h3>

          {/* Description snippet */}
          <p
            className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium leading-relaxed"
            title={description}
          >
            {description}
          </p>
        </div>

        {/* Bottom Section: Seller, Verification, Location & Date */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
          
          {/* Seller Name & Verified Student Badge & Report Link */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[110px]" title={seller?.name || 'Campus Student'}>
                {seller?.name || 'Campus Student'}
              </span>
              {seller?.isVerifiedStudent && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 shrink-0"
                  title="College Email Verified Student"
                >
                  Verified Student 🛡️
                </span>
              )}
            </div>

            {/* Report Listing Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onReport) onReport(product);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer shrink-0"
              title="Report this listing"
            >
              <Flag className="w-3 h-3" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <div className="flex items-center gap-1 text-slate-500 truncate max-w-[150px]" title={seller?.hostelBlock || 'KEC Campus'}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{seller?.hostelBlock || 'Campus Hostels'}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatTimeAgo(createdAt)}</span>
            </div>
          </div>

          {/* WhatsApp Action Button */}
          <a
            href={formattedNumber ? whatsappUrl : '#'}
            target={formattedNumber ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (!formattedNumber) {
                e.preventDefault();
                alert('Seller has not provided a valid WhatsApp number.');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs shadow-emerald-700/20 cursor-pointer z-10"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Remove Favorite Button when in Favorites View */}
          {isFavoriteView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(_id);
              }}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              title="Remove from saved favorites"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Remove from Favorites</span>
            </button>
          )}

          {/* Owner options: Mark Sold & Remove or Delete */}
          {isOwner && (
            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              {onMarkSold && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkSold(_id);
                  }}
                  className="flex-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Sold</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(_id);
                  }}
                  className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  title="Delete listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
