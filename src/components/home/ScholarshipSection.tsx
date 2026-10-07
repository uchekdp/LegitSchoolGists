import React, { useState } from 'react';
import { Award, Globe, BookOpen, Clock, ArrowRight, ExternalLink, Filter, CheckCircle2 } from 'lucide-react';
import { Article } from '../../types';

interface ScholarshipSectionProps {
  scholarshipArticles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const ScholarshipSection: React.FC<ScholarshipSectionProps> = ({
  scholarshipArticles,
  onReadArticle,
  onNavigateCategory,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'undergraduate' | 'postgraduate'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'nigerian' | 'international'>('all');

  const filtered = scholarshipArticles.filter((item) => {
    const text = (item.title + ' ' + item.content + ' ' + item.excerpt).toLowerCase();
    if (levelFilter === 'undergraduate' && !text.includes('undergraduate')) return false;
    if (levelFilter === 'postgraduate' && !text.includes('postgraduate') && !text.includes('masters')) return false;
    if (locationFilter === 'nigerian' && !text.includes('nigeria') && !text.includes('federal')) return false;
    if (locationFilter === 'international' && !text.includes('overseas') && !text.includes('international') && !text.includes('bilateral')) return false;
    return true;
  });

  return (
    <section className="py-10 bg-gradient-to-b from-sky-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-sky-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                FUNDING DESK
              </span>
              <span className="text-sky-300 text-xs font-semibold">Verified Grants & Sponsorships</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scholarship Opportunities for Nigerian Students
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Discover fully funded undergraduate grants, Federal Government BEA awards, and international master's/PhD fellowships with verified deadlines.
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-sky-900/80 p-1 rounded-xl flex items-center gap-1 border border-sky-700">
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  levelFilter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setLevelFilter('undergraduate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  levelFilter === 'undergraduate' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                Undergraduate
              </button>
              <button
                onClick={() => setLevelFilter('postgraduate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  levelFilter === 'postgraduate' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                Postgraduate
              </button>
            </div>

            <div className="bg-sky-900/80 p-1 rounded-xl flex items-center gap-1 border border-sky-700">
              <button
                onClick={() => setLocationFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  locationFilter === 'all' ? 'bg-orange-500 text-white font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                All Regions
              </button>
              <button
                onClick={() => setLocationFilter('nigerian')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  locationFilter === 'nigerian' ? 'bg-orange-500 text-white font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                Local (NG)
              </button>
              <button
                onClick={() => setLocationFilter('international')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  locationFilter === 'international' ? 'bg-orange-500 text-white font-bold' : 'text-sky-200 hover:text-white'
                }`}
              >
                International
              </button>
            </div>
          </div>
        </div>

        {/* Scholarship Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filtered.length > 0 ? filtered : scholarshipArticles).slice(0, 6).map((sch) => (
            <div
              key={sch.id}
              onClick={() => onReadArticle(sch.slug)}
              className="group bg-slate-800/90 hover:bg-slate-850 rounded-2xl p-5 border border-slate-700/80 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl shadow-black/30"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Fully Funded / Verified
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(sch.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                  {sch.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                  {sch.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-xs text-sky-300 font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {sch.institution || 'Nigeria & Overseas'}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  Apply Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            LegitSchoolGists does not charge any application or processing fee for scholarships.
          </p>

          <button
            onClick={() => onNavigateCategory('scholarships')}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-sm"
          >
            <span>Explore All 2026/2027 Scholarships</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
