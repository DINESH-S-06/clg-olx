import React from 'react';
import {
  Search,
  X,
  BookOpen,
  Laptop,
  FlaskConical,
  Armchair,
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Books', icon: BookOpen },
  { name: 'Electronics', icon: Laptop },
  { name: 'Lab Equipment', icon: FlaskConical },
  { name: 'Furniture', icon: Armchair },
  { name: 'Others', icon: HelpCircle },
];

const CONDITIONS = [
  'All',
  'Brand New',
  'Like New',
  'Gently Used',
  'Heavily Used',
];

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  condition,
  setCondition,
  sort,
  setSort,
  availableOnly,
  setAvailableOnly,
  totalResults,
}) {
  const hasActiveFilters = search || category !== 'All' || condition !== 'All' || availableOnly || sort !== 'newest';

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setCondition('All');
    setSort('newest');
    setAvailableOnly(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xl shadow-slate-200/40 space-y-5">
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Large Prominent Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search textbooks, calculators, drafters, cycles, mattresses, lab coats..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          {/* Category Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c.name !== 'All').map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="w-full sm:w-40">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3.5 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <option value="All">Any Condition</option>
              {CONDITIONS.filter((c) => c !== 'All').map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3.5 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              <option value="newest">🔥 Newest First</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="oldest">⏳ Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Icon Rail & Live Result Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        
        {/* Horizontal Category Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.03]'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Toggles & Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-semibold text-slate-600 shrink-0">
          
          {/* Hide Sold Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-700">Available Only</span>
          </label>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Result Count Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-bold">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalResults} {totalResults === 1 ? 'item' : 'items'} found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
