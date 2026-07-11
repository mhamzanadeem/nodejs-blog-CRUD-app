import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard, { SmallBlogCard } from '../common/BlogCard';
import Loader from '../common/Loader';
import { getBlogs } from '../../api/blogApi';
import { CATEGORIES, PLACEHOLDER_IMAGE } from '../../utils/constants';
import { excerpt, readTime } from '../../utils/formatters';

const STATIC_TRENDING = [
  { label: 'Business', title: 'The 4-Day Work Week Experiment Results' },
  { label: 'Productivity', title: 'Reclaiming Focus in the Age of Noise' },
];

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('For You');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (category !== 'For You') params.category = category;
      if (search) params.search = search;
      const { data } = await getBlogs(params);
      setBlogs(data.blogs || data);
      setTotalPages(data.pages || 1);
    } catch {
      setError('Failed to load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const featured = blogs[0];
  const sidePosts = blogs.slice(1, 3);
  const regularPosts = blogs.slice(3);

  return (
    <section className="max-w-[1120px] mx-auto px-5 md:px-12 mt-12">
      {/* Header */}
      <div className="mb-12">
        <h2 className="font-bold text-4xl md:text-5xl mb-4 tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Inter', letterSpacing: '-0.02em' }}>
          The Editorial Feed
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {['For You', ...CATEGORIES].map(cat => (
              <button key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className="whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                style={category === cat
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                  : { border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                {cat}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex items-center rounded-full px-4 py-1.5 gap-2"
            style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-outline)' }}>search</span>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search stories…" className="bg-transparent outline-none text-sm w-40"
              style={{ color: 'var(--color-on-surface)' }} />
          </form>
        </div>
      </div>

      {loading && <Loader text="Loading stories…" />}

      {error && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: 'var(--color-outline)' }}>wifi_off</span>
          <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>{error}</p>
          <button onClick={fetchBlogs} className="text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg"
            style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: 'var(--color-outline)' }}>article</span>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>No stories yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
            {search ? 'No results for your search.' : 'Be the first to publish a story.'}
          </p>
          <button onClick={() => navigate('/create')}
            className="text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-lg"
            style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
            Write a Story
          </button>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Featured */}
          {featured && <BlogCard blog={featured} featured />}

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {sidePosts.map(blog => <SmallBlogCard key={blog._id} blog={blog} />)}

            {/* Trending widget */}
            <div className="rounded-lg p-8 mt-2" style={{ background: 'var(--color-primary-container)' }}>
              <h5 className="text-xs font-semibold uppercase tracking-wider mb-6 flex items-center gap-2"
                style={{ color: 'var(--color-secondary-container)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>trending_up</span>
                Trending Now
              </h5>
              <ul className="space-y-6">
                {STATIC_TRENDING.map((item, i) => (
                  <li key={i} className="flex gap-4 group cursor-pointer">
                    <span className="text-3xl font-bold" style={{ color: 'rgba(47,72,106,0.4)', fontFamily: 'Inter' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-on-primary-fixed-variant)' }}>{item.label}</p>
                      <p className="font-serif text-base leading-tight group-hover:underline"
                        style={{ color: 'var(--color-primary-fixed)' }}>{item.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Regular posts */}
          {regularPosts.map(blog => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-16 pb-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className="w-10 h-10 rounded-full text-sm font-semibold transition-all"
              style={p === page
                ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                : { color: 'var(--color-on-surface-variant)' }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
