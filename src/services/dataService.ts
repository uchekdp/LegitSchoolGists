import { Article, ArticleComment, Category, ContactMessage, Institution, MediaItem, SiteSettings, Subscriber, Tag } from '../types';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_INSTITUTIONS, INITIAL_SETTINGS, INITIAL_TAGS } from '../data/initialData';
import { getSupabase } from '../lib/supabaseClient';

const STORAGE_KEY_ARTICLES = 'lsg_local_articles';
const STORAGE_KEY_CATEGORIES = 'lsg_local_categories';
const STORAGE_KEY_INSTITUTIONS = 'lsg_local_institutions';
const STORAGE_KEY_TAGS = 'lsg_local_tags';
const STORAGE_KEY_SETTINGS = 'lsg_local_settings';
const STORAGE_KEY_MEDIA = 'lsg_local_media';
const STORAGE_KEY_MESSAGES = 'lsg_local_messages';
const STORAGE_KEY_SUBSCRIBERS = 'lsg_local_subscribers';
const STORAGE_KEY_COMMENTS = 'lsg_local_comments';

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ----------------- ARTICLES SERVICE -----------------

export async function fetchArticles(params?: {
  categoryId?: string;
  categorySlug?: string;
  status?: 'published' | 'draft' | 'all';
  searchQuery?: string;
  limit?: number;
}): Promise<Article[]> {
  const supabase = getSupabase();
  const statusFilter = params?.status || 'published';

  if (supabase) {
    try {
      let query = supabase.from('articles').select('*').order('published_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (params?.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (!error && data) {
        const categoriesList = await fetchCategories();
        const catMap = new Map(categoriesList.map((c) => [c.id, c.name]));
        const catSlugMap = new Map(categoriesList.map((c) => [c.id, c.slug]));
        
        // Merge Supabase items with any locally saved articles so they are never lost
        const localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, INITIAL_ARTICLES);
        const articleMap = new Map<string, Article>();

        // Add Supabase items
        for (const item of (data as Article[])) {
          const assignedIds = Array.isArray(item.category_ids) && item.category_ids.length > 0
            ? item.category_ids
            : [item.category_id || 'cat-education-news'];
          const assignedNames = assignedIds.map((id) => catMap.get(id) || id);
          const assignedCategories = assignedIds.map((id) => ({
            id,
            name: catMap.get(id) || 'Education News',
            slug: catSlugMap.get(id) || id.replace(/^cat-/, ''),
          }));

          articleMap.set(item.id, {
            ...item,
            category_id: item.category_id || assignedIds[0],
            category_name: item.category_name || catMap.get(item.category_id) || assignedNames[0] || 'Education News',
            category_ids: assignedIds,
            category_names: assignedNames,
            categories: assignedCategories,
          });
        }

        // Merge local items that may be newly published or pending
        for (const local of localArticles) {
          if (!articleMap.has(local.id)) {
            const assignedIds = Array.isArray(local.category_ids) && local.category_ids.length > 0
              ? local.category_ids
              : [local.category_id || 'cat-education-news'];
            const assignedNames = assignedIds.map((id) => catMap.get(id) || id);
            const assignedCategories = assignedIds.map((id) => ({
              id,
              name: catMap.get(id) || 'Education News',
              slug: catSlugMap.get(id) || id.replace(/^cat-/, ''),
            }));

            articleMap.set(local.id, {
              ...local,
              category_id: local.category_id || assignedIds[0],
              category_name: local.category_name || catMap.get(local.category_id) || assignedNames[0] || 'Education News',
              category_ids: assignedIds,
              category_names: assignedNames,
              categories: assignedCategories,
            });
          }
        }

        let results = Array.from(articleMap.values());
        if (statusFilter !== 'all') {
          results = results.filter((a) => a.status === statusFilter);
        }
        if (params?.categoryId) {
          const targetCatId = params.categoryId;
          const targetCatName = catMap.get(targetCatId)?.toLowerCase();
          results = results.filter(
            (a) =>
              a.category_id === targetCatId ||
              (a.category_ids && a.category_ids.includes(targetCatId)) ||
              (targetCatName && a.category_name?.toLowerCase() === targetCatName) ||
              (targetCatName && a.category_names && a.category_names.some((n) => n.toLowerCase() === targetCatName))
          );
        } else if (params?.categorySlug) {
          const foundCat = categoriesList.find(
            (c) => c.slug === params.categorySlug || c.id === params.categorySlug || c.id === `cat-${params.categorySlug}`
          );
          if (foundCat) {
            results = results.filter(
              (a) =>
                a.category_id === foundCat.id ||
                (a.category_ids && a.category_ids.includes(foundCat.id)) ||
                a.category_name?.toLowerCase() === foundCat.name.toLowerCase() ||
                (a.category_names && a.category_names.some((n) => n.toLowerCase() === foundCat.name.toLowerCase()))
            );
          }
        }
        if (params?.searchQuery) {
          const q = params.searchQuery.toLowerCase();
          results = results.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.excerpt.toLowerCase().includes(q) ||
              a.content.toLowerCase().includes(q) ||
              (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))) ||
              (a.category_names && a.category_names.some((n) => n.toLowerCase().includes(q))) ||
              (a.institution && a.institution.toLowerCase().includes(q))
          );
        }
        results.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        if (params?.limit) {
          results = results.slice(0, params.limit);
        }
        return results;
      }
    } catch (err) {
      console.warn('Supabase articles fetch fallback to local:', err);
    }
  }

  // Fallback to local storage (initialized with classified category articles)
  const categoriesList = await fetchCategories();
  const catMap = new Map(categoriesList.map((c) => [c.id, c.name]));
  const catSlugMap = new Map(categoriesList.map((c) => [c.id, c.slug]));

  let localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, INITIAL_ARTICLES);
  if (!Array.isArray(localArticles) || localArticles.length === 0) {
    localArticles = INITIAL_ARTICLES;
    setLocalItem(STORAGE_KEY_ARTICLES, localArticles);
  }

  let formattedLocal = localArticles.map((item) => {
    const assignedIds = Array.isArray(item.category_ids) && item.category_ids.length > 0
      ? item.category_ids
      : [item.category_id || 'cat-education-news'];
    const assignedNames = assignedIds.map((id) => catMap.get(id) || id);
    const assignedCategories = assignedIds.map((id) => ({
      id,
      name: catMap.get(id) || 'Education News',
      slug: catSlugMap.get(id) || id.replace(/^cat-/, ''),
    }));

    return {
      ...item,
      category_id: item.category_id || assignedIds[0],
      category_name: item.category_name || catMap.get(item.category_id) || assignedNames[0] || 'Education News',
      category_ids: assignedIds,
      category_names: assignedNames,
      categories: assignedCategories,
    };
  });

  let filtered = [...formattedLocal];

  if (statusFilter !== 'all') {
    filtered = filtered.filter((a) => a.status === statusFilter);
  }

  if (params?.categoryId) {
    const targetCatId = params.categoryId;
    const targetCatName = catMap.get(targetCatId)?.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.category_id === targetCatId ||
        (a.category_ids && a.category_ids.includes(targetCatId)) ||
        (targetCatName && a.category_name?.toLowerCase() === targetCatName) ||
        (targetCatName && a.category_names && a.category_names.some((n) => n.toLowerCase() === targetCatName))
    );
  } else if (params?.categorySlug) {
    const foundCat = categoriesList.find(
      (c) => c.slug === params.categorySlug || c.id === params.categorySlug || c.id === `cat-${params.categorySlug}`
    );
    if (foundCat) {
      filtered = filtered.filter(
        (a) =>
          a.category_id === foundCat.id ||
          (a.category_ids && a.category_ids.includes(foundCat.id)) ||
          a.category_name?.toLowerCase() === foundCat.name.toLowerCase() ||
          (a.category_names && a.category_names.some((n) => n.toLowerCase() === foundCat.name.toLowerCase()))
      );
    }
  }

  if (params?.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))) ||
        (a.category_names && a.category_names.some((n) => n.toLowerCase().includes(q))) ||
        (a.institution && a.institution.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return filtered;
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getSupabase();
  const categoriesList = await fetchCategories();
  const catMap = new Map(categoriesList.map((c) => [c.id, c.name]));
  const catSlugMap = new Map(categoriesList.map((c) => [c.id, c.slug]));

  if (supabase) {
    try {
      const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single();
      if (!error && data) {
        const art = data as Article;
        const assignedIds = Array.isArray(art.category_ids) && art.category_ids.length > 0
          ? art.category_ids
          : [art.category_id || 'cat-education-news'];
        const assignedNames = assignedIds.map((id) => catMap.get(id) || id);
        const assignedCategories = assignedIds.map((id) => ({
          id,
          name: catMap.get(id) || 'Education News',
          slug: catSlugMap.get(id) || id.replace(/^cat-/, ''),
        }));

        art.category_id = art.category_id || assignedIds[0];
        art.category_name = art.category_name || catMap.get(art.category_id) || assignedNames[0] || 'Education News';
        art.category_ids = assignedIds;
        art.category_names = assignedNames;
        art.categories = assignedCategories;
        return art;
      }
    } catch (err) {
      console.warn('Supabase article by slug error:', err);
    }
  }

  const articles = await fetchArticles({ status: 'all' });
  const found = articles.find((a) => a.slug === slug);
  return found || null;
}

