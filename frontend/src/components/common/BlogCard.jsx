import { useNavigate } from 'react-router-dom';
import { formatDate, readTime, excerpt, avatarUrl, imageUrl } from '../../utils/formatters';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

export default function BlogCard({ blog, featured = false }) {
  const navigate = useNavigate();
  const rt = readTime(blog.content);
  const img = imageUrl(blog.coverImage) || PLACEHOLDER_IMAGE;
  const authorAvatar = imageUrl(blog.author?.avatar) || avatarUrl(blog.author?.fullName || 'U');

  if (featured) {
    return (
      <article
        className="md:col-span-8 rounded-lg overflow-hidden cursor-pointer group"
        style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)', boxShadow: '0 1px 3px rgba(0,6,19,0.06)' }}
        onClick={() => navigate(`/blog/${blog._id}`)}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div className="aspect-video relative overflow-hidden">
          <div className="absolute inset-0 z-10 transition-colors group-hover:bg-transparent"
            style={{ background: 'rgba(0,6,19,0.08)' }} />
          <img src={img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-semibold"
              style={{ background: 'rgba(254,214,91,0.2)', color: 'var(--color-secondary)' }}>
              {blog.category || 'Featured Editorial'}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-outline)' }}>• {rt} min read</span>
          </div>
          <h3 className="font-serif text-3xl md:text-4xl mb-4 leading-snug transition-colors"
            style={{ color: 'var(--color-primary)' }}>
            {blog.title}
          </h3>
          <p className="font-serif text-lg mb-8 line-clamp-2" style={{ color: 'var(--color-on-surface-variant)' }}>
            {blog.excerpt || excerpt(blog.content)}
          </p>
          <div className="flex items-center justify-between border-t pt-6"
            style={{ borderColor: 'var(--color-surface-container-high)' }}>
            <div className="flex items-center gap-3">
              <img src={authorAvatar} alt={blog.author?.fullName}
                className="w-10 h-10 rounded-full object-cover"
                style={{ background: 'var(--color-surface-dim)' }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                  {blog.author?.fullName || 'Unknown'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-outline)' }}>
                  {formatDate(blog.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--color-outline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat_bubble</span>
                <span className="text-xs font-semibold uppercase tracking-wider">{blog.commentCount || 0}</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95"
                style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                Read More
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="md:col-span-4 rounded-lg overflow-hidden cursor-pointer transition-all"
      style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)', boxShadow: '0 1px 3px rgba(0,6,19,0.06)' }}
      onClick={() => navigate(`/blog/${blog._id}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,6,19,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,6,19,0.06)'; }}>
      <div className="h-48 overflow-hidden">
        <img src={img} alt={blog.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h4 className="font-serif text-2xl mb-3" style={{ color: 'var(--color-primary)' }}>{blog.title}</h4>
        <p className="font-serif mb-6 line-clamp-3" style={{ color: 'var(--color-on-surface-variant)' }}>
          {blog.excerpt || excerpt(blog.content)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-outline)' }}>
            {formatDate(blog.createdAt)} • {rt} min
          </span>
          <a className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-all hover:gap-2"
            style={{ color: 'var(--color-secondary)' }}>
            Read More <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function SmallBlogCard({ blog }) {
  const navigate = useNavigate();
  const rt = readTime(blog.content);
  const img = imageUrl(blog.coverImage) || PLACEHOLDER_IMAGE;

  return (
    <article
      className="rounded-lg p-6 cursor-pointer group transition-all"
      style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)', boxShadow: '0 1px 3px rgba(0,6,19,0.06)' }}
      onClick={() => navigate(`/blog/${blog._id}`)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,6,19,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,6,19,0.06)'}>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-secondary)' }}>
              {blog.category || 'General'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-outline)' }}>{rt} min</span>
          </div>
          <h4 className="font-serif text-xl leading-tight line-clamp-2 transition-colors group-hover:text-secondary"
            style={{ color: 'var(--color-primary)' }}>
            {blog.title}
          </h4>
        </div>
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--color-surface-dim)' }}>
          <img src={img} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-outline)' }}>
          By {blog.author?.fullName || 'Unknown'}
        </span>
        <span className="material-symbols-outlined transition-colors" style={{ fontSize: 20, color: 'var(--color-outline)' }}>bookmark</span>
      </div>
    </article>
  );
}
