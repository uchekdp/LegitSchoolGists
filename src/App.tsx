import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { BreakingTicker } from './components/home/BreakingTicker';
import { HeroFeatured } from './components/home/HeroFeatured';
import { BreakingUpdatesFeed } from './components/home/BreakingUpdatesFeed';
import { AdmissionSection } from './components/home/AdmissionSection';
import { ScholarshipSection } from './components/home/ScholarshipSection';
import { CareerCampusSection } from './components/home/CareerCampusSection';
import { NucSection } from './components/home/NucSection';
import { CategoryFilterBar } from './components/home/CategoryFilterBar';
import { ArticleCard } from './components/article/ArticleCard';
import { ArticleDetail } from './components/article/ArticleDetail';
import { CategoryView } from './components/pages/CategoryView';
import { SearchView } from './components/pages/SearchView';
import { AboutView } from './components/pages/AboutView';
import { ContactView } from './components/pages/ContactView';
import { NotFoundView } from './components/pages/NotFoundView';
import { isArticleInCategory, filterArticlesByCategory } from './utils/categoryHelper';
import { BookOpen, Layers } from 'lucide-react';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminArticles } from './components/admin/AdminArticles';
import { AdminArticleEditor } from './components/admin/AdminArticleEditor';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminInstitutions } from './components/admin/AdminInstitutions';
import { AdminMedia } from './components/admin/AdminMedia';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminSupabaseManager } from './components/admin/AdminSupabaseManager';

// Types & Services
import { Article, Category, ContactMessage, Institution, MediaItem, SiteSettings } from './types';
import { 
  fetchArticles, 
  fetchCategories, 
  fetchInstitutions, 
  fetchMediaItems, 
  fetchSiteSettings, 
  fetchContactMessages, 
  saveArticle, 
  deleteArticle, 
  saveCategory, 
  deleteCategory, 
  saveInstitution, 
  deleteInstitution, 
  addMediaItem, 
  deleteMediaItem, 
  saveSiteSettings,
  markContactMessageRead
} from './services/dataService';
import { getCurrentAdminUser, logoutAdmin, AdminUser } from './services/authService';

