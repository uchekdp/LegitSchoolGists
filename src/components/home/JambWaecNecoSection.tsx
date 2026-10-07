import React from 'react';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface JambWaecNecoSectionProps {
  jambArticles: Article[];
  examArticles: Article[]; // WAEC & NECO
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const JambWaecNecoSection: React.FC<JambWaecNecoSectionProps> = ({
  jambArticles,
  examArticles,
  onReadArticle,
  onNavigateCategory,
}) => {
  return (
    <section className="py-8 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: JAMB Portal Updates */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-emerald-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  JAMB
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    JAMB & UTME Central Hub
                  </h3>
                  <p className="text-xs text-slate-500">CAPS, Cut-offs, syllabus, and registration circulars</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateCategory('jamb')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>All JAMB</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick action badges for JAMB candidates */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-semibold">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CAPS Portal Login Guide</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Subject Combinations Tool</span>
              </div>
            </div>

            {/* Articles list */}
            <div className="space-y-4">
              {jambArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* Column 2: WAEC & NECO Examination Desk */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-indigo-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  SSCE
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    WAEC & NECO Examinations
                  </h3>
                  <p className="text-xs text-slate-500">Timetable, result token checking, and syllabus breakdown</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateCategory('waec')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800"
                >
                  WAEC
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => onNavigateCategory('neco')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800"
                >
                  NECO
                </button>
              </div>
            </div>

            {/* Quick check badges */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-semibold">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-2.5 rounded-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>WAEC Direct Result Portal</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-2.5 rounded-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>NECO Token Checker</span>
              </div>
            </div>

            {/* Articles list */}
            <div className="space-y-4">
              {examArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
