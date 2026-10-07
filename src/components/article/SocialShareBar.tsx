import React, { useState } from 'react';
import { 
  Share2, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Link2, 
  Check, 
  Send, 
  Smartphone,
  Copy,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Article } from '../../types';

interface SocialShareBarProps {
  article: Article;
  variant?: 'top' | 'bottom' | 'sticky';
  className?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  article,
  variant = 'top',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://legitschoolgists.com/article/${article.slug}`;
  const shareTitle = article.title;
  const whatsappDeskNumber = '2349039733298'; // Official LegitSchoolGists WhatsApp Desk

  // 1. WhatsApp Broadcast & Status Sharing (Shares article to WhatsApp contacts/groups)
  const handleShareWhatsApp = () => {
    const text = `📢 *${shareTitle}*\n\nRead the full verified report on LegitSchoolGists:\n🔗 ${currentUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening WhatsApp to share story...');
  };

  // 2. WhatsApp Direct Editorial Contact (Specifically uses provided desk contact logic)
  const handleContactWhatsAppDesk = () => {
    const text = `Hello LegitSchoolGists Editorial Desk,\n\nI am contacting you regarding this circular:\n📰 *${shareTitle}*\n🔗 ${currentUrl}\n\nPlease I have an inquiry:`;
    const url = `https://wa.me/${whatsappDeskNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Connecting to WhatsApp Newsroom...');
  };

  // 3. Twitter / X Sharing
  const handleShareTwitter = () => {
    const text = `${shareTitle} — Read on @LegitSchoolGists`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening X (Twitter)...');
  };

  // 4. Facebook Sharing
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening Facebook...');
  };

  // 5. Telegram Sharing
  const handleShareTelegram = () => {
    const text = `${shareTitle}\n\n${currentUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening Telegram...');
  };

  // 6. Copy Link to Clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      triggerToast('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      triggerToast('Could not copy link automatically.');
    }
  };

  // 7. Native Mobile Share if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: article.excerpt || shareTitle,
          url: currentUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  if (variant === 'bottom') {
    return (
      <div className={`space-y-4 my-8 p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 ${className}`}>
        {showToast && (
          <div className="bg-sky-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg text-center animate-fade-in shadow-sm">
            {showToast}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white">Share Article:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
              title="Share on WhatsApp groups and status"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Twitter / X Button */}
            <button
              onClick={handleShareTwitter}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              title="Share on Twitter / X"
            >
              <Twitter className="w-4 h-4" />
              <span>X (Twitter)</span>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleShareFacebook}
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleShareTelegram}
              className="bg-[#229ED9] hover:bg-[#1e8cc0] text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy link to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Contact Logic Desk Banner */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sky-200">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Need clarification on this article? Chat directly with our editorial desk:
            </span>
          </div>
          <button
            onClick={handleContactWhatsAppDesk}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp Desk (+234 903 973 3298)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Top inline variant
  return (
    <div className={`py-3.5 px-4 my-4 bg-sky-50/80 rounded-2xl border border-sky-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      {showToast && (
        <div className="w-full bg-sky-600 text-white text-xs font-bold py-1 px-3 rounded-lg text-center animate-fade-in sm:hidden">
          {showToast}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
        <Share2 className="w-4 h-4 text-sky-600 shrink-0" />
        <span>Share article with fellow candidates:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* WhatsApp Share Button */}
        <button
          onClick={handleShareWhatsApp}
          className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </button>

        {/* X / Twitter Button */}
        <button
          onClick={handleShareTwitter}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
          title="Share on X / Twitter"
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>Twitter</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={handleShareFacebook}
          className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
          title="Share on Facebook"
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
          title="Copy link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* WhatsApp Direct Inquiry Button */}
        <button
          onClick={handleContactWhatsAppDesk}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer hidden md:flex"
          title="Contact LegitSchoolGists Desk on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Desk Help</span>
        </button>
      </div>
    </div>
  );
};
