import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Clock, 
  User, 
  Flame, 
  Star, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Article } from '../../types';

interface HeroFeaturedProps {
  featuredArticle: Article | null;
  breakingArticles?: Article[];
  sideArticles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  featuredArticle,
  breakingArticles = [],
  sideArticles,
  onReadArticle,
  onNavigateCategory,
}) => {
  // Use breaking articles (capped at 30 newest) if available, otherwise fall back to featured article
  const rawSlides = breakingArticles.length > 0 
    ? breakingArticles 
    : (featuredArticle ? [featuredArticle] : []);

  // Limit to at most 30 cover images at a time (FIFO / newest first)
  const slides = rawSlides.slice(0, 30);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Automated transition from one cover image to another every 4.5 seconds
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  const currentArticle = slides[currentIndex] || slides[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const formattedDate = currentArticle.published_at
    ? new Date(currentArticle.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Main Hero Slider with Transitioning Cover Images (8 cols on lg) */}
          <div className="lg:col-span-8 flex flex-col">
            <div 
              className="relative group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Transitioning Image Showcase */}
              <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-slate-900 select-none">
                {/* Images Layer with Cross-fade Transition */}
                {slides.map((article, idx) => (
                  <div
                    key={article.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-900/20"></div>
                  </div>
                ))}

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20 pointer-events-none">
                  <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
                    <span className="bg-orange-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md flex items-center gap-1.5 animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
                      <span>BREAKING CAMPUS ALERT</span>
                    </span>

                    {currentArticle.category_name && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateCategory(currentArticle.category_name!.toLowerCase());
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-md transition-colors"
                      >
                        {currentArticle.category_name}
                      </button>
                    )}

                    {currentArticle.institution && (
                      <span className="bg-slate-900/85 backdrop-blur-md text-sky-200 text-xs font-medium px-2.5 py-1 rounded-md">
                        {currentArticle.institution}
                      </span>
                    )}
                  </div>

                  {/* Counter Badge (e.g. 1 / 14 • Max 30) */}
                  {slides.length > 1 && (
                    <div className="bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/10 shrink-0 pointer-events-auto">
                      {currentIndex + 1} / {slides.length}
                    </div>
                  )}
                </div>

                {/* Prev & Next Arrow Controls */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg hover:scale-110 focus:outline-none"
                      title="Previous breaking cover"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg hover:scale-110 focus:outline-none"
                      title="Next breaking cover"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                  <h1 
                    onClick={() => onReadArticle(currentArticle.slug)}
                    className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-md cursor-pointer hover:text-amber-200 transition-colors line-clamp-2"
                  >
                    {currentArticle.title}
                  </h1>
                </div>

                {/* Bottom Slide Indicator Dots / Progress Bars */}
                {slides.length > 1 && (
                  <div className="absolute bottom-1.5 left-4 right-4 z-20 flex items-center justify-center gap-1.5 overflow-hidden">
                    {slides.slice(0, 30).map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentIndex(dotIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === currentIndex 
                            ? 'w-6 bg-amber-400' 
                            : 'w-1.5 bg-white/40 hover:bg-white/80'
                        }`}
                        title={`Go to breaking image ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Excerpt and CTA button */}
              <div className="p-5 sm:p-6 bg-white space-y-4">
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {currentArticle.excerpt}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <User className="w-4 h-4 text-sky-600" />
                      <span>{currentArticle.author_name}</span>
                    </div>
                    {formattedDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onReadArticle(currentArticle.slug)}
                    className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Trending / Most Read Educational News (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-ping"></div>
                  <h2 className="font-bold text-slate-900 text-base uppercase tracking-wider">
                    Trending On Campus
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  Live Feed
                </span>
              </div>

              {/* List of all side items / live feed */}
              <div className="space-y-3.5 divide-y divide-slate-100 grow max-h-[480px] overflow-y-auto pr-1.5 overscroll-contain">
                {sideArticles.map((item, idx) => (
                  <article
                    key={item.id}
                    onClick={() => onReadArticle(item.slug)}
                    className={`group cursor-pointer ${idx > 0 ? 'pt-3.5' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {item.category_name || 'News'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              {/* Direct WhatsApp Guidance box */}
              <div className="mt-5 pt-4 border-t border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 p-3.5 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Need Admission Guidance?</h4>
                    <p className="text-[11px] text-slate-600">Chat with LegitSchoolGists verified mentors</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/2349039733298?text=Hello%20LegitSchoolGists%2C%20I%20need%20academic%20guidance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 block text-center bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs py-2 px-3 rounded-lg border border-emerald-300 shadow-sm transition-all"
                >
                  Contact Desk on WhatsApp (+234 903 973 3298)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