export async function saveArticle(article: Partial<Article> & { title: string }): Promise<Article> {
  const supabase = getSupabase();
  const id = article.id || `art-${Date.now()}`;
  const now = new Date().toISOString();
  const categoriesList = await fetchCategories();
  const catMap = new Map(categoriesList.map((c) => [c.id, c.name]));
  const catSlugMap = new Map(categoriesList.map((c) => [c.id, c.slug]));

  // Resolve multi-category IDs and names
  const selectedCategoryIds = Array.isArray(article.category_ids) && article.category_ids.length > 0
    ? article.category_ids
    : article.category_id
    ? [article.category_id]
    : ['cat-education-news'];

  const primaryCategoryId = selectedCategoryIds[0] || 'cat-education-news';
  const resolvedCategoryName = article.category_name || catMap.get(primaryCategoryId) || 'Education News';
  const resolvedCategoryNames = selectedCategoryIds.map((cId) => catMap.get(cId) || cId);
  const resolvedCategories = selectedCategoryIds.map((cId) => ({
    id: cId,
    name: catMap.get(cId) || 'Education News',
    slug: catSlugMap.get(cId) || cId.replace(/^cat-/, ''),
  }));

  const fullArticle: Article = {
    id,
    title: article.title.trim(),
    slug:
      article.slug?.trim() ||
      article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `post-${Date.now()}`,
    excerpt:
      article.excerpt?.trim() ||
      article.content?.trim().substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' ||
      article.title,
    content: article.content || '',
    featured_image:
      article.featured_image ||
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    category_id: primaryCategoryId,
    category_name: resolvedCategoryName,
    category_ids: selectedCategoryIds,
    category_names: resolvedCategoryNames,
    categories: resolvedCategories,
    author_name: article.author_name?.trim() || 'LegitSchoolGists Editorial',
    status: article.status || 'published',
    is_featured: Boolean(article.is_featured),
    is_breaking: Boolean(article.is_breaking),
    views: article.views || 0,
    seo_title: article.seo_title?.trim() || article.title.trim(),
    seo_description: article.seo_description?.trim() || article.excerpt?.trim() || '',
    keywords: Array.isArray(article.keywords)
      ? article.keywords
      : typeof (article as any).keywords === 'string'
      ? (article as any).keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : Array.isArray(article.tags)
      ? article.tags
      : [],
    tags: Array.isArray(article.tags) ? article.tags : [],
    institution: article.institution?.trim() || undefined,
    source_url: article.source_url?.trim() || undefined,
    published_at: article.published_at || now,
    created_at: article.created_at || now,
    updated_at: now,
  };

  // Try saving to Supabase backend if configured
  if (supabase) {
    try {
      // 1. Pre-sync all selected categories in Supabase to eliminate foreign key errors (23503)
      for (const catId of selectedCategoryIds) {
        try {
          const cName = catMap.get(catId) || catId;
          await supabase.from('categories').upsert(
            {
              id: catId,
              name: cName,
              slug: catSlugMap.get(catId) || catId.replace(/^cat-/, '') || 'news',
              description: `${cName} updates & campus circulars`,
            },
            { onConflict: 'id' }
          );
        } catch (catSyncErr) {
          console.warn('Pre-sync category warning:', catSyncErr);
        }
      }

      // 2. Build standard DB payload excluding computed properties like category_name
      const dbPayload: Record<string, any> = {
        id: fullArticle.id,
        title: fullArticle.title,
        slug: fullArticle.slug,
        excerpt: fullArticle.excerpt,
        content: fullArticle.content,
        featured_image: fullArticle.featured_image,
        category_id: fullArticle.category_id,
        category_ids: fullArticle.category_ids,
        author_name: fullArticle.author_name,
        status: fullArticle.status,
        is_featured: fullArticle.is_featured,
        is_breaking: fullArticle.is_breaking,
        views: fullArticle.views,
        seo_title: fullArticle.seo_title,
        seo_description: fullArticle.seo_description,
        keywords: fullArticle.keywords,
        tags: fullArticle.tags,
        institution: fullArticle.institution || null,
        source_url: fullArticle.source_url || null,
        published_at: fullArticle.published_at,
        created_at: fullArticle.created_at,
        updated_at: fullArticle.updated_at,
      };

      // Only include author_id if it's a valid UUID
      if (
        fullArticle.author_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fullArticle.author_id)
      ) {
        dbPayload.author_id = fullArticle.author_id;
      }

      // 3. Resilient upsert with automatic schema cache self-healing
      let payloadToSave = { ...dbPayload };
      let savedToSupabase = false;

      for (let attempt = 0; attempt < 5; attempt++) {
        const { error } = await supabase.from('articles').upsert(payloadToSave);
        if (!error) {
          savedToSupabase = true;
          console.log('Article saved to Supabase backend successfully:', fullArticle.id);

          // 4. Sync many-to-many junction table in Supabase
          try {
            await supabase.from('article_categories').delete().eq('article_id', fullArticle.id);
            if (selectedCategoryIds.length > 0) {
              const junctionRows = selectedCategoryIds.map((cId) => ({
                article_id: fullArticle.id,
                category_id: cId,
              }));
              await supabase.from('article_categories').upsert(junctionRows);
            }
          } catch (juncErr) {
            console.warn('Junction table article_categories sync notice:', juncErr);
          }

          break;
        }

        console.warn(`Supabase upsert attempt ${attempt + 1} issue:`, error);

        // Self-heal PGRST204: column missing in Supabase schema cache
        if (error.code === 'PGRST204' && error.message) {
          const colMatch = error.message.match(/Could not find the '([^']+)' column/i);
          if (colMatch && colMatch[1]) {
            console.warn(`Omitting column '${colMatch[1]}' not in Supabase schema cache and retrying...`);
            delete payloadToSave[colMatch[1]];
            continue;
          }
        }

        // Self-heal 23503: foreign key constraint on category_id
        if (error.code === '23503' || error.message?.includes('category_id')) {
          try {
            await supabase.from('categories').insert({
              id: fullArticle.category_id,
              name: resolvedCategoryName,
              slug: fullArticle.category_id.replace(/^cat-/, '') || 'news',
            });
            continue;
          } catch {}
        }

        // Self-heal 23505: duplicate slug on another article
        if (error.code === '23505' && error.message?.includes('slug')) {
          payloadToSave.slug = `${fullArticle.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
          fullArticle.slug = payloadToSave.slug;
          continue;
        }

        // Row Level Security (RLS) policy rejection (42501)
        if (error.code === '42501') {
          console.warn('Supabase RLS policy restricted insert. Ensure anon RLS policy is active in Supabase SQL editor.');
          (fullArticle as any).rlsWarning = true;
        }

        break;
      }

      if (!savedToSupabase) {
        console.warn('Supabase backend save encountered errors; continuing with local persistent storage.');
      }
    } catch (err) {
      console.error('Supabase save failed with exception:', err);
    }
  }

  // Always update local persistent cache so the article is immediately live across all pages
  const localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, []);
  const index = localArticles.findIndex((a) => a.id === fullArticle.id);
  if (index >= 0) {
    localArticles[index] = fullArticle;
  } else {
    localArticles.unshift(fullArticle);
  }
  setLocalItem(STORAGE_KEY_ARTICLES, localArticles);

  return fullArticle;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('articles').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  const localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, []);
  const updated = localArticles.filter((a) => a.id !== id);
  setLocalItem(STORAGE_KEY_ARTICLES, updated);
  return true;
}

export async function incrementArticleViews(id: string): Promise<void> {
  const localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, []);
  const article = localArticles.find((a) => a.id === id);
  if (article) {
    article.views = (article.views || 0) + 1;
    setLocalItem(STORAGE_KEY_ARTICLES, localArticles);
  }

  const supabase = getSupabase();
  if (supabase && article) {
    try {
      await supabase.from('articles').update({ views: article.views }).eq('id', id);
    } catch {}
  }
}

// ----------------- CATEGORIES SERVICE -----------------

const STORAGE_KEY_DELETED_CATEGORIES = 'lsg_deleted_category_ids';

export async function fetchCategories(): Promise<Category[]> {
  const deletedIds = getLocalItem<string[]>(STORAGE_KEY_DELETED_CATEGORIES, []);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) {
        const filtered = (data as Category[]).filter((c) => !deletedIds.includes(c.id));
        return filtered;
      }
    } catch {}
  }

  const local = getLocalItem<Category[]>(STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
  return local.filter((c) => !deletedIds.includes(c.id));
}

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<Category> {
  const id = category.id || `cat-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fullCat: Category = {
    id,
    name: category.name,
    slug,
    description: category.description || '',
    article_count: category.article_count || 0,
  };

  // If this ID was previously marked deleted, unmark it
  const deletedIds = getLocalItem<string[]>(STORAGE_KEY_DELETED_CATEGORIES, []);
  if (deletedIds.includes(id)) {
    setLocalItem(
      STORAGE_KEY_DELETED_CATEGORIES,
      deletedIds.filter((d) => d !== id)
    );
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { article_count, ...dbCat } = fullCat;
      await supabase.from('categories').upsert(dbCat);
    } catch {}
  }

  const local = getLocalItem<Category[]>(STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
  const index = local.findIndex((c) => c.id === id);
  if (index >= 0) {
    local[index] = fullCat;
  } else {
    local.push(fullCat);
  }
  setLocalItem(STORAGE_KEY_CATEGORIES, local);

  return fullCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  // 1. Mark in permanent deleted registry so it is never re-seeded or resurrected
  const deletedIds = getLocalItem<string[]>(STORAGE_KEY_DELETED_CATEGORIES, []);
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    setLocalItem(STORAGE_KEY_DELETED_CATEGORIES, deletedIds);
  }

  // 2. Remove from local categories list
  const local = getLocalItem<Category[]>(STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
  const updatedCats = local.filter((c) => c.id !== id);
  setLocalItem(STORAGE_KEY_CATEGORIES, updatedCats);

  // 3. Fallback category for any articles attached to the deleted category
  const fallbackCat = updatedCats[0]?.id || 'cat-education-news';
  const fallbackName = updatedCats[0]?.name || 'Education News';

  // Reassign local articles
  const localArticles = getLocalItem<Article[]>(STORAGE_KEY_ARTICLES, []);
  let articlesModified = false;
  for (const art of localArticles) {
    if (art.category_id === id) {
      art.category_id = fallbackCat;
      art.category_name = fallbackName;
      articlesModified = true;
    }
  }
  if (articlesModified) {
    setLocalItem(STORAGE_KEY_ARTICLES, localArticles);
  }

  // 4. Update Supabase backend: safely reassign any foreign key dependencies first
  const supabase = getSupabase();
  if (supabase) {
    try {
      try {
        await supabase.from('articles').update({ category_id: fallbackCat }).eq('category_id', id);
      } catch (fkeyErr) {
        console.warn('Reassigning Supabase articles before category delete notice:', fkeyErr);
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.warn('Supabase category delete notice:', error);
      } else {
        console.log('Category deleted from Supabase:', id);
      }
    } catch (err) {
      console.warn('Supabase category delete exception:', err);
    }
  }

  return true;
}

// ----------------- INSTITUTIONS SERVICE -----------------

export async function fetchInstitutions(): Promise<Institution[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('institutions').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as Institution[];
      }
    } catch {}
  }
  return getLocalItem<Institution[]>(STORAGE_KEY_INSTITUTIONS, INITIAL_INSTITUTIONS);
}

