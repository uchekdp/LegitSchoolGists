import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, MessageCircle, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminSettingsProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSaveSettings(formData);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Portal Global Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage contact channels, WhatsApp hotlines, brand details, and breaking ticker notices.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Changes Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Core Identity */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            Platform Brand Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Name *
              </label>
              <input
                type="text"
                required
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Editorial Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers (WhatsApp and Phones) */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            Official Contact Hotlines & Channels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                WhatsApp Helpline (+234 903 973 3298) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sky-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Editorial Phone Line (+234 811 5578 054) *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                Official Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Breaking Announcement Bar */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            Breaking Ticker Announcement
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Top Headline Marquee Notice
            </label>
            <input
              type="text"
              value={formData.breaking_announcement}
              onChange={(e) => setFormData({ ...formData, breaking_announcement: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold"
            />
          </div>
        </div>

        {/* About Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Footer / About Summary
          </label>
          <textarea
            rows={3}
            value={formData.about_summary}
            onChange={(e) => setFormData({ ...formData, about_summary: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
        </button>
      </form>

      {/* Backend Server Storage & Production Access Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-150">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Backend Storage & Production Admin Access
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything in this portal is persisted directly on the backend server database.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Persistent REST API
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-600 block mb-1">Official Admin Access URL:</span>
            <div className="font-mono text-sky-700 bg-white p-2 rounded-lg border border-slate-200 break-all select-all font-bold">
              https://legitschoolgists.com.ng/admin
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Bookmark this address to directly access this administrator console.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-600 block mb-1">Backend Database File:</span>
            <div className="font-mono text-emerald-700 bg-white p-2 rounded-lg border border-slate-200 break-all font-bold">
              /data/database.json
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Stores all articles, categories, settings, institutions, and comments permanently on the server.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="/api/database"
            target="_blank"
            download="legitschoolgists_database_backup.json"
            className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Download Database JSON Backup</span>
          </a>
        </div>
      </div>
    </div>
  );
};
