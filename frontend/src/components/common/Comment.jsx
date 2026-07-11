import { useState } from 'react';
import { formatRelativeDate, avatarUrl, imageUrl } from '../../utils/formatters';
import { deleteComment, replyToComment } from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Comment({ comment, blogId, onDelete }) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      onDelete(comment._id);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await replyToComment(blogId, comment._id, { content: replyText });
      setReplies(prev => [...prev, data.reply || data]);
      setReplyText('');
      setReplyOpen(false);
      toast.success('Reply added');
    } catch {
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const avatar = imageUrl(comment.author?.avatar) || avatarUrl(comment.author?.fullName || 'U');

  return (
    <div className="py-5 border-b" style={{ borderColor: 'var(--color-surface-container-high)' }}>
      <div className="flex gap-3">
        <img src={avatar} alt={comment.author?.fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
              {comment.author?.fullName || 'Anonymous'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-outline)' }}>
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>
          <p className="font-serif text-base leading-relaxed" style={{ color: 'var(--color-on-surface)' }}>
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            {user && (
              <button onClick={() => setReplyOpen(!replyOpen)}
                className="text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{ color: 'var(--color-outline)' }}>
                Reply
              </button>
            )}
            {user?._id === comment.author?._id && (
              <button onClick={handleDelete}
                className="text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{ color: 'var(--color-error)' }}>
                Delete
              </button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
              />
              <button onClick={handleReply} disabled={submitting}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg disabled:opacity-50"
                style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2" style={{ borderColor: 'var(--color-surface-container-high)' }}>
              {replies.map(reply => (
                <div key={reply._id} className="flex gap-3 mb-3">
                  <img src={imageUrl(reply.author?.avatar) || avatarUrl(reply.author?.fullName || 'U')} alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold mr-2" style={{ color: 'var(--color-primary)' }}>
                      {reply.author?.fullName}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-outline)' }}>
                      {formatRelativeDate(reply.createdAt)}
                    </span>
                    <p className="font-serif text-sm mt-1" style={{ color: 'var(--color-on-surface)' }}>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
