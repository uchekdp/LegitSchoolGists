import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Share2
} from 'lucide-react';
import { ArticleComment } from '../../types';
import { fetchArticleComments, submitArticleComment, likeArticleComment } from '../../services/dataService';

interface ArticleCommentsProps {
  articleId: string;
  articleTitle: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({
  articleId,
  articleTitle,
}) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await fetchArticleComments(articleId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatusMessage({ success: false, text: 'Please enter your name or alias before posting.' });
      return;
    }

    if (!content.trim()) {
      setStatusMessage({ success: false, text: 'Please write your comment or question.' });
      return;
    }

    if (content.trim().length < 5) {
      setStatusMessage({ success: false, text: 'Comment must be at least 5 characters long.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const newComment = await submitArticleComment({
        article_id: articleId,
        author_name: name.trim(),
        author_email: email.trim() || undefined,
        content: content.trim(),
      });

      setComments((prev) => [newComment, ...prev]);
      setContent('');
      setStatusMessage({
        success: true,
        text: 'Thank you! Your comment has been published to the student discussion board.',
      });

      // Save author name locally for convenience
      if (typeof window !== 'undefined' && name.trim()) {
        localStorage.setItem('lsg_comment_author_name', name.trim());
        if (email.trim()) localStorage.setItem('lsg_comment_author_email', email.trim());
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setStatusMessage({
        success: false,
        text: 'An error occurred while submitting your comment. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-fill author info from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('lsg_comment_author_name');
      const savedEmail = localStorage.getItem('lsg_comment_author_email');
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  const handleLike = async (commentId: string) => {
    if (likedMap[commentId]) return;

    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );

    try {
      await likeArticleComment(commentId);
    } catch (err) {
      console.warn('Like comment issue:', err);
    }
  };

  const getInitials = (author: string) => {
    const parts = author.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (author.slice(0, 2) || 'ST').toUpperCase();
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Avatar background colors based on name string hash
  const getAvatarColor = (str: string) => {
    const colors = [
      'from-sky-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      {/* Section Heading */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
            <MessageSquare className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Reader Discussion & Queries
              </h3>
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                {comments.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Have a question about this update or screening date? Drop your thoughts below.
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          Leave a Comment or Question
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Your email address will remain confidential and won't be published.
        </p>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl mb-4 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in ${
              statusMessage.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Full Name / Alias *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Victor Adeleke, Chinedu, Amina"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. candidate@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Comment / Inquiry *
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {content.length}/1000 characters
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask about departmental cut-offs, screening portal dates, JAMB CAPS procedures, or share your personal admission experience..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-2xs"
            ></textarea>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick prompts:
            </span>
            {[
              'What is the departmental cut-off for Law?',
              'Has the Post-UTME screening form closed?',
              'How do I accept admission on JAMB CAPS?',
              'Is direct entry registration ongoing?',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setContent((prev) => (prev ? `${prev} ${prompt}` : prompt))}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                + {prompt}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Moderated educational discussion</span>
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim() || !name.trim()}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Posting Comment...' : 'Submit Comment'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading reader discussions...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h5 className="font-bold text-slate-800 text-sm sm:text-base">No comments yet</h5>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first candidate to leave a comment or ask a question regarding this circular!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = likedMap[comment.id];
            const avatarGradient = getAvatarColor(comment.author_name);

            return (
              <div
                key={comment.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* User Avatar Badge */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${avatarGradient} text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {getInitials(comment.author_name)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {comment.author_name}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded-full">
                          Verified Reader
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(comment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                    title="Helpful comment"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>

                {/* Comment Body */}
                <div className="mt-3 pl-12 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
