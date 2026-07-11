import { useState, useEffect, useCallback } from 'react';
import { getBlog } from '../api/blogApi';

export function useBlog(id) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getBlog(id);
      setBlog(data.blog || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { blog, loading, error, refetch: fetch };
}
