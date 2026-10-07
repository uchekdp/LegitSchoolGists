import React from 'react';
import { Layers, X, Filter } from 'lucide-react';
import { Category, Article } from '../../types';

interface CategoryFilterBarProps {
  categories: Category[];
  articles?: Article[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  // Only show categories that either have articles or are primary channels
  const activeCategories = categories;

  return (
    <div className="bg-white border-y border-slate-200/80 shadow-xs py-3.5 sticky top-14 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Label */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Filter by Category:</span>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full grow">
            {/* "All Stories" Pill */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategoryId === null
                  ? 'bg-sky-700 text-white shadow-sm ring-2 ring-sky-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All News & Gists</span>
            </button>

            {/* Dynamic Category Pills */}
            {activeCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-700 text-white shadow-sm ring-2 ring-sky-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filter Button if active */}
          {selectedCategoryId !== null && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold shrink-0 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
              title="Clear category filter"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
