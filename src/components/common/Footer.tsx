import React, { useState } from 'react';
import { 
  GraduationCap, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Send, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { addSubscriber } from '../../services/dataService';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subMessage, setSubMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail) return;
    setLoading(true);
    const res = await addSubscriber(subscriberEmail);
    setLoading(false);
    setSubMessage({ text: res.message, success: res.success });
    if (res.success) setSubscriberEmail('');
    setTimeout(() => setSubMessage(null), 5000);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-sky-600">
      {/* Newsletter Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-sky-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded inline-block">
              Free Admission & Scholarship Alerts
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Never Miss a Post-UTME Deadline or Scholarship Application
            </h3>
            <p className="text-sm text-sky-100 max-w-xl">
              Join thousands of Nigerian students, UTME aspirants, and parents receiving verified university circulars straight to their inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto max-w-md flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-sky-400/30 text-white placeholder-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/20 grow"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {subMessage && (
          <div className="max-w-7xl mx-auto mt-4">
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              subMessage.success ? 'bg-emerald-800/80 text-emerald-100' : 'bg-rose-800/80 text-rose-100'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{subMessage.text}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Footer Links & Contact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.logo_url ? (
                <div className="h-10 w-auto max-w-[160px] rounded-lg bg-white p-1 flex items-center justify-center">
                  <img
                    src={settings.logo_url}
                    alt="LegitSchoolGists"
                    className="h-full w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}
              <span className="text-2xl font-black text-white tracking-tight">
                Legit<span className="text-orange-500">School</span><span className="text-sky-400">Gists</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Nigeria’s premier platform for campus news, university updates, scholarship opportunities, student life, and academic excellence. Dedicated to bridging the educational information gap.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs">
              <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Educational Reporting
              </span>
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                {settings.address || 'Lagos & Abuja, Nigeria'}
              </span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-slate-800">
              Exam & Admission Updates
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('category', 'jamb')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>JAMB CAPS & UTME Updates</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'post-utme')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Post-UTME Screening Forms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'admission')}
                  className="hover:text-amber-400 transition-colors"
                >
                  University Admission Lists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'waec')}
                  className="hover:text-amber-400 transition-colors"
                >
                  WAEC Timetable & GCE Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'neco')}
                  className="hover:text-amber-400 transition-colors"
                >
                  NECO SSCE Registration & Token
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'scholarships')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Undergraduate & BEA Scholarships
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-slate-800">
              Student & Academic Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('category', 'career')} className="hover:text-amber-400 transition-colors">
                  Graduate Trainee & Career Tips
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'academic-excellence')} className="hover:text-amber-400 transition-colors">
                  First Class CGPA Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'nuc-accreditation')} className="hover:text-amber-400 transition-colors">
                  NUC Approvals & Rankings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'campus-life')} className="hover:text-amber-400 transition-colors">
                  Campus Life & SUG Updates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-amber-400 transition-colors">
                  About LegitSchoolGists
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
                  Contact Our Newsroom
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (With required phone and WhatsApp numbers) */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-slate-800">
              Official Desk & Hotlines
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href="https://wa.me/2349039733298?text=Hello%20LegitSchoolGists"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 fill-current" />
                <div>
                  <div className="font-semibold text-xs text-white">WhatsApp Helpline</div>
                  <div className="font-mono text-xs">+234 903 973 3298</div>
                </div>
              </a>

              <a
                href="tel:+2348115578054"
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
              >
                <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-white">Editorial Phone</div>
                  <div className="font-mono text-xs">+234 811 5578 054</div>
                </div>
              </a>

              <a
                href="mailto:legitschoolgistsblog@gmail.com"
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
              >
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-white">Official Email</div>
                  <div className="text-xs truncate max-w-[200px] text-sky-300">
                    legitschoolgistsblog@gmail.com
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-lg">
          <p>
            <strong className="text-slate-300">Editorial Disclaimer:</strong> LegitSchoolGists publishes educational information, campus news, and admission advisories for informational purposes. While we rigorously verify updates against official communiqués from JAMB, WAEC, NECO, the NUC, and Nigerian university portals, candidates are encouraged to confirm specific screening instructions directly with their respective institutions.
          </p>
        </div>

        {/* Copyright & Admin Link */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} LegitSchoolGists. All Rights Reserved. Built for Nigerian Academic Excellence.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-200 transition-colors"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-amber-400 text-slate-400 flex items-center gap-1 transition-colors font-medium"
              title="Official Admin Console: https://legitschoolgists.com.ng/admin"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
