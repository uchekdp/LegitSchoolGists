import React, { useState } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';
import { Category, Article } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  articles?: Article[];
  onSaveCategory: (category: Partial<Category> & { name: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  articles = [],
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsAdding(false);
    setStatusMessage(null);
  };

  const cancelForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await onSaveCategory({
        id: editingId || undefined,
        name: name.trim(),
        description: description.trim(),
      });
      setStatusMessage({
        text: editingId ? `Category "${name.trim()}" updated successfully!` : `Category "${name.trim()}" created successfully!`,
        success: true,
      });
      cancelForm();
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to save category.',
        success: false,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    const catName = categoryToDelete.name;
    try {
      await onDeleteCategory(categoryToDelete.id);
      setStatusMessage({
        text: `Category "${catName}" was removed from the website and database.`,
        success: true,
      });
      setCategoryToDelete(null);
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || `Failed to delete category "${catName}".`,
        success: false,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q) || (cat.description && cat.description.toLowerCase().includes(q));
  });

  // Calculate live count of articles in each category
  const getArticleCount = (catId: string, slug: string) => {
    return articles.filter(
      (a) => a.category_id === catId || a.category_name?.toLowerCase() === slug.toLowerCase()
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Taxonomy Desk
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {categories.length} Categories Total
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize topics or delete categories that are not necessary for your blog.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setStatusMessage(null);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {/* Helpful Guidance Notice */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Customize your blog channels: </span>
          <span>
            You can delete any categories you don't need (e.g. WAEC, NECO, Polytechnic News, or Career). Deleted categories are immediately removed from your navigation, sidebar, and database. Any existing articles will safely remain on the platform.
          </span>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-fade-in ${
            statusMessage.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {filteredCategories.length} of {categories.length}
        </span>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-sky-300 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Polytechnic Updates"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of topics in this category..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              {editingId ? 'Update Category' : 'Save Category'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const liveCount = getArticleCount(cat.id, cat.slug);

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-extrabold text-slate-900 text-base">
                    {cat.name}
                  </span>
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded font-mono border border-sky-100">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description specified.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${liveCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span>{liveCount} article{liveCount === 1 ? '' : 's'}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title={`Delete category ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No Categories Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? `No categories match "${search}".` : 'No categories exist currently.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal to Delete Category */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Delete Category?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove <span className="font-bold text-slate-800">"{categoryToDelete.name}"</span>?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Category Slug:</span>
                <span className="font-mono text-slate-800">/{categoryToDelete.slug}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Associated Articles:</span>
                <span className="font-bold text-slate-800">
                  {getArticleCount(categoryToDelete.id, categoryToDelete.slug)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                {getArticleCount(categoryToDelete.id, categoryToDelete.slug) > 0
                  ? 'Existing articles will be safely preserved and reassigned to "Education News" so you never lose content.'
                  : 'This category is empty and will be completely removed from the website and database.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Category...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
