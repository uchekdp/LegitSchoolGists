import React from 'react';
import { Briefcase, Sparkles, GraduationCap, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface CareerCampusSectionProps {
  careerArticles: Article[];
  campusArticles: Article[];
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const CareerCampusSection: React.FC<CareerCampusSectionProps> = ({
  careerArticles,
  campusArticles,
  onReadArticle,
  onNavigateCategory,
}) => {
  return (
    <section className="py-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Career & Graduate Trainee */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Career Guidance & Graduate Jobs
                  </h3>
                  <p className="text-xs text-slate-500">Aptitude tests, bank graduate trainees, and CV strategy</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateCategory('career')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {careerArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* Right Column: Campus Life & Academic Excellence */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Campus Life & First Class Scholars
                  </h3>
                  <p className="text-xs text-slate-500">Student success stories, SUG, and varsity developments</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateCategory('academic-excellence')}
                className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
              >
                <span>View Stories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {campusArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art.id} article={art} onReadArticle={onReadArticle} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
