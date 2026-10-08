import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_INSTITUTIONS, INITIAL_SETTINGS, INITIAL_TAGS } from './src/data/initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing JSON with generous limit for media uploads/rich content
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent Database File Path
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

interface DatabaseSchema {
  articles: any[];
  categories: any[];
  institutions: any[];
  tags: any[];
  settings: any;
  media: any[];
  messages: any[];
  subscribers: any[];
  comments: any[];
  lastUpdated: string;
}

// Initialize database file if it does not exist
function initDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      articles: INITIAL_ARTICLES,
      categories: INITIAL_CATEGORIES,
      institutions: INITIAL_INSTITUTIONS,
      tags: INITIAL_TAGS,
      settings: INITIAL_SETTINGS,
      media: [],
      messages: [],
      subscribers: [
        { id: 'sub-1', email: 'admissionseeker2026@gmail.com', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'sub-2', email: 'scholarshipdeskng@yahoo.com', created_at: new Date(Date.now() - 86400000).toISOString() },
      ],
      comments: [
        {
          id: 'cmt-1',
          article_id: 'art-unilag-merit-cut-off-marks-2026',
          author_name: 'Chinedu Okafor',
          content: 'Thank you LegitSchoolGists for the clear breakdown of UNILAG faculty cut-offs. Please when is the online verification portal opening for first choice candidates?',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          status: 'approved',
          likes: 4,
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse database.json, resetting to default:', err);
    const initialData: DatabaseSchema = {
      articles: INITIAL_ARTICLES,
      categories: INITIAL_CATEGORIES,
      institutions: INITIAL_INSTITUTIONS,
      tags: INITIAL_TAGS,
      settings: INITIAL_SETTINGS,
      media: [],
      messages: [],
      subscribers: [],
      comments: [],
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

// Read database
function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDb();
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return initDb();
  }
}

// Save database
function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database.json:', err);
  }
}

// Initialize on startup
initDb();

// ----------------- API ENDPOINTS -----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    status: 'ok',
    site: 'LegitSchoolGists',
    admin_url: 'https://legitschoolgists.com.ng/admin',
    articlesCount: db.articles.length,
    categoriesCount: db.categories.length,
    lastUpdated: db.lastUpdated,
    time: new Date().toISOString(),
  });
});

// Full database backup / export
app.get('/api/database', (req: Request, res: Response) => {
  res.json(getDb());
});

