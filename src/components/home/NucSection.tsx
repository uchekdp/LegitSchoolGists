import React from 'react';
import { Award, CheckCircle, ArrowRight, BookOpen, ShieldCheck, Landmark } from 'lucide-react';
import { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface NucSectionProps {
  nucArticles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const NucSection: React.FC<NucSectionProps> = ({
  nucArticles,
  onReadArticle,
  onNavigateCategory,
}) => {
  return (
    <section className="py-10 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-6 bg-blue-800 rounded-sm"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Institutional Regulatory Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              NUC Approvals, Accreditations & University Rankings
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Verify degree accreditation status, newly approved university departments, and Times Higher Education/NUC varsity rankings.
            </p>
          </div>

          <button
            onClick={() => onNavigateCategory('nuc-accreditation')}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            <span>View All NUC Bulletins</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* NUC Accreditation Alert Banner */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-800 text-white flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">
                Beware of Unaccredited Degree Programmes
              </h4>
              <p className="text-xs text-blue-900/80">
                LegitSchoolGists verifies all department announcements against the official National Universities Commission gazette.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-800 font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NUC Gazette Verified</span>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nucArticles.slice(0, 3).map((art) => (
            <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} />
          ))}
        </div>
      </div>
    </section>
  );
};
