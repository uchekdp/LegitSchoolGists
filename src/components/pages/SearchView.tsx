import React, { useState } from 'react';
import { Search, X, ArrowLeft, Filter, BookOpen } from 'lucide-react';
import { Article, Category } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface SearchViewProps {
  articles: Article[];
  categories: Category[];
  initialQuery?: string;
  onReadArticle: (slug: string) => void;
  onBack: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  articles,
  categories,
  initialQuery = '',
  onReadArticle,
  onBack,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredArticles = articles.filter((art) => {
    const q = query.trim().toLowerCase();
    const matchesCategory =
      selectedCategory === 'all' || art.category_id === selectedCategory || art.category_name?.toLowerCase() === selectedCategory;

    if (!matchesCategory) return false;
    if (!q) return true;

    return (
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q) ||
      (art.institution && art.institution.toLowerCase().includes(q)) ||
      (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-700 hover:text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to News Feed</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            Search LegitSchoolGists Educational Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Search for JAMB cut-off marks, Post-UTME registration dates, university admission lists, or scholarships.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keyword (e.g. UNILAG Post-UTME, CAPS, BEA scholarship, WAEC timetable...)"
              autoFocus
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">
            Search Results
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'} matching
          </span>
        </div>

        {/* Results Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Matching Articles</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any news articles matching "{query}". Try checking your spelling or searching for a broader keyword like "JAMB" or "Admission".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