// Full database sync / restore
app.post('/api/database/sync', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const db = getDb();

    if (Array.isArray(payload.articles) && payload.articles.length > 0) {
      // Merge articles preserving newer modifications
      const articleMap = new Map(db.articles.map((a: any) => [a.id, a]));
      for (const item of payload.articles) {
        articleMap.set(item.id, item);
      }
      db.articles = Array.from(articleMap.values());
    }

    if (Array.isArray(payload.categories) && payload.categories.length > 0) {
      const catMap = new Map(db.categories.map((c: any) => [c.id, c]));
      for (const item of payload.categories) {
        catMap.set(item.id, item);
      }
      db.categories = Array.from(catMap.values());
    }

    if (payload.settings && typeof payload.settings === 'object') {
      db.settings = { ...db.settings, ...payload.settings };
    }

    if (Array.isArray(payload.institutions)) {
      db.institutions = payload.institutions;
    }

    if (Array.isArray(payload.media)) {
      db.media = payload.media;
    }

    saveDb(db);
    res.json({ success: true, message: 'Database synced successfully with backend storage', db });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

// --- ARTICLES ---

app.get('/api/articles', (req: Request, res: Response) => {
  try {
    const db = getDb();
    let results = [...db.articles];

    const { status, categoryId, categorySlug, searchQuery, limit } = req.query;

    if (status && status !== 'all') {
      results = results.filter((a) => a.status === status);
    }

    if (categoryId) {
      const cId = String(categoryId);
      results = results.filter(
        (a) => a.category_id === cId || (Array.isArray(a.category_ids) && a.category_ids.includes(cId))
      );
    } else if (categorySlug) {
      const slug = String(categorySlug).toLowerCase();
      const matchedCat = db.categories.find((c: any) => c.slug === slug || c.id === slug || c.id === `cat-${slug}`);
      if (matchedCat) {
        results = results.filter(
          (a) =>
            a.category_id === matchedCat.id ||
            (Array.isArray(a.category_ids) && a.category_ids.includes(matchedCat.id)) ||
            a.category_name?.toLowerCase() === matchedCat.name.toLowerCase()
        );
      }
    }

    if (searchQuery) {
      const q = String(searchQuery).toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

    if (limit) {
      const l = parseInt(String(limit), 10);
      if (!isNaN(l) && l > 0) {
        results = results.slice(0, l);
      }
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch articles' });
  }
});

app.get('/api/articles/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const db = getDb();
  const article = db.articles.find((a) => a.slug === slugOrId || a.id === slugOrId);
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

app.post('/api/articles', (req: Request, res: Response) => {
  try {
    const art = req.body;
    if (!art.title || !art.title.trim()) {
      res.status(400).json({ error: 'Article title is required' });
      return;
    }

    const db = getDb();
    const now = new Date().toISOString();

    const id = art.id || `art-${Date.now()}`;
    const slug =
      art.slug?.trim() ||
      art.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `post-${Date.now()}`;

    const catMap = new Map(db.categories.map((c: any) => [c.id, c.name]));
    const catSlugMap = new Map(db.categories.map((c: any) => [c.id, c.slug]));

    const categoryIds = Array.isArray(art.category_ids) && art.category_ids.length > 0
      ? art.category_ids
      : art.category_id
      ? [art.category_id]
      : ['cat-education-news'];

    const primaryCategoryId = categoryIds[0] || 'cat-education-news';
    const categoryName = art.category_name || catMap.get(primaryCategoryId) || 'Education News';
    const categoryNames = categoryIds.map((cid: string) => catMap.get(cid) || cid);
    const resolvedCategories = categoryIds.map((cid: string) => ({
      id: cid,
      name: catMap.get(cid) || 'Education News',
      slug: catSlugMap.get(cid) || cid.replace(/^cat-/, ''),
    }));

    const savedArticle = {
      ...art,
      id,
      title: art.title.trim(),
      slug,
      excerpt:
        art.excerpt?.trim() ||
        (art.content ? art.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...' : art.title),
      content: art.content || '',
      featured_image:
        art.featured_image ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      category_id: primaryCategoryId,
      category_name: categoryName,
      category_ids: categoryIds,
      category_names: categoryNames,
      categories: resolvedCategories,
      author_name: art.author_name?.trim() || 'LegitSchoolGists Editorial',
      status: art.status || 'published',
      is_featured: Boolean(art.is_featured),
      is_breaking: Boolean(art.is_breaking),
      views: Number(art.views) || 0,
      seo_title: art.seo_title?.trim() || art.title.trim(),
      seo_description: art.seo_description?.trim() || art.excerpt?.trim() || '',
      keywords: Array.isArray(art.keywords) ? art.keywords : [],
      tags: Array.isArray(art.tags) ? art.tags : [],
      institution: art.institution?.trim() || undefined,
      source_url: art.source_url?.trim() || undefined,
      published_at: art.published_at || now,
      created_at: art.created_at || now,
      updated_at: now,
    };

    const existingIndex = db.articles.findIndex((a) => a.id === id);
    if (existingIndex >= 0) {
      db.articles[existingIndex] = savedArticle;
    } else {
      db.articles.unshift(savedArticle);
    }

    saveDb(db);
    res.json(savedArticle);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save article' });
  }
});

app.put('/api/articles/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const index = db.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    const updated = {
      ...db.articles[index],
      ...req.body,
      id,
      updated_at: new Date().toISOString(),
    };
    db.articles[index] = updated;
    saveDb(db);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update article' });
  }
});

app.delete('/api/articles/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.articles = db.articles.filter((a) => a.id !== id);
    saveDb(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete article' });
  }
});

app.post('/api/articles/:id/views', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const art = db.articles.find((a) => a.id === id || a.slug === id);
    if (art) {
      art.views = (art.views || 0) + 1;
      saveDb(db);
      res.json({ views: art.views });
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update views' });
  }
});

// --- CATEGORIES ---

