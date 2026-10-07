import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { submitContactMessage } from '../../services/dataService';

interface ContactViewProps {
  settings: SiteSettings;
  onBack: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    try {
      await submitContactMessage(formData);
      setStatus({
        success: true,
        text: 'Thank you! Your message has been sent to the LegitSchoolGists editorial team. We will respond promptly.',
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus({
        success: false,
        text: 'An error occurred while submitting your message. Please try again or reach us directly on WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Heading */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-2">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact LegitSchoolGists Newsroom
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Have an admission question, campus event story to report, or sponsorship inquiry? Our educational correspondents are available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Card */}
            <a
              href="https://wa.me/2349039733298?text=Hello%20LegitSchoolGists%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-emerald-50 hover:bg-emerald-100/80 p-5 rounded-2xl border border-emerald-200 shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-7 h-7 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Instant WhatsApp Desk
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-0.5">
                    +234 903 973 3298
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Click to start a WhatsApp chat for fast answers on JAMB, admissions, and scholarships.
                  </p>
                </div>
              </div>
            </a>

            {/* Direct Phone Card */}
            <a
              href="tel:+2348115578054"
              className="block bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wide">
                    Editorial Hotlines
                  </span>
                  <div className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-0.5">
                    +234 811 5578 054
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Alt: +234 903 973 3298
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Direct voice line for institutional registrars, university PROs, and urgent calls.
                  </p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:legitschoolgistsblog@gmail.com"
              className="block bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    Official Email
                  </span>
                  <div className="text-sm sm:text-base font-bold text-sky-700 break-all mt-0.5">
                    legitschoolgistsblog@gmail.com
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    For press releases, official university communiqués, and formal partnership proposals.
                  </p>
                </div>
              </div>
            </a>

            {/* Operating Hours */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Operating Hours</span>
              </div>
              <p>Monday – Saturday: 8:00 AM – 7:00 PM (WAT)</p>
              <p className="text-slate-500">Dedicated online support and news desk for Nigerian tertiary institutions.</p>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Send a Direct Message to LegitSchoolGists
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill in your details below and an education reporter will review your inquiry.
            </p>

            {status && (
              <div
                className={`p-4 rounded-xl mb-6 text-xs sm:text-sm flex items-start gap-2.5 ${
                  status.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {status.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ibrahim Adeyemi"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. student@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Contact / Topic *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Admission / Cut-off Inquiry">Admission / Cut-off Inquiry</option>
                    <option value="JAMB / UTME / CAPS Issue">JAMB / UTME / CAPS Issue</option>
                    <option value="WAEC / NECO Information">WAEC / NECO Information</option>
                    <option value="Scholarship Verification">Scholarship Verification</option>
                    <option value="News Tip / Campus Story">News Tip / Campus Story</option>
                    <option value="Advertising / Sponsorship">Advertising / Sponsorship</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Message / Inquiries *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide details about your question, chosen university, course, or campus news..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting Message...' : 'Send Message to Newsroom'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
