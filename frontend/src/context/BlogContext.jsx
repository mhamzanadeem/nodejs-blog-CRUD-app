import { createContext, useContext, useState, useCallback } from 'react';
import { getBlogs } from '../api/blogApi';

const BlogContext = createContext(null);

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getBlogs(params);
      setBlogs(data.blogs || data);
      setTotal(data.total || (data.blogs || data).length);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <BlogContext.Provider value={{ blogs, total, page, loading, error, fetchBlogs, setBlogs }}>
      {children}
    </BlogContext.Provider>
  );
}

export const useBlogContext = () => useContext(BlogContext);
