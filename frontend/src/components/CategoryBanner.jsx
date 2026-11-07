import React from 'react';
import {
  BookOpen,
  Laptop,
  FlaskConical,
  Armchair,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageCircle,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Books',
    label: 'Books & Notes',
    sub: 'Textbooks & Study Material',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Electronics',
    label: 'Electronics',
    sub: 'Laptops, Gadgets & Cables',
    icon: Laptop,
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'Lab Equipment',
    label: 'Lab & Tools',
    sub: 'Drafters, Aprons & Kits',
    icon: FlaskConical,
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50 text-amber-600',
  },
  {
    name: 'Furniture',
    label: 'Hostel Furniture',
    sub: 'Chairs, Tables & Mattresses',
    icon: Armchair,
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    name: 'Others',
    label: 'Other Items',
    sub: 'Bicycles, Sports & More',
    icon: HelpCircle,
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50 text-rose-600',
  },
];

export default function CategoryBanner({ selectedCategory, onSelectCategory, onPostAd }) {
  return (
    <div className="space-y-6">
      
      {/* 1. Hero Promotional Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#002227] via-[#00383f] to-[#001f23] text-white p-7 sm:p-10 shadow-lg border border-teal-900/40">
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-[#23e5db]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-[#ffce32]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            {/* Campus Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffce32] text-[#002f34] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-[#002f34]" />
              <span>Kongu Engineering College • Official Student Hub</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Buy, Sell & Connect <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#23e5db] via-teal-200 to-white">
                Across Your Campus
              </span>
            </h1>

            {/* Sub-text */}
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Textbooks, calculators, cycles, lab kits, and hostel essentials. Chat directly with verified peers on WhatsApp with 0% platform fee.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs font-semibold text-teal-100">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Zap className="w-3.5 h-3.5 text-[#ffce32]" />
                0% Commission
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#23e5db]" />
                100% Student Verified
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Direct WhatsApp Chat
              </span>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPostAd}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-[#002f34] bg-[#ffce32] hover:bg-[#ffd753] active:scale-95 transition-all duration-200 shadow-xl shadow-[#ffce32]/25 cursor-pointer"
            >
              <span>+ Post Ad for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Browse Categories Section */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-[#002f34]">
              Browse Categories
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Explore listings tailored for every college department
            </p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectCategory('All')}
              className="text-xs font-extrabold text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                type="button"
                key={cat.name}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
                className={`group flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-[#002f34] bg-teal-50/60 ring-2 ring-[#002f34] shadow-md -translate-y-1'
                    : 'border-slate-200/90 hover:border-teal-500/40 hover:bg-slate-50/80 hover:-translate-y-1 hover:shadow-md'
                }`}
              >
                {/* Icon Container with vibrant gradient on hover */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                    isSelected
                      ? `bg-gradient-to-br ${cat.gradient} text-white shadow-md`
                      : `${cat.lightBg} group-hover:bg-gradient-to-br group-hover:${cat.gradient} group-hover:text-white`
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>

                <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-[#002f34] font-black' : 'text-slate-800'}`}>
                  {cat.label}
                </span>

                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] mt-0.5">
                  {cat.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
