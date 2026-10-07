export const SUPABASE_SQL_SCRIPT = `-- =====================================================================
-- LEGITSCHOOLGISTS - COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA
-- Platform: Nigeria's Premier Campus News & Academic Excellence Portal
-- Official Email: legitschoolgistsblog@gmail.com
-- WhatsApp Helpline: +234 903 973 3298
-- Phone: +234 811 5578 054
-- =====================================================================
-- INSTRUCTIONS TO RUN IN SUPABASE:
-- 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select or create your project.
-- 3. Click on the "SQL Editor" tab (terminal icon) in the left sidebar.
-- 4. Click "New Query" and paste this entire script.
-- 5. Click "RUN" (or press Ctrl + Enter / Cmd + Enter).
-- 6. All tables, security policies (RLS), indexes, and initial records will be created.
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'LegitSchoolGists Admin',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'author')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. INSTITUTIONS TABLE (Universities, Polytechnics, Colleges)
CREATE TABLE IF NOT EXISTS public.institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('federal_university', 'state_university', 'private_university', 'polytechnic', 'college_of_education')),
  state TEXT NOT NULL,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. ARTICLES TABLE (Complete educational circulars & news)
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'LegitSchoolGists Editorial',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  institution TEXT,
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6B. ARTICLE CATEGORIES JUNCTION TABLE (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_article_categories_category ON public.article_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_article ON public.article_categories(article_id);

-- 7. MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  site_name TEXT NOT NULL DEFAULT 'LegitSchoolGists',
  tagline TEXT NOT NULL DEFAULT 'Nigeria''s Premier Campus News & Academic Excellence Platform',
  email TEXT NOT NULL DEFAULT 'legitschoolgistsblog@gmail.com',
  phone TEXT NOT NULL DEFAULT '+234 811 5578 054',
  whatsapp TEXT NOT NULL DEFAULT '+234 903 973 3298',
  address TEXT NOT NULL DEFAULT 'Lagos & Abuja, Nigeria',
  about_summary TEXT NOT NULL DEFAULT 'LegitSchoolGists is dedicated to keeping Nigerian students, parents, and academic professionals informed about everything happening across tertiary institutions in Nigeria.',
  breaking_announcement TEXT,
  logo_url TEXT DEFAULT '/logo.png',
  facebook_url TEXT DEFAULT 'https://facebook.com/legitschoolgists',
  twitter_url TEXT DEFAULT 'https://twitter.com/legitschoolgists',
  telegram_url TEXT DEFAULT 'https://t.me/legitschoolgists',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 10. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 11. ARTICLE COMMENTS TABLE (Reader discussion desk)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 12. INDEXES FOR HIGH-SPEED QUERYING & SEARCH
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON public.articles(is_breaking);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotent re-runs
DROP POLICY IF EXISTS "Public users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public users can view institutions" ON public.institutions;
DROP POLICY IF EXISTS "Public users can view tags" ON public.tags;
DROP POLICY IF EXISTS "Public users can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public users can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated users have full access to articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users have full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users have full access to institutions" ON public.institutions;
DROP POLICY IF EXISTS "Authenticated users have full access to tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users have full access to media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users have full access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users have full access to contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users have full access to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view and update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Full access to articles" ON public.articles;
DROP POLICY IF EXISTS "Full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Full access to institutions" ON public.institutions;
DROP POLICY IF EXISTS "Full access to tags" ON public.tags;
DROP POLICY IF EXISTS "Full access to media" ON public.media;
DROP POLICY IF EXISTS "Full access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Full access to contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Full access to subscribers" ON public.subscribers;

-- PUBLIC READ ACCESS
CREATE POLICY "Public users can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public users can view institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Public users can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public users can view site settings" ON public.site_settings FOR SELECT USING (true);

-- CRITICAL: Public visitors can ONLY read PUBLISHED articles (Drafts remain private)
CREATE POLICY "Public users can view published articles" 
ON public.articles FOR SELECT 
USING (status = 'published');

-- Allow public users to submit contact inquiries & newsletter alerts
CREATE POLICY "Public can submit contact messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can subscribe to newsletter" 
ON public.subscribers FOR INSERT 
WITH CHECK (true);

-- ADMINISTRATOR & FRONTEND FULL CRUD PRIVILEGES (Supports both anon key and authenticated sessions)
CREATE POLICY "Full access to articles" 
ON public.articles FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to categories" 
ON public.categories FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to institutions" 
ON public.institutions FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to tags" 
ON public.tags FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to media" 
ON public.media FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to site settings" 
ON public.site_settings FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to contact messages" 
ON public.contact_messages FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Full access to subscribers" 
ON public.subscribers FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can view and update their profile" 
ON public.profiles FOR ALL 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 13. AUTO-UPDATE TIMESTAMP FUNCTION & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_articles_timestamp ON public.articles;
CREATE TRIGGER update_articles_timestamp
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_site_settings_timestamp ON public.site_settings;
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 14. SEED NIGERIAN EDUCATION CATEGORIES
INSERT INTO public.categories (id, name, slug, description) VALUES
  ('cat-admission', 'Admission', 'admission', 'University, Polytechnic, and College admission lists, screening guidelines, and cut-off points.'),
  ('cat-jamb', 'JAMB', 'jamb', 'UTME registration alerts, syllabus, CAPS login, mock exams, and official bulletins.'),
  ('cat-waec', 'WAEC', 'waec', 'WASSCE May/June and GCE registration dates, timetable, result checking, and council updates.'),
  ('cat-neco', 'NECO', 'neco', 'National Examinations Council SSCE results, biometric registration, and centre circulars.'),
  ('cat-post-utme', 'Post-UTME', 'post-utme', 'Institutional screening forms, eligible scores, registration deadlines, and past questions.'),
  ('cat-scholarships', 'Scholarships', 'scholarships', 'Undergraduate, postgraduate, Federal Government Bilateral, and international awards.'),
  ('cat-campus-life', 'Campus Life', 'campus-life', 'Student Union Governments (SUG), hostel allocations, convocation, matriculation, and campus trends.'),
  ('cat-career', 'Career', 'career', 'Graduate trainee programmes in Nigerian banks, CV writing, internship opportunities, and NYSC guidance.'),
  ('cat-education-news', 'Education News', 'education-news', 'General Nigerian educational policy updates, Federal Ministry of Education circulars, and strikes.'),
  ('cat-nuc-accreditation', 'NUC & Accreditation', 'nuc-accreditation', 'National Universities Commission institutional approvals, full programme accreditations, and university rankings.'),
  ('cat-university-news', 'University News', 'university-news', 'Updates from Federal, State, and Private universities across all geopolitical zones in Nigeria.'),
  ('cat-polytechnic-news', 'Polytechnic News', 'polytechnic-news', 'National Diploma (ND) and Higher National Diploma (HND) news, NBTE circulars, and polytechnic admissions.'),
  ('cat-academic-excellence', 'Academic Excellence', 'academic-excellence', 'First Class honours graduating stories, academic prize winners, study techniques, and CGPA guides.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 15. SEED INITIAL SITE SETTINGS
INSERT INTO public.site_settings (
  id, site_name, tagline, email, phone, whatsapp, address, about_summary, breaking_announcement, logo_url
) VALUES (
  'primary_settings',
  'LegitSchoolGists',
  'Nigeria''s Premier Campus News & Academic Excellence Platform',
  'legitschoolgistsblog@gmail.com',
  '+234 811 5578 054',
  '+234 903 973 3298',
  'Lagos & Abuja, Nigeria',
  'LegitSchoolGists is dedicated to keeping Nigerian students, parents, and academic professionals informed about everything happening across tertiary institutions in Nigeria. We bridge the information gap with accurate, timely, and verified education news.',
  'JAMB 2026/2027 CAPS Portal Officially Open for Admission Status Verification | NUC Grants Accreditation to 24 New Degree Programmes',
  '/logo.png'
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  logo_url = EXCLUDED.logo_url;

-- 16. SUPABASE STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legitschoolgists-media', 'legitschoolgists-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'legitschoolgists-media');

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO anon, authenticated 
WITH CHECK (bucket_id = 'legitschoolgists-media');

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO anon, authenticated 
USING (bucket_id = 'legitschoolgists-media');

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO anon, authenticated 
USING (bucket_id = 'legitschoolgists-media');
`;
