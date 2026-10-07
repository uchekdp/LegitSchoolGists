import { Article, Category } from '../types';

/**
 * Accurately matches whether an article belongs to a specific category.
 * Matches by category ID, slug, normalized name, or tag.
 */
export function isArticleInCategory(article: Article, category: Category | string): boolean {
  if (!article || !category) return false;

  const catId = typeof category === 'string' ? category.toLowerCase().trim() : category.id.toLowerCase().trim();
  const catSlug = typeof category === 'string' ? category.toLowerCase().trim().replace(/^cat-/, '') : (category.slug || category.id).toLowerCase().trim().replace(/^cat-/, '');
  const catName = typeof category === 'string' ? category.toLowerCase().trim() : (category.name || '').toLowerCase().trim();

  // 1. Gather all assigned category IDs, slugs, and names for this article
  const assignedIds = Array.isArray(article.category_ids) && article.category_ids.length > 0
    ? article.category_ids.map((id) => id.toLowerCase().trim())
    : [article.category_id?.toLowerCase().trim()].filter(Boolean) as string[];

  const assignedSlugs = assignedIds.map((id) => id.replace(/^cat-/, ''));

  const assignedNames: string[] = [];
  if (Array.isArray(article.category_names) && article.category_names.length > 0) {
    assignedNames.push(...article.category_names.map((n) => n.toLowerCase().trim()));
  }
  if (article.category_name) {
    assignedNames.push(article.category_name.toLowerCase().trim());
  }
  if (Array.isArray(article.categories)) {
    for (const c of article.categories) {
      if (c.id) assignedIds.push(c.id.toLowerCase().trim());
      if (c.slug) assignedSlugs.push(c.slug.toLowerCase().trim().replace(/^cat-/, ''));
      if (c.name) assignedNames.push(c.name.toLowerCase().trim());
    }
  }

  // 2. Direct ID equality check across all assigned categories
  if (assignedIds.includes(catId) || assignedIds.includes(`cat-${catSlug}`)) {
    return true;
  }

  // 3. Slug equality check across all assigned categories
  if (catSlug && assignedSlugs.includes(catSlug)) {
    return true;
  }

  // 4. Name equality check across all assigned categories
  if (catName && assignedNames.includes(catName)) {
    return true;
  }

  // 5. Normalized slugified name equality check
  for (const name of assignedNames) {
    const slugified = name.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (catSlug && slugified === catSlug) {
      return true;
    }
  }

  // 6. Special alias handling for News & Gist / Education News:
  // All articles should appear on the "News & Gist" page except for scholarship articles
  const isEducationCat =
    catSlug === 'education-news' ||
    catSlug === 'news-gist' ||
    catName === 'news & gist' ||
    catName === 'education news';

  if (isEducationCat) {
    const isScholarship =
      assignedSlugs.includes('scholarships') ||
      assignedSlugs.includes('scholarship') ||
      assignedNames.some((n) => n.includes('scholarship')) ||
      (Array.isArray(article.tags) && article.tags.some((t) => t.toLowerCase().includes('scholarship')));
    return !isScholarship;
  }

  // 7. Special alias handling for Admission & Post-UTME
  const isAdmissionCat = catSlug === 'admission' || catSlug === 'post-utme' || catName.includes('admission') || catName.includes('post-utme');
  const isAdmissionArt =
    assignedSlugs.some((s) => s === 'admission' || s === 'post-utme') ||
    assignedNames.some((n) => n.includes('admission') || n.includes('post-utme'));
  if (isAdmissionCat && isAdmissionArt) {
    return true;
  }

  // 8. Special alias handling for Scholarships
  const isScholarshipCat = catSlug === 'scholarships' || catSlug === 'scholarship' || catName.includes('scholarship');
  const isScholarshipArt =
    assignedSlugs.some((s) => s === 'scholarships' || s === 'scholarship') ||
    assignedNames.some((n) => n.includes('scholarship'));
  if (isScholarshipCat && isScholarshipArt) {
    return true;
  }

  // 9. Special alias handling for JAMB
  const isJambCat = catSlug === 'jamb' || catName.includes('jamb');
  const isJambArt = assignedSlugs.includes('jamb') || assignedNames.some((n) => n.includes('jamb'));
  if (isJambCat && isJambArt) {
    return true;
  }

  // 10. Special alias handling for WAEC
  const isWaecCat = catSlug === 'waec' || catName.includes('waec');
  const isWaecArt = assignedSlugs.includes('waec') || assignedNames.some((n) => n.includes('waec'));
  if (isWaecCat && isWaecArt) {
    return true;
  }

  // 11. Special alias handling for NECO
  const isNecoCat = catSlug === 'neco' || catName.includes('neco');
  const isNecoArt = assignedSlugs.includes('neco') || assignedNames.some((n) => n.includes('neco'));
  if (isNecoCat && isNecoArt) {
    return true;
  }

  // 12. Special alias handling for NUC
  const isNucCat = catSlug === 'nuc-accreditation' || catSlug === 'nuc' || catName.includes('nuc');
  const isNucArt =
    assignedSlugs.some((s) => s === 'nuc-accreditation' || s === 'nuc') ||
    assignedNames.some((n) => n.includes('nuc'));
  if (isNucCat && isNucArt) {
    return true;
  }

  // 13. Special alias handling for Breaking Updates
  const isBreakingCat =
    catSlug === 'breaking-updates' ||
    catSlug === 'breaking' ||
    catSlug === 'breaking-news' ||
    catName.includes('breaking');
  const isBreakingArt =
    Boolean(article.is_breaking) ||
    assignedSlugs.some((s) => s.includes('breaking')) ||
    assignedNames.some((n) => n.includes('breaking'));
  if (isBreakingCat && isBreakingArt) {
    return true;
  }

  return false;
}

/**
 * Filter an array of articles strictly matching a category
 */
export function filterArticlesByCategory(articles: Article[], category: Category | string): Article[] {
  return articles.filter((a) => isArticleInCategory(a, category));
}

/**
 * Groups articles by categories into a map
 */
export function groupArticlesByCategories(
  articles: Article[],
  categories: Category[]
): Map<string, { category: Category; articles: Article[] }> {
  const result = new Map<string, { category: Category; articles: Article[] }>();

  for (const cat of categories) {
    const matched = articles.filter((a) => isArticleInCategory(a, cat));
    result.set(cat.id, { category: cat, articles: matched });
  }

  return result;
}