export async function saveInstitution(inst: Institution): Promise<Institution> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('institutions').upsert(inst);
    } catch {}
  }
  const local = getLocalItem<Institution[]>(STORAGE_KEY_INSTITUTIONS, INITIAL_INSTITUTIONS);
  const index = local.findIndex((i) => i.id === inst.id);
  if (index >= 0) local[index] = inst;
  else local.push(inst);
  setLocalItem(STORAGE_KEY_INSTITUTIONS, local);
  return inst;
}

export async function deleteInstitution(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('institutions').delete().eq('id', id);
    } catch {}
  }
  const local = getLocalItem<Institution[]>(STORAGE_KEY_INSTITUTIONS, INITIAL_INSTITUTIONS);
  setLocalItem(STORAGE_KEY_INSTITUTIONS, local.filter((i) => i.id !== id));
  return true;
}

// ----------------- TAGS SERVICE -----------------

export async function fetchTags(): Promise<Tag[]> {
  return getLocalItem<Tag[]>(STORAGE_KEY_TAGS, INITIAL_TAGS);
}

export async function saveTag(name: string): Promise<Tag> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newTag: Tag = { id: `tag-${Date.now()}`, name, slug };
  const local = getLocalItem<Tag[]>(STORAGE_KEY_TAGS, INITIAL_TAGS);
  if (!local.some((t) => t.slug === slug)) {
    local.push(newTag);
    setLocalItem(STORAGE_KEY_TAGS, local);
  }
  return newTag;
}

