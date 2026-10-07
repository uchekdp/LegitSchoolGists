import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Filter, ArrowUpDown } from 'lucide-react';
import { Article, Category } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface CategoryViewProps {
  category: Category;
  articles: Article[];
  onReadArticle: (slug: string) => void;
  onBack: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  articles,
  onReadArticle,
  onBack,
}) => {
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-700 hover:text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Category Archive • {articles.length} published articles
          </span>
        </div>

        {/* Category Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full filter blur-3xl opacity-60 -z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-2">
                Official Category Archive
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
                {category.name}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                {category.description || `All verified updates, official circulars, and educational news relating to ${category.name} across Nigerian tertiary institutions.`}
              </p>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 text-xs">
              <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  sortBy === 'latest' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  sortBy === 'views' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Most Read
              </button>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {sortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Articles Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are currently no published articles in this category. Check back shortly for new educational bulletins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
