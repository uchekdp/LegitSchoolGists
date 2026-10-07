export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id: string;
  category_name?: string;
  category_ids?: string[];
  category_names?: string[];
  categories?: { id: string; name: string; slug: string }[];
  author_id?: string;
  author_name: string;
  status: 'published' | 'draft';
  is_featured: boolean;
  is_breaking: boolean;
  views: number;
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
  tags: string[];
  institution?: string;
  source_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  article_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  type: 'federal_university' | 'state_university' | 'private_university' | 'polytechnic' | 'college_of_education';
  state: string;
  website?: string;
  description?: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  uploaded_by?: string;
  created_at: string;
  size_bytes?: number;
}

export interface SiteSettings {
  id?: string;
  site_name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  about_summary: string;
  logo_url?: string;
  breaking_announcement: string;
  facebook_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
  status?: 'published' | 'approved' | 'pending';
  likes?: number;
  parent_id?: string | null;
}

export interface ScholarshipFilter {
  study_level?: 'all' | 'undergraduate' | 'postgraduate';
  funding_type?: 'all' | 'fully_funded' | 'partial';
  region?: 'all' | 'nigeria' | 'international';
}
