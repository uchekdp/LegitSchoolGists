import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  Users, 
  Award, 
  BookOpen, 
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface AboutViewProps {
  settings: SiteSettings;
  onBack: () => void;
  onNavigateContact: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  settings,
  onBack,
  onNavigateContact,
}) => {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-700 hover:text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              ABOUT LEGITSCHOOLGISTS
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Bridging the Educational Information Gap Across Nigeria
            </h1>
            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              LegitSchoolGists is Nigeria’s premier digital platform for campus news, university updates, scholarship opportunities, student life, and academic excellence.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-sky-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To deliver accurate, timely, verified, and easy-to-understand educational information to Nigerian students, parents, and academic professionals, empowering young minds to make informed tertiary choices.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Our Editorial Pledge</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every admission notice, JAMB policy, WAEC timetable, and scholarship opportunity published on our portal is cross-referenced against official gazettes and institutional registrars before public dissemination.
            </p>
          </div>
        </div>

        {/* What We Cover */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            What LegitSchoolGists Covers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">University & Polytechnic Admissions:</strong>
                Post-UTME dates, departmental cut-off marks, and merit screening lists.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">JAMB, WAEC & NECO Central Hub:</strong>
                UTME profile creation, CAPS status guidelines, syllabus, and examination timetables.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">Scholarship Opportunities:</strong>
                Federal Government BEA, NNPC/Chevron undergraduate grants, and verified overseas fellowships.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">NUC Accreditations & Rankings:</strong>
                Approved academic degree programmes, institutional accreditation, and university rankings.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">Career Guidance:</strong>
                Graduate trainee programmes in Nigerian banks, CV advisory, and aptitude test preparation.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold">Campus Life & Academic Excellence:</strong>
                First-class graduation stories, CGPA study systems, and student leadership updates.
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-sky-950">Have a Campus Story or Admission Question?</h3>
            <p className="text-xs sm:text-sm text-sky-800 mt-1">
              Connect with our editorial desk and campus correspondents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateContact}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Contact Our Newsroom
            </button>
            <a
              href="https://wa.me/2349039733298"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
