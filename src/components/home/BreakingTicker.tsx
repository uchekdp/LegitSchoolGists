import React from 'react';
import { Flame } from 'lucide-react';
import { Article } from '../../types';

interface BreakingTickerProps {
  articles: Article[];
  onReadArticle: (slug: string) => void;
  announcement?: string;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  articles,
  onReadArticle,
  announcement,
}) => {
  if (!articles || articles.length === 0) return null;

  // Build the items list with all article titles
  const items = [
    ...(announcement ? [{ id: 'announcement', title: announcement, slug: '' }] : []),
    ...articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug })),
  ];

  // Duplicate items for a continuous, seamless loop
  const loopItems = [...items, ...items];

  return (
    <div className="bg-sky-50 border-y border-sky-200/90 py-2.5 px-4 sm:px-6 lg:px-8 overflow-hidden relative shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs sm:text-sm">
        {/* Badge on Left */}
        <div className="flex items-center gap-2 shrink-0 z-10 bg-sky-50 pr-2">
          <span className="bg-orange-600 text-white font-bold px-2.5 py-1 rounded-md text-[11px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
            <span>BREAKING UPDATES</span>
          </span>
        </div>

        {/* Continuous sliding track displaying all article titles from left to right */}
        <div className="grow overflow-hidden relative flex items-center h-6">
          <div className="animate-ticker-ltr flex items-center gap-5">
            {loopItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-3 shrink-0">
                {item.slug ? (
                  <button
                    onClick={() => onReadArticle(item.slug)}
                    className="inline-flex items-center gap-2 font-semibold text-slate-800 hover:text-sky-700 hover:underline transition-colors group cursor-pointer text-xs sm:text-sm whitespace-nowrap"
                    title={`Read: ${item.title}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-125 transition-transform shrink-0"></span>
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 font-semibold text-sky-900 text-xs sm:text-sm whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{item.title}</span>
                  </span>
                )}
                <span className="text-slate-300 select-none text-xs">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

