import React, { useState, useRef } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Link, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Sparkles, 
  ExternalLink,
  Eye,
  CheckCircle2,
  Star,
  Flame,
  Globe,
  Upload,
  RefreshCw,
  AlertCircle,
  X,
  Copy,
  Check,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  Plus,
  Trash2,
  Search,
  FileText
} from 'lucide-react';
import { Article, Category, Institution, MediaItem } from '../../types';
import { uploadImageFile } from '../../services/dataService';
import { RichTextEditor } from './RichTextEditor';

interface AdminArticleEditorProps {
  initialArticle?: Article | null;
  categories: Category[];
  institutions: Institution[];
  mediaItems: MediaItem[];
  onSave: (article: Partial<Article> & { title: string }) => Promise<void>;
  onCancel: () => void;
  onPreview: (slug: string) => void;
}

interface UploadedSessionImage {
  id: string;
  url: string;
  fileName: string;
}

export const AdminArticleEditor: React.FC<AdminArticleEditorProps> = ({
  initialArticle,
  categories,
  institutions,
  mediaItems,
  onSave,
  onCancel,
  onPreview,
}) => {
  const [editorTab, setEditorTab] = useState<'content' | 'seo'>('content');
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const initialCategoryIds = (): string[] => {
    if (Array.isArray(initialArticle?.category_ids) && initialArticle.category_ids.length > 0) {
      return initialArticle.category_ids;
    }
    if (Array.isArray(initialArticle?.categories) && initialArticle.categories.length > 0) {
      return initialArticle.categories.map((c) => c.id);
    }
    if (initialArticle?.category_id) {
      return [initialArticle.category_id];
    }
    if (categories.length > 0) {
      return [categories[0].id];
    }
    return ['cat-admission'];
  };

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [institution, setInstitution] = useState(initialArticle?.institution || '');
  const [featuredImage, setFeaturedImage] = useState(
    initialArticle?.featured_image ||
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'
  );
  const [authorName, setAuthorName] = useState(initialArticle?.author_name || 'LegitSchoolGists Editorial');
  const [sourceUrl, setSourceUrl] = useState(initialArticle?.source_url || '');
  const [tagsInput, setTagsInput] = useState(initialArticle?.tags?.join(', ') || '');
  const [keywordsInput, setKeywordsInput] = useState(
    initialArticle?.keywords?.join(', ') || initialArticle?.tags?.join(', ') || ''
  );
  const [status, setStatus] = useState<'published' | 'draft'>(initialArticle?.status || 'published');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialArticle?.is_featured));
  const [isBreaking, setIsBreaking] = useState(Boolean(initialArticle?.is_breaking));
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seo_description || '');
  const [saving, setSaving] = useState(false);

  // Cover image states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Global upload notification
  const [uploadMessage, setUploadMessage] = useState<{ text: string; success: boolean } | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialArticle) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
      if (!seoTitle) setSeoTitle(val);
    }
  };

  // Process a File upload for featured cover
  const processUpload = async (file: File): Promise<{ success: boolean; url: string; error?: string }> => {
    if (!file.type.startsWith('image/')) {
      return { success: false, url: '', error: 'Please choose an image file (PNG, JPG, WEBP).' };
    }
    const res = await uploadImageFile(file);
    if (res.success && res.url) {
      return { success: true, url: res.url };
    }
    return { success: false, url: '', error: res.error || 'Failed to upload image.' };
  };

  // Upload Featured Cover Image from Computer or Phone
  const handleCoverFileUpload = async (file: File) => {
    setUploadingCover(true);
    setUploadMessage(null);
    try {
      const res = await processUpload(file);
      if (res.success && res.url) {
        setFeaturedImage(res.url);
        setUploadMessage({ text: `Cover photo "${file.name}" uploaded successfully!`, success: true });
      } else {
        setUploadMessage({ text: res.error || 'Failed to upload cover photo.', success: false });
      }
    } catch (err: any) {
      setUploadMessage({ text: err?.message || 'Upload failed.', success: false });
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Cover drag & drop
  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverFileUpload(file);
    }
  };

  // Submit Article Form
  const handleSaveSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setUploadMessage({ text: 'Please enter an Article Headline / Title before publishing.', success: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!content.trim()) {
      setUploadMessage({ text: 'Please write the Article Body content before publishing.', success: false });
      const textarea = document.getElementById('article-content-textarea');
      textarea?.focus();
      return;
    }

    if (status === 'published' && selectedCategoryIds.length === 0) {
      setUploadMessage({
        text: 'Please select at least one category before publishing this article.',
        success: false,
      });
      return;
    }

    setSaving(true);
    setUploadMessage({ text: 'Saving and publishing article to platform & database...', success: true });

    try {
      const primaryCatId = selectedCategoryIds[0] || 'cat-admission';
      const primaryCat = categories.find((c) => c.id === primaryCatId);
      const catNames = selectedCategoryIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[];
      const articleCats = selectedCategoryIds.map((id) => {
        const c = categories.find((cat) => cat.id === id);
        return {
          id,
          name: c?.name || id,
          slug: c?.slug || id.replace(/^cat-/, ''),
        };
      });

      const cleanSlug =
        slug.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') ||
        `post-${Date.now()}`;

      const cleanExcerpt =
        excerpt.trim() ||
        content.trim().substring(0, 160).replace(/<[^>]*>?/gm, '') + '...';

      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const keywordsArray = keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const coverImg =
        featuredImage.trim() ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';

      await onSave({
        id: initialArticle?.id,
        title: title.trim(),
        slug: cleanSlug,
        excerpt: cleanExcerpt,
        content: content.trim(),
        category_id: primaryCatId,
        category_name: primaryCat?.name || (catNames[0] || 'Education News'),
        category_ids: selectedCategoryIds,
        category_names: catNames,
        categories: articleCats,
        institution: institution.trim() || undefined,
        featured_image: coverImg,
        author_name: authorName.trim() || 'LegitSchoolGists Editorial',
        source_url: sourceUrl.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : keywordsArray,
        keywords: keywordsArray,
        status,
        is_featured: isFeatured,
        is_breaking: isBreaking,
        seo_title: seoTitle.trim() || title.trim(),
        seo_description: seoDescription.trim() || cleanExcerpt,
        views: initialArticle?.views || 0,
        published_at: initialArticle?.published_at || new Date().toISOString(),
      });

      if (isMountedRef.current) {
        setUploadMessage({ text: 'Article saved and published successfully! Live on site.', success: true });
      }
    } catch (err: any) {
      console.error('Save article error:', err);
      if (isMountedRef.current) {
        setUploadMessage({ text: err?.message || 'Failed to publish article. Please try again.', success: false });
      }
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Back to articles list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {initialArticle ? 'Edit Educational Story' : 'Compose New Article'}
            </h1>
            <p className="text-xs text-slate-500">
              Publish news, admission circulars, Post-UTME guides, scholarships, and exam timetables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialArticle && (
            <button
              type="button"
              onClick={() => onPreview(initialArticle.slug)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveSubmit}
            disabled={saving}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* Global Upload Notification Message */}
      {uploadMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in ${
            uploadMessage.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadMessage.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{uploadMessage.text}</span>
          </div>
          <button
            onClick={() => setUploadMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSaveSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dedicated Mode Switcher: Content vs SEO */}
        <div className="lg:col-span-12 flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorTab('content')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                editorTab === 'content'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Article Content & Body</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('seo')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                editorTab === 'seo'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-4 h-4 text-amber-500" />
              <span>Search Engine Optimization (SEO)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                Meta
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Google Search & Meta Tags</span>
          </div>
        </div>

        {/* Main Editor Section (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {editorTab === 'seo' ? (
            <div className="space-y-6 animate-fade-in">
              {/* SEO Banner & Score */}
              <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="bg-amber-400 text-sky-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5 shadow-xs">
                      Search Engine Optimization
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Google SERP & Metadata Desk
                    </h3>
                    <p className="text-xs text-sky-200 mt-1 max-w-xl">
                      Configure search crawler titles, meta descriptions, and indexing keywords to rank #1 on Google for Nigerian campus queries.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                      {seoTitle.length > 0 && seoDescription.length > 0 && keywordsInput.length > 0 ? '100%' : seoTitle.length > 0 || seoDescription.length > 0 ? '70%' : '40%'}
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-sky-200 block">SEO Readiness</span>
                      <span className="text-xs font-bold text-white">
                        {seoTitle.length > 0 && seoDescription.length > 0 && keywordsInput.length > 0 ? 'Optimized' : 'Needs Metadata'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Title Field */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      SEO Title (Meta Title Tag)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      The primary title tag displayed on Google Search and browser tabs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeoTitle(title.trim())}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Auto-fill from Headline
                    </button>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        seoTitle.length >= 40 && seoTitle.length <= 65
                          ? 'bg-emerald-100 text-emerald-800'
                          : seoTitle.length > 65
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {seoTitle.length}/60 chars
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || 'e.g. UNILAG 2026/2027 Cut-Off Marks & Post-UTME Merit Admission Guide'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                />

                <p className="text-[11px] text-slate-400">
                  Recommended length: 50–60 characters. Keep it under 65 characters to prevent truncation in search engine snippets.
                </p>
              </div>

              {/* SEO Description Field */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      SEO Description (Meta Description Tag)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      The summary snippet displayed below your headline in search results and social previews.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeoDescription(excerpt.trim() || content.substring(0, 160).replace(/<[^>]*>?/gm, ''))}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Auto-fill from Excerpt
                    </button>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        seoDescription.length >= 120 && seoDescription.length <= 160
                          ? 'bg-emerald-100 text-emerald-800'
                          : seoDescription.length > 160
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {seoDescription.length}/160 chars
                    </span>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || 'e.g. Check verified UNILAG 2026/2027 departmental cut-off marks, Post-UTME screening dates, and step-by-step admission guidelines on LegitSchoolGists.'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-xs"
                ></textarea>

                <p className="text-[11px] text-slate-400">
                  Recommended length: 140–160 characters. Provide a compelling lead that encourages students and parents to click.
                </p>
              </div>

              {/* Keywords & Search Tags Field */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Keywords (Meta Keywords & Search Tags)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Target search terms separated by commas for search crawlers, internal search, and tag indexing.
                  </p>
                </div>

                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => {
                    setKeywordsInput(e.target.value);
                    setTagsInput(e.target.value);
                  }}
                  placeholder="e.g. UNILAG admission 2026, Post-UTME screening, cut off mark, JAMB CAPS, merit list"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                />

                {/* Keyword Badges */}
                {keywordsInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {keywordsInput
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean)
                      .map((kw, i) => (
                        <span
                          key={i}
                          className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          <span>{kw}</span>
                        </span>
                      ))}
                  </div>
                )}

                {/* Quick Keywords Suggestions */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Suggested High-Traffic Nigerian Education Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'JAMB CAPS 2026',
                      'Post-UTME Form',
                      'Cut-Off Marks',
                      'Merit Admission List',
                      'Undergraduate Scholarship',
                      'WAEC Timetable 2026',
                      'NUC Approved Degrees',
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          const existing = keywordsInput ? keywordsInput.split(',').map((k) => k.trim()) : [];
                          if (!existing.includes(sug)) {
                            const updated = existing.length > 0 ? `${keywordsInput}, ${sug}` : sug;
                            setKeywordsInput(updated);
                            setTagsInput(updated);
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Google Search Result Simulator (SERP Preview) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Live Google Search Result Preview (SERP)
                  </h4>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-sky-700 text-white flex items-center justify-center text-[9px] font-bold">
                      L
                    </div>
                    <span className="font-medium text-slate-800">legitschoolgists.com</span>
                    <span className="text-slate-400">› article › {slug || 'article-url-slug'}</span>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-blue-700 hover:underline cursor-pointer leading-snug line-clamp-1">
                    {seoTitle || title || 'Educational Article Headline Title — LegitSchoolGists'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {seoDescription || excerpt || 'Detailed verified updates and campus circulars covering Nigerian tertiary institutions on LegitSchoolGists.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Article Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. UNILAG 2026/2027 Post-UTME Screening Form, Cut-Off Marks & Date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>URL Slug</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-generated from title if blank</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 text-slate-500 px-3 py-2.5 text-xs font-mono rounded-l-xl border border-r-0 border-slate-300">
                      /article/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="leave blank to auto-generate from headline"
                      className="w-full px-3 py-2.5 rounded-r-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Executive Excerpt / Short Summary</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-generated from body if blank</span>
                  </label>
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence lead paragraph shown on homepage news cards, search results, and WhatsApp previews (leave blank to auto-extract from body)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-xs"
                  ></textarea>
                </div>

            {/* Rich WYSIWYG Article Body Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span>Article Body *</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    True WYSIWYG word processor • Formats highlighted text naturally
                  </span>
                </div>
              </div>

              <RichTextEditor
                content={content}
                onChange={(html) => setContent(html)}
                placeholder="Write or paste the full educational news story, admission circular, cut-off marks, or examination timetable here..."
                articleTitle={title}
                featuredImage={featuredImage}
                authorName={authorName}
                categoryName={categories.find((c) => c.id === selectedCategoryIds[0])?.name || 'Education News'}
              />
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Search Engine Optimization (SEO) & Meta</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditorTab('seo')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <span>Open Dedicated SEO Studio</span>
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Title
                </label>
                <button
                  type="button"
                  onClick={() => setSeoTitle(title.trim())}
                  className="text-[10px] font-semibold text-sky-600 hover:text-sky-800"
                >
                  Auto-fill
                </button>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO Title for Google search results (50-60 characters)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Description
                </label>
                <button
                  type="button"
                  onClick={() => setSeoDescription(excerpt.trim() || content.substring(0, 160).replace(/<[^>]*>?/gm, ''))}
                  className="text-[10px] font-semibold text-sky-600 hover:text-sky-800"
                >
                  Auto-fill
                </button>
              </div>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description snippet for search engines (140-160 characters)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => {
                  setKeywordsInput(e.target.value);
                  setTagsInput(e.target.value);
                }}
                placeholder="Target keywords separated by commas (e.g. UNILAG admission 2026, Post-UTME, cut off marks)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </>
      )}
    </div>

    {/* Sidebar Settings (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Featured Cover Image Box - High Priority */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Featured Cover Image *</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(!showMediaPicker)}
                className="text-xs font-bold text-sky-600 hover:text-sky-800"
              >
                Media Assets
              </button>
            </div>

            {/* Active Cover Preview */}
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-44 relative group">
              <img
                src={featuredImage}
                alt="Active cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-600" />
                  <span>Replace Photo</span>
                </button>
              </div>
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                Active Cover
              </span>
            </div>

            {/* Drag & Drop Upload Zone for Cover */}
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setCoverDragOver(true);
                }}
                onDragLeave={() => setCoverDragOver(false)}
                onDrop={handleCoverDrop}
                onClick={() => coverFileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center ${
                  uploadingCover
                    ? 'border-sky-400 bg-sky-50'
                    : coverDragOver
                    ? 'border-sky-500 bg-sky-100/60 scale-[1.01]'
                    : 'border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50'
                }`}
              >
                {uploadingCover ? (
                  <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mb-1.5" />
                ) : (
                  <Upload className="w-6 h-6 text-sky-600 mb-1.5" />
                )}
                <span className="text-xs font-bold text-sky-950">
                  {uploadingCover ? 'Uploading Cover Image...' : 'Upload Cover from Phone or Computer'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Drag & drop or tap to browse • PNG, JPG, WEBP
                </span>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverFileUpload(f);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Toggle Direct URL Input */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1"
              >
                <Link className="w-3 h-3" />
                <span>{showCoverUrlInput ? 'Hide image URL input' : 'Or paste direct image URL'}</span>
              </button>

              {showCoverUrlInput && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Quick Media Presets */}
            {showMediaPicker && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Select from Media Assets:
                </span>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {mediaItems.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => {
                        setFeaturedImage(med.file_url);
                        setShowMediaPicker(false);
                      }}
                      className="h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-sky-500 focus:outline-none"
                    >
                      <img src={med.file_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Publishing Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Publishing Controls
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="published">Published (Visible Publicly)</option>
                <option value="draft">Draft (Private Admin Only)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  Hero Featured Story
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600 fill-current" />
                  Breaking News Ticker Banner
                </span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author / Reporter Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Category & Institution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Taxonomy & Categories
              </h3>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                {selectedCategoryIds.length} selected
              </span>
            </div>

            {/* Multi-category Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Categories * <span className="text-[11px] text-slate-400 font-normal">(Select multiple categories)</span>
              </label>

              {/* Selected Categories as Chips / Tags with Remove × */}
              <div className="min-h-[42px] p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-wrap items-center gap-1.5">
                {selectedCategoryIds.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    No categories assigned yet. Click from the list below to assign.
                  </span>
                ) : (
                  selectedCategoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    const name = cat?.name || id;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs group"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCategoryIds(selectedCategoryIds.filter((cid) => cid !== id));
                          }}
                          className="hover:bg-sky-700/80 rounded p-0.5 transition-colors cursor-pointer"
                          title={`Remove ${name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Category Search & Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search categories (e.g. JAMB, Admissions, UTME)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Available Category List */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1 bg-white">
                {categories
                  .filter(
                    (c) =>
                      !categorySearchQuery.trim() ||
                      c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                      c.slug.toLowerCase().includes(categorySearchQuery.toLowerCase())
                  )
                  .map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                          } else {
                            setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-100 text-sky-900 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected ? (
                          <span className="text-sky-700 flex items-center gap-1 text-[11px] font-bold">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">+ Add</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Tertiary Institution
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              >
                <option value="">General Nigerian Education</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.name}>
                    {i.name} ({i.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Source / Application Portal URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://jamb.gov.ng or https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="JAMB CAPS, Cut-off Mark, UNILAG"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel / Back to Articles
            </button>
            <button
              type="button"
              onClick={handleSaveSubmit}
              disabled={saving}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Story...' : 'Save & Publish Article'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
