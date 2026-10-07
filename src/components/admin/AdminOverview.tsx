import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Eye, 
  FolderTree, 
  Mail, 
  PlusCircle, 
  Database, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  Star
} from 'lucide-react';
import { Article, Category, ContactMessage } from '../../types';
import { getSupabaseCredentials } from '../../lib/supabaseClient';

interface AdminOverviewProps {
  articles: Article[];
  categories: Category[];
  messages: ContactMessage[];
  onNavigateTab: (tab: string) => void;
  onEditArticle: (article: Article) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  articles,
  categories,
  messages,
  onNavigateTab,
  onEditArticle,
}) => {
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const unreadMessages = messages.filter((m) => !m.read);
  const { isConfigured } = getSupabaseCredentials();

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            LegitSchoolGists Editorial Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome to the centralized Nigerian education news management center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('new-article')}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Story</span>
          </button>
        </div>
      </div>

      {/* Database Connection Notice */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isConfigured 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className={`w-5 h-5 shrink-0 ${isConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div>
            <strong className="font-bold">
              {isConfigured ? 'Supabase Backend Connected' : 'Supabase Credentials Setup Available'}
            </strong>
            <p className="text-[11px] text-slate-600">
              {isConfigured
                ? 'Your application is integrated with Supabase database and storage.'
                : 'Connect your Supabase project URL & Anon Key or export the SQL Script anytime in the Supabase tab.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('supabase')}
          className="text-xs font-bold underline shrink-0 hover:text-sky-700 text-slate-800"
        >
          Manage Supabase & SQL Script →
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Articles</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{articles.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {publishedArticles.length} active on website
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft Circulars</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{draftArticles.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Unpublished internal drafts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Reads</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Total educational views
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{messages.length}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {unreadMessages.length} unread messages
          </div>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">
            Recently Managed Educational Stories
          </h2>
          <button
            onClick={() => onNavigateTab('articles')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Headline</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.slice(0, 6).map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 line-clamp-1 max-w-md">
                      {art.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {art.is_featured && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Featured
                        </span>
                      )}
                      {art.is_breaking && (
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-current" /> Breaking
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {art.category_name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {art.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                    {art.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                    {new Date(art.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEditArticle(art)}
                      className="text-sky-600 hover:text-sky-800 font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
