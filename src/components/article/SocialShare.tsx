import React, { useState } from 'react';
import { 
  Share2, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Link2, 
  Check, 
  Send, 
  Linkedin,
  MessageSquareShare
} from 'lucide-react';
import { Article } from '../../types';

interface SocialShareProps {
  article: Article;
  variant?: 'top' | 'card' | 'inline';
}

export const SocialShare: React.FC<SocialShareProps> = ({ article, variant = 'top' }) => {
  const [copied, setCopied] = useState(false);
  const [showDirectDesk, setShowDirectDesk] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://legitschoolgists.com.ng/article/${article.slug}`;
  };

  const shareUrl = getShareUrl();
  const rawExcerpt = (article.excerpt || article.title).replace(/<[^>]*>?/gm, '').substring(0, 160);

  // WhatsApp formatted message
  const whatsappShareMessage = `📢 *${article.title}*\n\n${rawExcerpt}...\n\n👉 Read verified circular here on LegitSchoolGists:\n${shareUrl}`;

  // WhatsApp share link (to contacts/groups)
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareMessage)}`;

  // Direct WhatsApp contact logic for student inquiry / newsdesk (+234 903 973 3298)
  const whatsappDeskUrl = `https://wa.me/2349039733298?text=${encodeURIComponent(
    `Hello LegitSchoolGists, I have an inquiry regarding this circular: "${article.title}" (${shareUrl})`
  )}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    article.title
  )}&url=${encodeURIComponent(shareUrl)}&via=legitschoolgists`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    article.title
  )}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: rawExcerpt,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  if (variant === 'card') {
    return (
      <div className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-sky-200 font-medium">Help a candidate stay informed</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Share This Educational Circular
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Broadcast verified updates to course mates, departmental groups, and WhatsApp statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNativeShare}
            className="sm:hidden bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-white/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More Options</span>
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          {/* WhatsApp Share Button */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba59] text-white p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-sm text-center group"
            title="Share to WhatsApp Status & Groups"
          >
            <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>Share to WhatsApp</span>
          </a>

          {/* Facebook Share Button */}
          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1877F2] hover:bg-[#166fe5] text-white p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-sm text-center group"
            title="Share to Facebook"
          >
            <Facebook className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>Share on Facebook</span>
          </a>

          {/* Twitter / X Share Button */}
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black hover:bg-slate-800 text-white p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-sm text-center group border border-slate-700"
            title="Post on X (Twitter)"
          >
            <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Post on X / Twitter</span>
          </a>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-sm text-center border border-white/20"
            title="Copy Article Web Address"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Link2 className="w-5 h-5 text-sky-300" />
            )}
            <span>{copied ? 'Link Copied!' : 'Copy Web Link'}</span>
          </button>
        </div>

        {/* Direct WhatsApp Contact Logic Banner */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
            <MessageSquareShare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Need clarification on this admission circular or JAMB requirement?</span>
          </div>

          <a
            href={whatsappDeskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Direct WhatsApp Desk (+234 903 973 3298)</span>
          </a>
        </div>
      </div>
    );
  }

  // Default / Top Compact Variant
  return (
    <div className="py-3.5 my-4 bg-sky-50/70 rounded-2xl px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-sky-100 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Share2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-sky-950 block leading-tight">
            Share Educational Circular
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Broadcast to candidates & WhatsApp groups
          </span>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {/* WhatsApp Share Button with contact logic */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          title="Share to WhatsApp contacts & groups"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </a>

        {/* Facebook Share Button */}
        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          title="Share on Facebook"
        >
          <Facebook className="w-3.5 h-3.5 fill-current" />
          <span className="hidden xs:inline">Facebook</span>
        </a>

        {/* Twitter / X Share Button */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          title="Post on X (Twitter)"
        >
          <Twitter className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">X / Twitter</span>
        </a>

        {/* Telegram Share Button */}
        <a
          href={telegramShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex bg-[#229ED9] hover:bg-[#1d8bc0] text-white px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-colors shadow-sm"
          title="Share on Telegram"
        >
          <Send className="w-3 h-3" />
          <span>Telegram</span>
        </a>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          title="Copy web link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
