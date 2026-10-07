import React from 'react';
import { Flame, ArrowRight, Bell, Zap, Clock } from 'lucide-react';
import { Article } from '../../types';

interface BreakingUpdatesFeedProps {
  articles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const BreakingUpdatesFeed: React.FC<BreakingUpdatesFeedProps> = ({
  articles,
  onReadArticle,
  onNavigateCategory,
}) => {
  // Strictly capped at exactly 30 posts
  const breakingList = articles.slice(0, 30);

  if (breakingList.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-10">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 sm:px-7 py-4.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute inline-flex"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 relative inline-flex"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400 fill-red-400" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                Breaking Updates
              </h2>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block mt-0.5">
              Instant campus news wire, examination notices & verified circulars
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateCategory('breaking-updates')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>All Updates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 30 Posts - Clean List with Small Cover Images (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 divide-y md:divide-y-0 divide-slate-100">
          {breakingList.map((article) => {
            const timeAgo = formatTimeOrDate(article.published_at);
            const coverImage = article.featured_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80';

            return (
              <article
                key={article.id}
                onClick={() => onReadArticle(article.slug)}
                className="group flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200/80 transition-all cursor-pointer"
              >
                {/* Small-Size Cover Image Thumbnail */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs group-hover:border-sky-300 transition-colors">
                  <img
                    src={coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>

                {/* Title and subtle meta */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 leading-snug line-clamp-2 transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 truncate max-w-[120px]">
                      {article.category_name || 'Breaking'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {timeAgo}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Subtle Footer Bar */}
      <div className="bg-white px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Updates are published in real-time as verified by our editorial desk.</span>
        </div>
        <button
          onClick={() => onNavigateCategory('breaking-updates')}
          className="text-sky-600 hover:text-sky-700 font-bold hover:underline"
        >
          Explore Breaking Updates Archive &rarr;
        </button>
      </div>
    </section>
  );
};

function formatTimeOrDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return `${diffDays}d ago`;
      }
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  } catch {
    return 'Recent';
  }
}
