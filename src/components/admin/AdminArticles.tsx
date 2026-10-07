import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Flame, 
  Eye, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Article, Category } from '../../types';

interface AdminArticlesProps {
  articles: Article[];
  categories: Category[];
  justPublishedArticle?: Article | null;
  onDismissJustPublished?: () => void;
  onNewArticle: () => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onToggleStatus: (article: Article) => void;
  onToggleFeatured: (article: Article) => void;
  onViewArticle: (slug: string) => void;
  onGoHome?: () => void;
}

export const AdminArticles: React.FC<AdminArticlesProps> = ({
  articles,
  categories,
  justPublishedArticle,
  onDismissJustPublished,
  onNewArticle,
  onEditArticle,
  onDeleteArticle,
  onToggleStatus,
  onToggleFeatured,
  onViewArticle,
  onGoHome,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || art.category_id === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || art.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Article Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish, edit, organize categories, and manage visibility of campus updates.
          </p>
        </div>

        <button
          onClick={onNewArticle}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Just Published Success Notice */}
      {justPublishedArticle && (
        <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  Article Saved & Published!
                </span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live on Frontend
                </span>
                {justPublishedArticle.is_breaking && (
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-600" />
                    Breaking Ticker Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                "{justPublishedArticle.title}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onViewArticle(justPublishedArticle.slug)}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Story Live</span>
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Go to Homepage</span>
              </button>
            )}
            {onDismissJustPublished && (
              <button
                onClick={onDismissJustPublished}
                className="text-slate-400 hover:text-slate-600 p-2 text-xs font-semibold"
                title="Dismiss message"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or excerpt..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Headline</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Views</th>
                <th className="px-4 py-3.5">Published Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1 max-w-sm sm:max-w-md">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                        /{art.slug}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded">
                        {art.category_name || 'News'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleFeatured(art)}
                        className={`p-1 rounded-lg transition-colors ${
                          art.is_featured
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={art.is_featured ? 'Featured on Homepage Hero' : 'Mark as Featured'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(art)}
                        className={`font-bold text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {art.status.toUpperCase()}
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap font-mono">
                      {art.views.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      {new Date(art.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onViewArticle(art.slug)}
                        className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                        title="Preview Public Article"
                      >
                        <ExternalLink className="w-4 h-4 inline" />
                      </button>

                      <button
                        onClick={() => onEditArticle(art)}
                        className="p-1 text-sky-600 hover:text-sky-800 transition-colors font-bold"
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(art.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No articles match your current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Confirm Delete</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this article? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteArticle(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
