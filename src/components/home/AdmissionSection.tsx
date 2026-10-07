import React, { useState } from 'react';
import { GraduationCap, ArrowRight, CheckCircle, Calendar, School, Award, ChevronRight } from 'lucide-react';
import { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface AdmissionSectionProps {
  articles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const AdmissionSection: React.FC<AdmissionSectionProps> = ({
  articles,
  onReadArticle,
  onNavigateCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'post-utme' | 'admission-list'>('all');

  const filteredArticles = articles.filter((a) => {
    if (activeTab === 'post-utme') {
      return a.category_name?.toLowerCase().includes('post-utme') || a.title.toLowerCase().includes('post-utme');
    }
    if (activeTab === 'admission-list') {
      return a.title.toLowerCase().includes('admission') || a.category_name?.toLowerCase().includes('admission');
    }
    return true;
  });

  return (
    <section className="py-8 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-6 bg-sky-600 rounded-sm"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Tertiary Screening & Lists
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              University & Polytechnic Admission Updates
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Real-time Post-UTME forms, institutional cut-off points, screening dates, and departmental admission merit lists.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-sky-600'
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setActiveTab('post-utme')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'post-utme'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-sky-600'
              }`}
            >
              Post-UTME Forms
            </button>
            <button
              onClick={() => setActiveTab('admission-list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'admission-list'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-sky-600'
              }`}
            >
              Admission Lists
            </button>
          </div>
        </div>

        {/* Highlight Cut-Off Box / Quick Notice */}
        <div className="mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Official General Cut-off Mark Benchmarks</h4>
              <p className="text-xs text-slate-500">
                Federal Universities (140 - 200) • State Universities (140 - 180) • Polytechnics (100 - 120)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateCategory('admission')}
            className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View All Institution Cut-Offs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.slice(0, 6).map((art) => (
            <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigateCategory('admission')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all"
          >
            <span>Browse All 2026/2027 Admission News</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
