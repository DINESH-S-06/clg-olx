import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  Heart,
  Share2,
  Trash2,
  CheckCircle2,
  BookOpen,
  Laptop,
  FlaskConical,
  Armchair,
  HelpCircle,
  ShoppingBag,
  GraduationCap,
  Store,
  Building2,
  Copy,
  Check,
  Sparkles,
  Flag,
} from 'lucide-react';

const categoryIcons = {
  Books: BookOpen,
  Electronics: Laptop,
  'Lab Equipment': FlaskConical,
  Furniture: Armchair,
  Others: HelpCircle,
};

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  currentUser,
  onMarkSold,
  onDelete,
  isFavorite = false,
  onToggleFavorite,
  onReport,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

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

  // WhatsApp formatting
  const rawNumber = seller?.whatsappNumber || '';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const whatsappMessage = encodeURIComponent(
    `Hi ${seller?.name || 'Seller'}, I am interested in your listing "${title}" priced at ₹${price} on Campus Connect. Is it still available for inspection on campus?`
  );
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${whatsappMessage}`;

  const CategoryIcon = categoryIcons[category] || ShoppingBag;

  const isOwner =
    currentUser &&
    (currentUser.id === seller?._id ||
      currentUser._id === seller?._id ||
      currentUser.id === seller);

  const formatFullDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCopyPhone = () => {
    if (seller?.whatsappNumber) {
      navigator.clipboard.writeText(seller.whatsappNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#f4f6f8] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        
        {/* Top Header / Breadcrumb Bar */}
        <div className="bg-white px-5 sm:px-7 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold truncate">
            <span>Campus</span>
            <span>/</span>
            <span className="text-[#002f34] font-bold">{category}</span>
            <span>/</span>
            <span className="text-slate-700 font-medium truncate max-w-[180px] sm:max-w-xs">{title}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close ad"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[85vh] overflow-y-auto">
          
          {/* LEFT 2 COLUMNS: Image & Description */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Main Product Image Container */}
            <div className="relative aspect-[4/3] w-full bg-slate-900/5 rounded-2xl border border-slate-200/90 overflow-hidden flex items-center justify-center shadow-xs">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-contain bg-slate-900/10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-8">
                  <CategoryIcon className="w-16 h-16 stroke-[1.5] text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Image Available</span>
                </div>
              )}

              {/* Wishlist Heart on top right */}
              <button
                type="button"
                onClick={() => onToggleFavorite && onToggleFavorite(_id)}
                className={`absolute top-3.5 right-3.5 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 cursor-pointer z-10 ${
                  isFavorite
                    ? 'bg-white text-rose-500 ring-2 ring-rose-400/50 shadow-rose-200'
                    : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500 hover:scale-105'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500 animate-heart-pop' : 'stroke-[2.2]'}`} />
              </button>

              {/* Condition Badge on bottom left */}
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#002f34] text-white uppercase tracking-wider shadow-md backdrop-blur-md">
                  {condition}
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-[#002f34] uppercase tracking-wider border-b border-slate-100 pb-2">
                Description & Details
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {description}
              </p>
            </div>

            {/* Safety Advice Box */}
            <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Campus Safety Recommendation</span>
              </div>
              <ul className="text-xs text-emerald-800/90 space-y-1 list-disc list-inside font-medium leading-relaxed">
                <li>Meet in high-visibility campus spots (Library, Cafeteria, Department Quadrangle).</li>
                <li>Inspect and test the item thoroughly before making any payment.</li>
                <li>Never share UPI/banking OTPs or pay advance deposits online.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Price, WhatsApp Button & Seller Card */}
          <div className="space-y-4">
            
            {/* Price & Title Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <div className="text-3xl font-black text-[#002f34] tracking-tight">
                ₹ {Number(price || 0).toLocaleString('en-IN')}
              </div>

              <h1 className="text-lg font-bold text-[#002f34] leading-snug">
                {title}
              </h1>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {seller?.hostelBlock || 'KEC Campus'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatFullDate(createdAt)}
                </span>
              </div>
            </div>

            {/* Primary Action: Direct WhatsApp Chat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
              <a
                href={formattedNumber ? whatsappUrl : '#'}
                target={formattedNumber ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!formattedNumber) {
                    e.preventDefault();
                    alert('Seller has not provided a valid WhatsApp number.');
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span>Chat on WhatsApp</span>
              </a>

              {seller?.whatsappNumber && (
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#002f34] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied {seller.whatsappNumber}!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Number: {seller.whatsappNumber}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => onToggleFavorite && onToggleFavorite(_id)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isFavorite
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                <span>{isFavorite ? 'Remove from Saved Favorites' : 'Save to Favorites'}</span>
              </button>
            </div>

            {/* Seller Profile Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Seller Information
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#002f34] to-[#004f56] text-white flex items-center justify-center font-black text-lg uppercase shrink-0 shadow-sm">
                  {seller?.name ? seller.name.charAt(0) : 'U'}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-[#002f34] truncate">
                      {seller?.name || 'Campus Student'}
                    </span>
                    {seller?.isVerifiedStudent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                        Verified Student 🛡️
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{seller?.hostelBlock || 'Resident Student'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50/50 py-2 px-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>College Community Verified</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Report Listing Trigger in Details Card */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Spot an issue with this ad?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onReport) onReport(product);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50"
                  title="Report listing to campus moderators"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Report Listing</span>
                </button>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                  Listing Management
                </span>
                <div className="flex items-center gap-2">
                  {onMarkSold && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkSold(_id);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Mark as Sold</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(_id);
                        onClose();
                      }}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