// ----------------- SITE SETTINGS SERVICE -----------------

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'primary_settings').single();
      if (!error && data) {
        return data as SiteSettings;
      }
    } catch {}
  }
  return getLocalItem<SiteSettings>(STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const updated: SiteSettings = { ...settings, updated_at: new Date().toISOString() };
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({ ...updated, id: 'primary_settings' });
    } catch {}
  }
  setLocalItem(STORAGE_KEY_SETTINGS, updated);
  return updated;
}

// ----------------- MEDIA ITEMS SERVICE -----------------

export async function fetchMediaItems(): Promise<MediaItem[]> {
  const defaultMedia: MediaItem[] = [
    {
      id: 'med-1',
      file_name: 'jamb-caps-official-badge.jpg',
      file_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      storage_path: 'articles/jamb-caps.jpg',
      created_at: new Date().toISOString(),
      size_bytes: 384000,
    },
    {
      id: 'med-2',
      file_name: 'federal-scholarship-board.jpg',
      file_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      storage_path: 'articles/scholarship-board.jpg',
      created_at: new Date().toISOString(),
      size_bytes: 492000,
    },
    {
      id: 'med-3',
      file_name: 'unilag-senate-building.jpg',
      file_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      storage_path: 'articles/unilag-senate.jpg',
      created_at: new Date().toISOString(),
      size_bytes: 512000,
    },
  ];

  return getLocalItem<MediaItem[]>(STORAGE_KEY_MEDIA, defaultMedia);
}

