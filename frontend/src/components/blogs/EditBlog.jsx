import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateBlog from './CreateBlog';
import { getBlog } from '../../api/blogApi';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlog(id)
      .then(({ data }) => setBlog(data.blog || data))
      .catch(() => { toast.error('Blog not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!blog) return null;

  return (
    <div>
      <div className="max-w-[800px] mx-auto px-5 md:px-0 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-outline)' }}>
          Last edited: {new Date(blog.updatedAt).toLocaleString()}
        </p>
      </div>
      <CreateBlog initialData={blog} blogId={id} />
    </div>
  );
}