app.get('/api/categories', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  try {
    const cat = req.body;
    if (!cat.name || !cat.name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const db = getDb();
    const id = cat.id || `cat-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const slug =
      cat.slug?.trim() ||
      cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const savedCat = {
      ...cat,
      id,
      name: cat.name.trim(),
      slug,
      description: cat.description?.trim() || `${cat.name.trim()} updates, verified circulars & advisories`,
    };

    const existingIndex = db.categories.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      db.categories[existingIndex] = savedCat;
    } else {
      db.categories.push(savedCat);
    }

    saveDb(db);
    res.json(savedCat);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save category' });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDb(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete category' });
  }
});

// --- INSTITUTIONS ---

app.get('/api/institutions', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.institutions || []);
});

app.post('/api/institutions', (req: Request, res: Response) => {
  try {
    const inst = req.body;
    const db = getDb();
    const id = inst.id || `inst-${Date.now()}`;
    const saved = { ...inst, id };

    const idx = (db.institutions || []).findIndex((i: any) => i.id === id);
    if (idx >= 0) {
      db.institutions[idx] = saved;
    } else {
      if (!db.institutions) db.institutions = [];
      db.institutions.push(saved);
    }

    saveDb(db);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save institution' });
  }
});

app.delete('/api/institutions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.institutions = (db.institutions || []).filter((i: any) => i.id !== id);
    saveDb(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete institution' });
  }
});

// --- SITE SETTINGS ---

app.get('/api/settings', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.settings = {
      ...db.settings,
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDb(db);
    res.json(db.settings);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save settings' });
  }
});

// --- MEDIA ITEMS ---

app.get('/api/media', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.media || []);
});

app.post('/api/media', (req: Request, res: Response) => {
  try {
    const item = req.body;
    const db = getDb();
    const saved = {
      id: item.id || `med-${Date.now()}`,
      file_name: item.file_name || 'uploaded_asset.jpg',
      file_url: item.file_url,
      storage_path: item.storage_path || item.file_url,
      created_at: new Date().toISOString(),
      size_bytes: item.size_bytes || 0,
    };
    if (!db.media) db.media = [];
    db.media.unshift(saved);
    saveDb(db);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save media' });
  }
});

app.delete('/api/media/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.media = (db.media || []).filter((m: any) => m.id !== id);
    saveDb(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete media' });
  }
});

// --- MESSAGES ---

app.get('/api/messages', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.messages || []);
});

app.post('/api/messages', (req: Request, res: Response) => {
  try {
    const msg = req.body;
    const db = getDb();
    const saved = {
      ...msg,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false,
    };
    if (!db.messages) db.messages = [];
    db.messages.unshift(saved);
    saveDb(db);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to send message' });
  }
});

app.patch('/api/messages/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const msg = (db.messages || []).find((m: any) => m.id === id);
    if (msg) {
      msg.read = true;
      saveDb(db);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update message' });
  }
});

app.delete('/api/messages/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.messages = (db.messages || []).filter((m: any) => m.id !== id);
    saveDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete message' });
  }
});

// --- SUBSCRIBERS ---

app.get('/api/subscribers', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.subscribers || []);
});

app.post('/api/subscribers', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }
    const db = getDb();
    if (!db.subscribers) db.subscribers = [];
    const exists = db.subscribers.some((s: any) => s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.json({ success: true, message: 'You are already subscribed to LegitSchoolGists alerts!' });
      return;
    }
    const sub = {
      id: `sub-${Date.now()}`,
      email: email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };
    db.subscribers.unshift(sub);
    saveDb(db);
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to subscribe' });
  }
});

// --- COMMENTS ---

app.get('/api/comments', (req: Request, res: Response) => {
  const { article_id } = req.query;
  const db = getDb();
  let list = db.comments || [];
  if (article_id) {
    list = list.filter((c: any) => c.article_id === article_id);
  }
  res.json(list);
});

app.post('/api/comments', (req: Request, res: Response) => {
  try {
    const comment = req.body;
    const db = getDb();
    const saved = {
      ...comment,
      id: `cmt-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'approved',
      likes: 0,
    };
    if (!db.comments) db.comments = [];
    db.comments.unshift(saved);
    saveDb(db);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save comment' });
  }
});

// --- AUTHENTICATION ---

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanEmail === 'legitschoolgistsblog@gmail.com') {
      if ((password || '').length >= 8) {
        res.json({
          success: true,
          user: {
            email: cleanEmail,
            role: 'admin',
            name: 'Chief Editor (LegitSchoolGists)',
            portal_url: 'https://legitschoolgists.com.ng/admin',
          },
        });
        return;
      } else {
        res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
        return;
      }
    }

    res.status(403).json({
      success: false,
      error: 'Access denied: Only authorized administrator emails (legitschoolgistsblog@gmail.com) can access this portal.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Login failed' });
  }
});

// ----------------- VITE & STATIC SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(` LegitSchoolGists Full-Stack Server Running on Port ${PORT}`);
    console.log(` Admin URL: https://legitschoolgists.com.ng/admin`);
    console.log(` Backend DB: ${DB_FILE}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
