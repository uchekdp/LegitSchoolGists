import React from 'react';
import { GraduationCap, Home, Search, BookOpen, ArrowRight } from 'lucide-react';
import { Article } from '../../types';

interface NotFoundViewProps {
  popularArticles: Article[];
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onReadArticle: (slug: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  popularArticles,
  onNavigateHome,
  onOpenSearch,
  onReadArticle,
}) => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-200">
          <GraduationCap className="w-10 h-10" />
        </div>

        <span className="text-orange-600 font-black text-sm uppercase tracking-widest">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3">
          Educational Circular Not Found
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto mb-8">
          The campus news article, scholarship notice, or admission page you requested may have been moved, updated, or archived.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={onNavigateHome}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl border border-slate-300 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-600" />
            <span>Search Educational Archives</span>
          </button>
        </div>

        {/* Popular Articles List */}
        {popularArticles.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-left">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Trending Educational Updates Right Now</span>
            </h3>

            <div className="space-y-3 divide-y divide-slate-100">
              {popularArticles.slice(0, 4).map((art) => (
                <div
                  key={art.id}
                  onClick={() => onReadArticle(art.slug)}
                  className="pt-3 first:pt-0 cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase">
                      {art.category_name}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {art.title}
                    </h4>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
