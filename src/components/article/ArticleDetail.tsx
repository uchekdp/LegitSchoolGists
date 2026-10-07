import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  Eye,
  School,
  Sparkles
} from 'lucide-react';
import { Article } from '../../types';
import { ArticleCard } from './ArticleCard';
import { SocialShareBar } from './SocialShareBar';
import { ArticleComments } from './ArticleComments';
import { incrementArticleViews } from '../../services/dataService';
import { processArticleEquations } from '../../utils/latexHelper';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onReadArticle: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  onBack,
  onReadArticle,
  onNavigateCategory,
}) => {
  useEffect(() => {
    // Increment view count
    incrementArticleViews(article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const updatedDate = new Date(article.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Gather all assigned categories for this article
  const articleCategories: { name: string; slug: string }[] = [];
  if (Array.isArray(article.categories) && article.categories.length > 0) {
    article.categories.forEach((c) => {
      articleCategories.push({
        name: c.name,
        slug: (c.slug || c.id || '').replace(/^cat-/, '').toLowerCase(),
      });
    });
  } else if (Array.isArray(article.category_names) && article.category_names.length > 0) {
    article.category_names.forEach((name, i) => {
      const id = (article.category_ids && article.category_ids[i]) || name;
      articleCategories.push({
        name,
        slug: id.replace(/^cat-/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
    });
  } else if (Array.isArray(article.category_ids) && article.category_ids.length > 0) {
    article.category_ids.forEach((id) => {
      articleCategories.push({
        name: id.replace(/^cat-/, '').replace(/-/g, ' ').toUpperCase(),
        slug: id.replace(/^cat-/, '').toLowerCase(),
      });
    });
  } else if (article.category_name) {
    articleCategories.push({
      name: article.category_name,
      slug: (article.category_id || article.category_name).replace(/^cat-/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  }

  // De-duplicate by slug
  const uniqueCategories = articleCategories.filter(
    (item, index, self) => index === self.findIndex((t) => t.slug === item.slug)
  );

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-700 hover:text-sky-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News Feed</span>
          </button>

          <nav className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span>Home</span>
            <span>/</span>
            {uniqueCategories.length > 0 ? (
              uniqueCategories.map((c, i) => (
                <React.Fragment key={c.slug}>
                  <button
                    onClick={() => onNavigateCategory(c.slug)}
                    className="hover:underline text-sky-600 font-medium cursor-pointer"
                  >
                    {c.name}
                  </button>
                  {i < uniqueCategories.length - 1 && <span>,</span>}
                </React.Fragment>
              ))
            ) : (
              <button
                onClick={() => onNavigateCategory(article.category_name?.toLowerCase() || 'education')}
                className="hover:underline text-sky-600 font-medium cursor-pointer"
              >
                {article.category_name || 'Category'}
              </button>
            )}
            <span>/</span>
            <span className="truncate max-w-[200px] text-slate-700 font-semibold">{article.title}</span>
          </nav>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
          {/* Header Metadata */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              {uniqueCategories.length > 0 ? (
                uniqueCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => onNavigateCategory(cat.slug)}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => onNavigateCategory(article.category_name?.toLowerCase() || 'education')}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                >
                  {article.category_name || 'Education News'}
                </button>
              )}

              {article.institution && (
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-sky-600" />
                  {article.institution}
                </span>
              )}

              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Circular
              </span>
            </div>

            {/* Categories Listing Row */}
            {uniqueCategories.length > 1 && (
              <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-700">Categories:</span>
                {uniqueCategories.map((c, i) => (
                  <React.Fragment key={c.slug}>
                    <button
                      onClick={() => onNavigateCategory(c.slug)}
                      className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
                    >
                      {c.name}
                    </button>
                    {i < uniqueCategories.length - 1 && <span className="text-slate-300">|</span>}
                  </React.Fragment>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Author, Date & View Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>By {article.author_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Published: {formattedDate}</span>
                </div>
                {article.updated_at && article.updated_at !== article.published_at && (
                  <div className="text-slate-400 text-xs">
                    (Updated: {updatedDate})
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views + 1} views</span>
              </div>
            </div>
          </div>

          {/* Social Sharing Component (Top) */}
          <SocialShareBar article={article} variant="top" />

          {/* Featured Article Image */}
          <div className="my-6 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto max-h-[460px] object-cover"
            />
          </div>

          {/* Excerpt Lead */}
          <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-lg mb-6">
            <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Article Body Content */}
          {/<[a-z][\s\S]*>/i.test(article.content) ? (
            <div
              className="prose-editorial text-slate-800 max-w-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processArticleEquations(article.content) }}
            />
          ) : (
            <div className="prose-editorial text-slate-800 max-w-none space-y-4 text-base leading-relaxed font-sans">
              {article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {line}
                      {lIdx < paragraph.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          )}

          {/* Official Source link if provided */}
          {article.source_url && (
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Official Reference / Application Portal</div>
                  <div className="text-xs text-slate-500 truncate max-w-md">{article.source_url}</div>
                </div>
              </div>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags:</span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Social Share Component (with WhatsApp, Twitter, Facebook, Telegram, Link & WhatsApp Desk Logic) */}
          <SocialShareBar article={article} variant="bottom" />

          {/* Reader Comments Section */}
          <ArticleComments articleId={article.id} articleTitle={article.title} />
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
              <h3 className="text-xl font-extrabold text-slate-900">
                Related Education Circulars
              </h3>
              <span className="text-xs text-slate-500">More in {article.category_name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <ArticleCard key={rel.id} article={rel} onReadArticle={onReadArticle} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

