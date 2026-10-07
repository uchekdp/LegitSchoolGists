import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  CornerDownRight, 
  Clock, 
  Sparkles,
  ShieldCheck,
  ThumbsUp
} from 'lucide-react';
import { Article, ArticleComment } from '../../types';
import { fetchArticleComments, submitArticleComment, toggleLikeComment } from '../../services/dataService';

interface CommentSectionProps {
  article: Article;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ article }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Reply Form State
  const [replyName, setReplyName] = useState('');
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await fetchArticleComments(article.id);
        if (isMounted) {
          setComments(data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComments();
    return () => {
      isMounted = false;
    };
  }, [article.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim()) {
      setStatusMessage({ text: 'Please enter your name or campus handle.', success: false });
      return;
    }

    if (!content.trim()) {
      setStatusMessage({ text: 'Please write your comment or question before submitting.', success: false });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const created = await submitArticleComment({
        article_id: article.id,
        author_name: authorName.trim(),
        author_email: authorEmail.trim() || undefined,
        content: content.trim(),
      });

      setComments((prev) => [created, ...prev]);
      setContent('');
      setStatusMessage({
        text: 'Thank you! Your comment has been posted to this educational bulletin.',
        success: true,
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Could not submit comment. Please try again.',
        success: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyName.trim() || !replyContent.trim()) return;

    try {
      const created = await submitArticleComment({
        article_id: article.id,
        author_name: replyName.trim(),
        content: replyContent.trim(),
        parent_id: parentId,
      });

      setComments((prev) => [...prev, created]);
      setReplyName('');
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to submit reply:', err);
    }
  };

  const handleLike = async (commentId: string) => {
    if (likedMap[commentId]) return;

    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );

    try {
      await toggleLikeComment(commentId, article.id);
    } catch (err) {
      console.error('Like comment error:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'LS';
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => Boolean(c.parent_id));

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Reader Comments & Q&A
                </h3>
                <span className="bg-sky-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                  {comments.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Have a question or insight regarding this update? Drop your comment below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Moderated Campus Discussion Desk</span>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in ${
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
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Comment Composer Form */}
        <form onSubmit={handleSubmitComment} className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Leave a Reply / Ask a Question
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name / Alias *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Samuel Eze (Aspirant)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional — kept private)
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="e.g. samuel@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Your Comment / Inquiries *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length}/1000
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your opinion, questions about screening dates, aggregate scores, or admission guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed bg-white shadow-xs"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Civil and helpful discussions only. No promotional spam.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Submitting...' : 'Post Comment'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6 pt-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
            Discussion Stream ({comments.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Loading reader questions and responses...</span>
            </div>
          ) : topLevelComments.length > 0 ? (
            <div className="space-y-6">
              {topLevelComments.map((comment) => {
                const commentReplies = replies.filter((r) => r.parent_id === comment.id);
                const isLiked = likedMap[comment.id];

                return (
                  <div
                    key={comment.id}
                    className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 space-y-3 transition-colors hover:bg-slate-50"
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {getInitials(comment.author_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {comment.author_name}
                            </span>
                            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              Verified Reader
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{formatCommentDate(comment.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isLiked
                            ? 'bg-rose-100 text-rose-700 scale-105'
                            : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                        title="Mark as helpful"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>

                    {/* Comment Content */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-12 whitespace-pre-line">
                      {comment.content}
                    </p>

                    {/* Actions & Reply Toggle */}
                    <div className="pl-12 flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}</span>
                      </button>
                    </div>

                    {/* Inline Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="ml-12 mt-3 p-3.5 bg-white rounded-xl border border-sky-200 shadow-sm space-y-2 animate-in fade-in-50 duration-200">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Replying to {comment.author_name}:
                        </span>
                        <input
                          type="text"
                          required
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          placeholder="Your Name / Campus..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                        />
                        <textarea
                          required
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your response..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                        ></textarea>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitReply(comment.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Post Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies Stream */}
                    {commentReplies.length > 0 && (
                      <div className="ml-12 space-y-2.5 pt-2 border-t border-slate-200/60">
                        {commentReplies.map((rep) => (
                          <div
                            key={rep.id}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{rep.author_name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {formatCommentDate(rep.created_at)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleLike(rep.id)}
                                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px]"
                              >
                                <Heart className={`w-3 h-3 ${likedMap[rep.id] ? 'fill-current text-rose-600' : ''}`} />
                                <span>{rep.likes || 0}</span>
                              </button>
                            </div>
                            <p className="text-slate-700 leading-normal">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-300 p-8 max-w-lg mx-auto">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h5 className="font-bold text-slate-800 text-sm">No Comments on This Circular Yet</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Be the first Nigerian student or educator to ask a question, clarify cut-off marks, or share your screening experience!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
