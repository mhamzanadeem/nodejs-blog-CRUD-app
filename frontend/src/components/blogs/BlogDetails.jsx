import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlog, deleteBlog } from '../../api/blogApi';
import { getComments, addComment } from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import Comment from '../common/Comment';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { formatDate, readTime, avatarUrl, imageUrl } from '../../utils/formatters';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: bData }, { data: cData }] = await Promise.all([getBlog(id), getComments(id)]);
      setBlog(bData.blog || bData);
      setComments(cData.comments || cData);
    } catch {
      toast.error('Failed to load story');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { navigate('/signin'); return; }
    setSubmitting(true);
    try {
      const { data } = await addComment(id, { content: commentText });
      setComments(prev => [data.comment || data, ...prev]);
      setCommentText('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBlog(id);
      toast.success('Story deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete story');
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
  };

  const share = (platform) => {
    const url = window.location.href;
    const title = blog?.title;
    if (platform === 'copy') { navigator.clipboard.writeText(url); toast.success('Link copied!'); return; }
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
    if (platform === 'linkedin') window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!blog) return null;

  const isAuthor = user?._id === (blog.author?._id || blog.author);
  const rt = readTime(blog.content);

  return (
    <article className="max-w-[720px] mx-auto px-5 md:px-0 pb-24">
      {/* Hero image */}
      <div className="h-72 md:h-96 rounded-lg overflow-hidden mb-10 -mx-5 md:mx-0">
        <img src={imageUrl(blog.coverImage) || PLACEHOLDER_IMAGE} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-6">
        {blog.category && (
          <span className="text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(254,214,91,0.2)', color: 'var(--color-secondary)' }}>
            {blog.category}
          </span>
        )}
        <span className="text-sm" style={{ color: 'var(--color-outline)' }}>• {rt} min read</span>
      </div>

      {/* Title */}
      <h1 className="font-bold text-4xl md:text-5xl mb-6 leading-tight tracking-tight"
        style={{ color: 'var(--color-primary)', fontFamily: 'Inter', letterSpacing: '-0.02em' }}>
        {blog.title}
      </h1>

      {/* Author row */}
      <div className="flex items-center justify-between mb-10 pb-8 border-b"
        style={{ borderColor: 'var(--color-surface-container-high)' }}>
        <div className="flex items-center gap-3">
          <img src={imageUrl(blog.author?.avatar) || avatarUrl(blog.author?.fullName || 'U')} alt={blog.author?.fullName}
            className="w-12 h-12 rounded-full object-cover"
            style={{ border: '2px solid var(--color-secondary-container)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{blog.author?.fullName}</p>
            <p className="text-xs" style={{ color: 'var(--color-outline)' }}>{formatDate(blog.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Share buttons */}
          {[
            { icon: 'share', action: () => share('copy'), title: 'Copy link' },
            { icon: 'share', action: () => share('twitter'), title: 'Twitter' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} title={btn.title}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-surface-container"
              style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{btn.icon}</span>
            </button>
          ))}
          {isAuthor && (
            <>
              <button onClick={() => navigate(`/edit/${blog._id}`)}
                className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                Edit
              </button>
              <button onClick={() => setDeleteModal(true)}
                className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)' }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="font-serif text-lg leading-[1.85] mb-16"
        style={{ color: 'var(--color-on-surface)' }}
        dangerouslySetInnerHTML={{ __html: blog.content }} />

      {/* Author bio */}
      {blog.author?.bio && (
        <div className="p-8 rounded-lg mb-12" style={{ background: 'var(--color-surface-container-low)' }}>
          <div className="flex items-center gap-3 mb-4">
            <img src={imageUrl(blog.author?.avatar) || avatarUrl(blog.author?.fullName || 'U')} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{blog.author?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--color-outline)' }}>Author</p>
            </div>
          </div>
          <p className="font-serif text-base leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
            {blog.author.bio}
          </p>
        </div>
      )}

      {/* Comments */}
      <section>
        <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--color-primary)' }}>
          Responses ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-3 mb-10">
            <img src={imageUrl(user.avatar) || avatarUrl(user.fullName)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 flex gap-3">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts…"
                className="flex-1 px-4 py-3 rounded-lg outline-none text-sm"
                style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }} />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                {submitting ? '…' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mb-8 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            <button onClick={() => navigate('/signin')} className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Sign in</button> to leave a comment.
          </p>
        )}

        {comments.length === 0
          ? <p className="text-sm text-center py-10" style={{ color: 'var(--color-outline)' }}>No responses yet. Be the first!</p>
          : comments.map(c => (
            <Comment key={c._id} comment={c} blogId={id} onDelete={handleDeleteComment} />
          ))}
      </section>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Story">
        <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
          Are you sure you want to delete this story? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(false)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
            Cancel
          </button>
          <button onClick={handleDelete}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-error)', color: '#fff' }}>
            Delete
          </button>
        </div>
      </Modal>
    </article>
  );
}