export default function App() {
  // Check initial URL path to allow accessing /admin directly
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
      if (path.startsWith('/article/')) {
        return 'article';
      }
      if (path.startsWith('/category/')) {
        return 'category';
      }
      if (path === '/about') return 'about';
      if (path === '/contact') return 'contact';
      if (path === '/search') return 'search';
    }
    return 'home';
  };

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string>('');
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  // Sync initial slug or category from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/article/')) {
        setCurrentSlug(path.replace('/article/', ''));
      } else if (path.startsWith('/category/')) {
        setCurrentCategorySlug(path.replace('/category/', ''));
      }
    }
  }, []);

  // Listen for browser back/forward buttons and /admin route navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentPage('admin');
      } else if (path === '/' || path === '') {
        setCurrentPage('home');
      } else if (path.startsWith('/article/')) {
        setCurrentSlug(window.location.pathname.replace('/article/', ''));
        setCurrentPage('article');
      } else if (path.startsWith('/category/')) {
        setCurrentCategorySlug(window.location.pathname.replace('/category/', ''));
        setCurrentPage('category');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/search') {
        setCurrentPage('search');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin Portal State
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // App Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'LegitSchoolGists',
    tagline: "Nigeria's Premier Campus News & Academic Excellence Platform",
    email: 'legitschoolgistsblog@gmail.com',
    phone: '+234 811 5578 054',
    whatsapp: '+234 903 973 3298',
    address: 'Lagos & Abuja, Nigeria',
    about_summary:
      'LegitSchoolGists bridges the information gap between Nigerian tertiary institutions and their students.',
    breaking_announcement:
      'JAMB 2026/2027 CAPS Portal Officially Open | NUC Approves New Degree Programmes Across 5 Federal Universities',
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [justPublishedArticle, setJustPublishedArticle] = useState<Article | null>(null);
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      // Clear legacy dummy articles or empty cache if needed so categorized articles load
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('lsg_local_articles');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && (parsed.length === 0 || parsed.some((a: any) => a.id === 'art-1' || a.id === 'art-2'))) {
              localStorage.removeItem('lsg_local_articles');
            }
          } catch {}
        }
      }

      setLoading(true);
      try {
        const [arts, cats, insts, meds, sets, msgs] = await Promise.all([
          fetchArticles({ status: 'all' }),
          fetchCategories(),
          fetchInstitutions(),
          fetchMediaItems(),
          fetchSiteSettings(),
          fetchContactMessages(),
        ]);
        setArticles(arts);
        setCategories(cats);
        setInstitutions(insts);
        setMediaItems(meds);
        setSettings(sets);
        setMessages(msgs);
        setAdminUser(getCurrentAdminUser());
      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync browser title dynamically based on active page
  useEffect(() => {
    if (currentPage === 'home') {
      document.title = `${settings.site_name} – Nigerian Campus News & Education Portal`;
    } else if (currentPage === 'article' && currentSlug) {
      const art = articles.find((a) => a.slug === currentSlug);
      if (art) document.title = `${art.seo_title || art.title} | ${settings.site_name}`;
    } else if (currentPage === 'category' && currentCategorySlug) {
      const cat = categories.find((c) => c.slug === currentCategorySlug);
      if (cat) document.title = `${cat.name} Updates & Circulars | ${settings.site_name}`;
    } else if (currentPage === 'admin') {
      document.title = `Admin Console | ${settings.site_name}`;
    } else {
      document.title = `${currentPage.toUpperCase()} | ${settings.site_name}`;
    }
  }, [currentPage, currentSlug, currentCategorySlug, articles, categories, settings]);

  // Navigation Handlers
  const handleNavigate = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentPage('admin');
    } else if (page === 'home') {
      window.history.pushState({}, '', '/');
      setCurrentPage('home');
    } else if (page === 'category' && param) {
      window.history.pushState({}, '', `/category/${param}`);
      setCurrentCategorySlug(param);
      setCurrentPage('category');
    } else if (page === 'article' && param) {
      window.history.pushState({}, '', `/article/${param}`);
      setCurrentSlug(param);
      setCurrentPage('article');
    } else {
      window.history.pushState({}, '', `/${page}`);
      setCurrentPage(page);
    }
  };

  const handleReadArticle = (slug: string) => {
    window.history.pushState({}, '', `/article/${slug}`);
    setCurrentSlug(slug);
    setCurrentPage('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearch = (initial?: string) => {
    window.history.pushState({}, '', '/search');
    setSearchInitialQuery(initial || '');
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handlers
  const handleAdminLoginSuccess = () => {
    setAdminUser(getCurrentAdminUser());
    setAdminTab('overview');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    window.history.pushState({}, '', '/');
    setCurrentPage('home');
  };

  const handleSaveArticleAction = async (artData: Partial<Article> & { title: string }) => {
    const saved = await saveArticle(artData);
    // Instantly update state so it appears immediately on both admin and frontend
    setArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== saved.id);
      return [saved, ...filtered];
    });

    const updated = await fetchArticles({ status: 'all' });
    if (updated && updated.length > 0) {
      const hasSaved = updated.some((a) => a.id === saved.id);
      setArticles(hasSaved ? updated : [saved, ...updated]);
    }

    setEditingArticle(null);
    setJustPublishedArticle(saved);
    setAdminTab('articles');
  };

  const handleDeleteArticleAction = async (id: string) => {
    await deleteArticle(id);
    const updated = await fetchArticles({ status: 'all' });
    setArticles(updated);
  };

  const handleToggleStatusAction = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    await saveArticle({ ...article, status: newStatus });
    const updated = await fetchArticles({ status: 'all' });
    setArticles(updated);
  };

  const handleToggleFeaturedAction = async (article: Article) => {
    await saveArticle({ ...article, is_featured: !article.is_featured });
    const updated = await fetchArticles({ status: 'all' });
    setArticles(updated);
  };

  // Category Actions
  const handleSaveCategoryAction = async (catData: Partial<Category> & { name: string }) => {
    await saveCategory(catData);
    const updated = await fetchCategories();
    setCategories(updated);
  };

  const handleDeleteCategoryAction = async (id: string) => {
    await deleteCategory(id);
    const updatedCats = await fetchCategories();
    setCategories(updatedCats);
    const updatedArts = await fetchArticles({ status: 'all' });
    setArticles(updatedArts);
  };

  // Institution Actions
  const handleSaveInstitutionAction = async (inst: Institution) => {
    await saveInstitution(inst);
    const updated = await fetchInstitutions();
    setInstitutions(updated);
  };

  const handleDeleteInstitutionAction = async (id: string) => {
    await deleteInstitution(id);
    const updated = await fetchInstitutions();
    setInstitutions(updated);
  };

  // Media Actions
  const handleUploadMediaAction = async (mediaData: any) => {
    await addMediaItem(mediaData);
    const updated = await fetchMediaItems();
    setMediaItems(updated);
  };

  const handleDeleteMediaAction = async (id: string) => {
    await deleteMediaItem(id);
    const updated = await fetchMediaItems();
    setMediaItems(updated);
  };

  // Settings Actions
  const handleSaveSettingsAction = async (newSettings: SiteSettings) => {
    const saved = await saveSiteSettings(newSettings);
    setSettings(saved);
  };

  // Message Actions
  const handleMarkMessageReadAction = async (id: string) => {
    await markContactMessageRead(id);
    const updated = await fetchContactMessages();
    setMessages(updated);
  };

  // Data subsets for homepage with strict offset / do-not-repeat deduplication
  const publishedArticles = articles.filter((a) => a.status === 'published');
  
  // Breaking articles with uploaded cover images for the Hero Page, newest first, capped at 30 max
  const breakingCoverArticles = publishedArticles
    .filter((a) => a.is_breaking && Boolean(a.featured_image))
    .sort((a, b) => new Date(b.published_at || b.created_at || '').getTime() - new Date(a.published_at || a.created_at || '').getTime())
    .slice(0, 30);

  const featuredArticle = publishedArticles.find((a) => a.is_featured) || publishedArticles[0] || null;
  
  // Top Hero section displayed articles:
  // 1. Featured / breaking slider article
  // 2. Side trending stories (top 3)
  const heroSliderIds = new Set<string>();
  if (breakingCoverArticles.length > 0) {
    breakingCoverArticles.forEach((a) => heroSliderIds.add(a.id));
  } else if (featuredArticle) {
    heroSliderIds.add(featuredArticle.id);
  }

  const trendingArticles = publishedArticles.filter((a) => !heroSliderIds.has(a.id));
  const topHeroSideArticles = trendingArticles.slice(0, 3);
  
  // Master exclusion set of all articles already rendered in the top hero component
  const displayedHeroArticleIds = new Set<string>([
    ...Array.from(heroSliderIds),
    ...topHeroSideArticles.map((a) => a.id),
  ]);

  // Excluded feeds for lower sections ensuring 0 duplicates on the homepage
  const remainingArticles = publishedArticles.filter((a) => !displayedHeroArticleIds.has(a.id));

  // Dedicated Breaking Updates Feed (capped at exactly 30 posts, titles only)
  const breakingUpdatesArticles = publishedArticles
    .filter((a) => isArticleInCategory(a, 'cat-breaking-updates') || a.is_breaking)
    .sort((a, b) => new Date(b.published_at || b.created_at || '').getTime() - new Date(a.published_at || a.created_at || '').getTime());

  const breakingFeedPosts = breakingUpdatesArticles.length >= 30
    ? breakingUpdatesArticles.slice(0, 30)
    : [
        ...breakingUpdatesArticles,
        ...publishedArticles.filter((a) => !breakingUpdatesArticles.some((b) => b.id === a.id)),
      ].slice(0, 30);

  const admissionArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-admission') || isArticleInCategory(a, 'cat-post-utme')
  );

  const jambArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-jamb')
  );

  const examArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-waec') || isArticleInCategory(a, 'cat-neco')
  );

  const scholarshipArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-scholarships')
  );

  const careerArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-career')
  );

  const campusArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-campus-life') || isArticleInCategory(a, 'cat-academic-excellence')
  );

  const nucArticles = remainingArticles.filter(
    (a) => isArticleInCategory(a, 'cat-nuc-accreditation')
  );

  // If in Admin Section
  if (currentPage === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToSite={() => handleNavigate('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          if (tab === 'new-article') {
            setEditingArticle(null);
          }
          setAdminTab(tab);
        }}
        onLogout={handleAdminLogout}
        onViewPublicSite={() => handleNavigate('home')}
        adminUser={adminUser}
        unreadCount={messages.filter((m) => !m.read).length}
      >
        {adminTab === 'overview' && (
          <AdminOverview
            articles={articles}
            categories={categories}
            messages={messages}
            onNavigateTab={(tab) => {
              if (tab === 'new-article') setEditingArticle(null);
              setAdminTab(tab);
            }}
            onEditArticle={(art) => {
              setEditingArticle(art);
              setAdminTab('edit-article');
            }}
          />
        )}

        {adminTab === 'articles' && (
          <AdminArticles
            articles={articles}
            categories={categories}
            justPublishedArticle={justPublishedArticle}
            onDismissJustPublished={() => setJustPublishedArticle(null)}
            onNewArticle={() => {
              setEditingArticle(null);
              setJustPublishedArticle(null);
              setAdminTab('new-article');
            }}
            onEditArticle={(art) => {
              setEditingArticle(art);
              setJustPublishedArticle(null);
              setAdminTab('edit-article');
            }}
            onDeleteArticle={handleDeleteArticleAction}
            onToggleStatus={handleToggleStatusAction}
            onToggleFeatured={handleToggleFeaturedAction}
            onViewArticle={handleReadArticle}
            onGoHome={() => handleNavigate('home')}
          />
        )}

        {(adminTab === 'new-article' || adminTab === 'edit-article') && (
          <AdminArticleEditor
            initialArticle={adminTab === 'edit-article' ? editingArticle : null}
            categories={categories}
            institutions={institutions}
            mediaItems={mediaItems}
            onSave={handleSaveArticleAction}
            onCancel={() => setAdminTab('articles')}
            onPreview={handleReadArticle}
          />
        )}

        {adminTab === 'categories' && (
          <AdminCategories
            categories={categories}
            articles={articles}
            onSaveCategory={handleSaveCategoryAction}
            onDeleteCategory={handleDeleteCategoryAction}
          />
        )}

        {adminTab === 'institutions' && (
          <AdminInstitutions
            institutions={institutions}
            onSaveInstitution={handleSaveInstitutionAction}
            onDeleteInstitution={handleDeleteInstitutionAction}
          />
        )}

        {adminTab === 'media' && (
          <AdminMedia
            mediaItems={mediaItems}
            onUploadMedia={handleUploadMediaAction}
            onDeleteMedia={handleDeleteMediaAction}
          />
        )}

        {adminTab === 'messages' && (
          <AdminMessages
            messages={messages}
            onMarkRead={handleMarkMessageReadAction}
          />
        )}

        {adminTab === 'settings' && (
          <AdminSettings
            settings={settings}
            onSaveSettings={handleSaveSettingsAction}
          />
        )}

        {adminTab === 'supabase' && <AdminSupabaseManager />}
      </AdminLayout>
    );
  }

  // Active public article
  const activeArticle = articles.find((a) => a.slug === currentSlug) || null;
  const activeCategory = categories.find(
    (c) => c.slug === currentCategorySlug || c.id === currentCategorySlug || c.id === `cat-${currentCategorySlug}`
  ) || {
    id: currentCategorySlug,
    name: currentCategorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug: currentCategorySlug,
    description: '',
  };

  const currentFilteredCategory = selectedHomeCategory
    ? categories.find((c) => c.id === selectedHomeCategory) || null
    : null;

  const filteredHomeArticles = currentFilteredCategory
    ? filterArticlesByCategory(publishedArticles, currentFilteredCategory)
    : publishedArticles;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white">
      {/* Public Header */}
      <Header
        settings={settings}
        activeNav={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => handleOpenSearch('')}
        isAdminLoggedIn={Boolean(adminUser)}
      />

      {/* Main Content Area */}
      <div className="grow">
        {/* HOMEPAGE VIEW */}
        {currentPage === 'home' && (
          <main>
            {/* Breaking News Ticker with all article titles sliding left-to-right */}
            <BreakingTicker
              articles={publishedArticles.length > 0 ? publishedArticles : articles}
              onReadArticle={handleReadArticle}
              announcement={settings.breaking_announcement}
            />

            {/* Interactive Category Filter Bar */}
            <CategoryFilterBar
              categories={categories}
              articles={publishedArticles}
              selectedCategoryId={selectedHomeCategory}
              onSelectCategory={(catId) => setSelectedHomeCategory(catId)}
            />

            {selectedHomeCategory && currentFilteredCategory ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
                {/* Header for Filtered Category */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">
                        Filtered by Category
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {filteredHomeArticles.length} Published Articles
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {currentFilteredCategory.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                      {currentFilteredCategory.description || `All verified updates, circulars, and announcements under ${currentFilteredCategory.name}.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedHomeCategory(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5 border border-slate-300"
                  >
                    <span>Show All Sections</span>
                  </button>
                </div>

                {filteredHomeArticles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHomeArticles.map((art) => (
                      <ArticleCard key={art.id} article={art} onReadArticle={handleReadArticle} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No Articles in {currentFilteredCategory.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No published articles have been categorized under this channel yet.
                    </p>
                    <button
                      onClick={() => setSelectedHomeCategory(null)}
                      className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                    >
                      Show All Stories
                    </button>
                  </div>
                )}
              </div>
            ) : publishedArticles.length > 0 ? (
              <>
                {/* Hero Featured Article & Trending Stories with Breaking Cover Slider */}
                <HeroFeatured
                  featuredArticle={featuredArticle}
                  breakingArticles={breakingCoverArticles}
                  sideArticles={publishedArticles}
                  onReadArticle={handleReadArticle}
                  onNavigateCategory={(cat) => handleNavigate('category', cat)}
                />

                {/* Dedicated Breaking Updates Feed (Exactly 30 posts, clean list of titles only) */}
                {breakingFeedPosts.length > 0 && (
                  <BreakingUpdatesFeed
                    articles={breakingFeedPosts}
                    onReadArticle={handleReadArticle}
                    onNavigateCategory={(cat) => handleNavigate('category', cat)}
                  />
                )}

                {/* University & Polytechnic Admission Section */}
                {admissionArticles.length > 0 && (
                  <AdmissionSection
                    articles={admissionArticles}
                    onReadArticle={handleReadArticle}
                    onNavigateCategory={(cat) => handleNavigate('category', cat)}
                  />
                )}

                {/* Verified Scholarships Section (Filterable) */}
                {scholarshipArticles.length > 0 && (
                  <ScholarshipSection
                    scholarshipArticles={scholarshipArticles}
                    onReadArticle={handleReadArticle}
                    onNavigateCategory={(cat) => handleNavigate('category', cat)}
                  />
                )}

                {/* NUC Approvals & Accreditations Insight */}
                {nucArticles.length > 0 && (
                  <NucSection
                    nucArticles={nucArticles}
                    onReadArticle={handleReadArticle}
                    onNavigateCategory={(cat) => handleNavigate('category', cat)}
                  />
                )}

                {/* Career Guidance & Campus Life Section */}
                {(careerArticles.length > 0 || campusArticles.length > 0) && (
                  <CareerCampusSection
                    careerArticles={careerArticles}
                    campusArticles={campusArticles}
                    onReadArticle={handleReadArticle}
                    onNavigateCategory={(cat) => handleNavigate('category', cat)}
                  />
                )}
              </>
            ) : (
              /* Clean Welcome Launchpad: Ready for First Article to be Published */
              <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
                <div className="flex justify-center mb-2">
                  <div className="h-20 sm:h-24 w-auto max-w-[260px] sm:max-w-[320px] rounded-2xl bg-white p-3 shadow-md border border-slate-200 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="LegitSchoolGists"
                      className="h-full w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.ibb.co/Zp452bpM/73b6adf9-0c8c-4f77-9623-83e3753202d9.jpg';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Welcome to Legit<span className="text-orange-600">School</span><span className="text-sky-600">Gists</span>
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Nigeria's premier platform for campus news, university updates, scholarship opportunities, student life, and academic excellence. All previous demo articles have been cleared so you can be the very first to publish.
                  </p>
                </div>

                {/* Call to Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleNavigate('contact')}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Contact Newsroom</span>
                  </button>

                  <button
                    onClick={() => handleOpenSearch('')}
                    className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 transition-all shadow-sm"
                  >
                    <span>Search Educational Circulars</span>
                  </button>
                </div>

                {/* Ready Topics Grid */}
                <div className="pt-8 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Ready Publishing Channels
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    {categories.slice(0, 8).map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleNavigate('category', cat.slug)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 shadow-sm cursor-pointer transition-all group"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-sky-600 transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Awaiting first publication
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* SINGLE ARTICLE DETAIL VIEW */}
        {currentPage === 'article' && activeArticle && (
          <ArticleDetail
            article={activeArticle}
            relatedArticles={publishedArticles.filter(
              (a) => a.id !== activeArticle.id && a.category_id === activeArticle.category_id
            )}
            onBack={() => handleNavigate('home')}
            onReadArticle={handleReadArticle}
            onNavigateCategory={(cat) => handleNavigate('category', cat)}
          />
        )}

        {/* CATEGORY ARCHIVE VIEW */}
        {currentPage === 'category' && (
          <CategoryView
            category={
              currentCategorySlug === 'education-news'
                ? { ...activeCategory, name: 'News & Gist' }
                : activeCategory
            }
            articles={filterArticlesByCategory(publishedArticles, activeCategory)}
            onReadArticle={handleReadArticle}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* SEARCH ARCHIVE VIEW */}
        {currentPage === 'search' && (
          <SearchView
            articles={publishedArticles}
            categories={categories}
            initialQuery={searchInitialQuery}
            onReadArticle={handleReadArticle}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* ABOUT US VIEW */}
        {currentPage === 'about' && (
          <AboutView
            settings={settings}
            onBack={() => handleNavigate('home')}
            onNavigateContact={() => handleNavigate('contact')}
          />
        )}

        {/* CONTACT VIEW */}
        {currentPage === 'contact' && (
          <ContactView
            settings={settings}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* 404 NOT FOUND VIEW */}
        {((currentPage === 'article' && !activeArticle) || currentPage === 'not-found') && (
          <NotFoundView
            popularArticles={publishedArticles}
            onNavigateHome={() => handleNavigate('home')}
            onOpenSearch={() => handleOpenSearch('')}
            onReadArticle={handleReadArticle}
          />
        )}
      </div>

      {/* Floating WhatsApp Quick Action Desk */}
      <WhatsAppButton
        phoneNumber={settings.whatsapp || '+234 903 973 3298'}
        message="Hello LegitSchoolGists, I need educational inquiries regarding campus admission."
      />

      {/* Public Footer */}
      <Footer settings={settings} onNavigate={handleNavigate} />
    </div>
  );
}
