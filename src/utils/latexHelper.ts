import katex from 'katex';

/**
 * Safely renders LaTeX string into HTML with KaTeX.
 * Handles both display mode ($$...$$ or \\(...\\)) and inline mode ($...$).
 */
export function renderLatexToHtml(latex: string, displayMode = false): string {
  if (!latex) return '';
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
  } catch (err) {
    console.warn('KaTeX rendering error:', err);
    return `<span class="katex-error text-rose-600 font-mono text-xs">[Math Error: ${latex}]</span>`;
  }
}

/**
 * Parses article HTML and replaces LaTeX markers or equation blocks with rendered KaTeX markup.
 */
export function processArticleEquations(htmlContent: string): string {
  if (!htmlContent) return '';

  // 1. Process custom data-equation attributes: <div class="equation-block" data-latex="...">...</div>
  let processed = htmlContent.replace(
    /<div[^>]*class="[^"]*equation-block[^"]*"[^>]*data-latex="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi,
    (_match, latex) => {
      const decoded = decodeURIComponent(latex);
      const rendered = renderLatexToHtml(decoded, true);
      return `<div class="equation-block my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center overflow-x-auto" data-latex="${latex}">${rendered}</div>`;
    }
  );

  // 2. Process block math $$...$$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_match, latex) => {
    const rendered = renderLatexToHtml(latex.trim(), true);
    return `<div class="equation-block my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center overflow-x-auto" data-latex="${encodeURIComponent(latex.trim())}">${rendered}</div>`;
  });

  // 3. Process inline math $...$ (if not preceded/followed by numbers)
  processed = processed.replace(/(?<!\w|\$)\$([^\$\n]+?)\$(?!\w|\$)/g, (_match, latex) => {
    const rendered = renderLatexToHtml(latex.trim(), false);
    return `<span class="inline-equation px-1" data-latex="${encodeURIComponent(latex.trim())}">${rendered}</span>`;
  });

  return processed;
}
