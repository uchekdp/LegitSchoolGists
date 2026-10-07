import React from 'react';
import { Clock, User, ArrowRight, ShieldCheck, Flame, Bookmark } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  onReadArticle: (slug: string) => void;
  variant?: 'standard' | 'compact' | 'featured' | 'horizontal';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onReadArticle,
  variant = 'standard',
}) => {
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getCategoryColor = (catName?: string) => {
    switch (catName?.toLowerCase()) {
      case 'jamb':
        return 'bg-emerald-600 text-white';
      case 'admission':
      case 'post-utme':
        return 'bg-sky-600 text-white';
      case 'scholarships':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'waec':
      case 'neco':
        return 'bg-indigo-600 text-white';
      case 'career':
        return 'bg-orange-600 text-white';
      case 'nuc & accreditation':
        return 'bg-blue-800 text-white';
      default:
        return 'bg-sky-700 text-white';
    }
  };

  if (variant === 'horizontal') {
    return (
      <article
        onClick={() => onReadArticle(article.slug)}
        className="group flex flex-col sm:flex-row gap-4 bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="w-full sm:w-48 aspect-[16/10] sm:h-36 shrink-0 relative rounded-lg overflow-hidden bg-slate-100">
          <img
            src={article.featured_image}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.is_breaking && (
            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              BREAKING
            </span>
          )}
        </div>
        <div className="flex flex-col justify-between grow">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getCategoryColor(article.category_name)}`}>
                {article.category_name || 'News'}
              </span>
              {article.institution && (
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded truncate max-w-[200px]">
                  {article.institution}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 text-base leading-snug">
              {article.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
            <span className="text-sky-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Read Update <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onReadArticle(article.slug)}
      className="group flex flex-col bg-white rounded-xl border border-slate-200/90 hover:border-sky-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full"
    >
      {/* Featured Image Banner with Uniform Aspect Ratio */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={article.featured_image}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm ${getCategoryColor(article.category_name)}`}>
            {article.category_name || 'Education'}
          </span>
          {article.is_breaking && (
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-current" /> BREAKING
            </span>
          )}
        </div>

        {article.institution && (
          <div className="absolute bottom-2 left-3 right-3">
            <span className="text-[11px] bg-slate-900/80 backdrop-blur-sm text-sky-200 font-medium px-2 py-0.5 rounded truncate max-w-full inline-block">
              {article.institution}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 text-base sm:text-lg leading-snug">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px] text-slate-600 font-medium">{article.author_name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