export async function addMediaItem(item: Omit<MediaItem, 'id' | 'created_at'>): Promise<MediaItem> {
  const newItem: MediaItem = {
    ...item,
    id: `med-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const local = await fetchMediaItems();
  local.unshift(newItem);
  setLocalItem(STORAGE_KEY_MEDIA, local);
  return newItem;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  const local = await fetchMediaItems();
  setLocalItem(STORAGE_KEY_MEDIA, local.filter((m) => m.id !== id));
  return true;
}

// Helper to compress high-resolution images client-side before upload to save bandwidth & storage
async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    // If SVG or animated GIF, keep original file
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
        reader.onerror = () => resolve({ blob: file, dataUrl: '' });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          const finalBlob = blob || file;
          const dataUrl = canvas.toDataURL(outType, quality);
          resolve({ blob: finalBlob, dataUrl });
        },
        outType,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

export async function uploadImageFile(file: File): Promise<{ success: boolean; url: string; fileName: string; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { success: false, url: '', fileName: file.name, error: 'Selected file is not an image.' };
  }

  // Compress image client-side for rapid upload
  const { blob, dataUrl } = await compressImage(file);
  const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `articles/${cleanName}`;
  const supabase = getSupabase();

  if (supabase) {
    try {
      const uploadFile = new File([blob], file.name, { type: blob.type || file.type });
      const { data, error } = await supabase.storage
        .from('legitschoolgists-media')
        .upload(storagePath, uploadFile, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('legitschoolgists-media')
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;

        // Register in media table
        try {
          await supabase.from('media').insert({
            id: `med-${Date.now()}`,
            file_name: file.name,
            file_url: publicUrl,
            storage_path: storagePath,
            size_bytes: blob.size,
          });
        } catch {}

        await addMediaItem({
          file_name: file.name,
          file_url: publicUrl,
          storage_path: storagePath,
          size_bytes: blob.size,
        });

        return { success: true, url: publicUrl, fileName: file.name };
      } else if (error) {
        console.warn('Supabase storage upload error details:', error.message || error);
      }
    } catch (err: any) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Fallback to local storage using optimized dataUrl
  const finalUrl = dataUrl || URL.createObjectURL(blob);
  await addMediaItem({
    file_name: file.name,
    file_url: finalUrl,
    storage_path: `local/${cleanName}`,
    size_bytes: blob.size,
  });

  return { success: true, url: finalUrl, fileName: file.name };
}

// ----------------- CONTACT & SUBSCRIBERS -----------------

export async function submitContactMessage(msg: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    ...msg,
    created_at: new Date().toISOString(),
    read: false,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('contact_messages').insert(newMsg);
    } catch {}
  }

  const local = getLocalItem<ContactMessage[]>(STORAGE_KEY_MESSAGES, []);
  local.unshift(newMsg);
  setLocalItem(STORAGE_KEY_MESSAGES, local);
  return true;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  return getLocalItem<ContactMessage[]>(STORAGE_KEY_MESSAGES, []);
}

export async function markContactMessageRead(id: string): Promise<void> {
  const local = getLocalItem<ContactMessage[]>(STORAGE_KEY_MESSAGES, []);
  const msg = local.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    setLocalItem(STORAGE_KEY_MESSAGES, local);
  }
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const sub: Subscriber = {
    id: `sub-${Date.now()}`,
    email: email.trim().toLowerCase(),
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('subscribers').insert(sub);
    } catch {}
  }

  const local = getLocalItem<Subscriber[]>(STORAGE_KEY_SUBSCRIBERS, []);
  if (local.some((s) => s.email === sub.email)) {
    return { success: true, message: 'You are already subscribed to LegitSchoolGists alerts!' };
  }

  local.unshift(sub);
  setLocalItem(STORAGE_KEY_SUBSCRIBERS, local);
  return { success: true, message: 'Thank you for subscribing to LegitSchoolGists breaking campus updates!' };
}

// ----------------- COMMENTS SERVICE -----------------

const INITIAL_COMMENTS: ArticleComment[] = [
  {
    id: 'comm-1',
    article_id: 'art-unilag-merit-cutoff-2026',
    author_name: 'Adebayo Oluwaseun',
    author_email: 'adebayo.o@gmail.com',
    content: 'Thank you LegitSchoolGists for the clear breakdown of UNILAG faculty cut-offs. Please when is the online verification portal opening for first choice candidates?',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'published',
    likes: 12,
  },
  {
    id: 'comm-2',
    article_id: 'art-unilag-merit-cutoff-2026',
    author_name: 'Chidimma Eze',
    author_email: 'eze.chidi@yahoo.com',
    content: 'Very helpful article! Scored 285 in UTME with 5 distinctions in WAEC. Hopeful for Medicine & Surgery on the merit list.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'published',
    likes: 8,
  },
  {
    id: 'comm-3',
    article_id: 'art-jamb-caps-2026-admission-portal',
    author_name: 'Ibrahim Farouq',
    author_email: 'farouq.ib@gmail.com',
    content: 'Great guide on JAMB CAPS. Remember to always use desktop mode on mobile browser to access the "Check Admission Status" tab smoothly.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'published',
    likes: 19,
  },
  {
    id: 'comm-4',
    article_id: 'art-nnpc-totalenergies-scholarship-2026',
    author_name: 'Blessing Okon',
    author_email: 'blessing.okon@gmail.com',
    content: 'Is this scholarship open to second-year 200L engineering students or strictly 100L freshers? Thank you for clarifying.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'published',
    likes: 5,
  }
];

export async function fetchArticleComments(articleId: string): Promise<ArticleComment[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ArticleComment[];
      }
    } catch (err) {
      console.warn('Supabase comments fetch fallback to local storage:', err);
    }
  }

  const allComments = getLocalItem<ArticleComment[]>(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);
  return allComments.filter((c) => c.article_id === articleId);
}

export async function submitArticleComment(commentData: {
  article_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: string | null;
}): Promise<ArticleComment> {
  const newComment: ArticleComment = {
    id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    article_id: commentData.article_id,
    author_name: commentData.author_name.trim() || 'Reader',
    author_email: commentData.author_email?.trim() || undefined,
    content: commentData.content.trim(),
    parent_id: commentData.parent_id || null,
    created_at: new Date().toISOString(),
    status: 'published',
    likes: 0,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('comments').insert({
        id: newComment.id,
        article_id: newComment.article_id,
        author_name: newComment.author_name,
        author_email: newComment.author_email || null,
        content: newComment.content,
        created_at: newComment.created_at,
        status: newComment.status,
        likes: newComment.likes,
      });
    } catch (err) {
      console.warn('Supabase comment insert issue:', err);
    }
  }

  // Update local storage
  const allComments = getLocalItem<ArticleComment[]>(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);
  allComments.unshift(newComment);
  setLocalItem(STORAGE_KEY_COMMENTS, allComments);

  return newComment;
}

export async function likeArticleComment(commentId: string, _articleId?: string): Promise<number> {
  const allComments = getLocalItem<ArticleComment[]>(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);
  const target = allComments.find((c) => c.id === commentId);
  let newLikes = 1;
  if (target) {
    target.likes = (target.likes || 0) + 1;
    newLikes = target.likes;
    setLocalItem(STORAGE_KEY_COMMENTS, allComments);
  }

  const supabase = getSupabase();
  if (supabase && target) {
    try {
      await supabase.from('comments').update({ likes: target.likes }).eq('id', commentId);
    } catch {}
  }

  return newLikes;
}

export const toggleLikeComment = likeArticleComment;

