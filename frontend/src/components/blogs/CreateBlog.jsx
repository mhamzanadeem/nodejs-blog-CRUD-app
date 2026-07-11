import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createBlog } from '../../api/blogApi';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

export default function CreateBlog({ initialData = null, blogId = null }) {
  const navigate = useNavigate();
  const isEdit = !!blogId;
  const [form, setForm] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || '',
    status: initialData?.status || 'published',
    tags: initialData?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(null);
  const [preview, setPreview] = useState(false);
  const autoSaveRef = useRef(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isEdit) {
      const saved = localStorage.getItem('blog_draft');
      if (saved) {
        try { setForm(JSON.parse(saved)); } catch {}
      }
    }
  }, [isEdit]);

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!isEdit) {
        localStorage.setItem('blog_draft', JSON.stringify(form));
        setAutoSaved(new Date());
      }
    }, 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [form, isEdit]);

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: typeof val === 'string' ? val : val.target.value }));

  const handleSubmit = async (status = form.status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim() || form.content === '<p><br></p>') { toast.error('Content is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const api = isEdit
        ? (await import('../../api/blogApi')).updateBlog
        : createBlog;
      const { data } = isEdit ? await api(blogId, payload) : await api(payload);
      const newId = data.blog?._id || data._id;
      localStorage.removeItem('blog_draft');
      toast.success(isEdit ? 'Story updated!' : `Story ${status === 'draft' ? 'saved as draft' : 'published'}!`);
      navigate(`/blog/${newId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8, outline: 'none',
    background: 'var(--color-surface-container-lowest)',
    border: '1px solid var(--color-outline-variant)',
    color: 'var(--color-on-surface)', fontSize: 14, fontFamily: 'Inter',
  };

  return (
    <div className="max-w-[800px] mx-auto px-5 md:px-0 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pt-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {isEdit ? 'Edit Story' : 'Write a Story'}
          </h1>
          {autoSaved && !isEdit && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-outline)' }}>
              Draft auto-saved at {autoSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPreview(!preview)}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => handleSubmit('draft')} disabled={saving}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
            Save Draft
          </button>
          <button onClick={() => handleSubmit('published')} disabled={saving}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all hover:shadow-md disabled:opacity-50"
            style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
            {saving ? 'Saving\u2026' : isEdit ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {preview ? (
        <div>
          <h2 className="font-bold text-4xl mb-4 tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'Inter' }}>{form.title}</h2>
          <div className="font-serif text-lg leading-[1.85]" style={{ color: 'var(--color-on-surface)' }}
            dangerouslySetInnerHTML={{ __html: form.content }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="Your story title\u2026" style={{ ...inputStyle, fontSize: 24, fontFamily: 'Inter', fontWeight: 700 }} />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Category</label>
              <select value={form.category} onChange={set('category')} style={inputStyle}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={set('tags')} placeholder="ai, design, future" style={inputStyle} />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Excerpt (optional)</label>
            <textarea value={form.excerpt} onChange={set('excerpt')} placeholder="Brief summary shown in feed cards\u2026"
              rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Content *</label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={set('content')}
              modules={QUILL_MODULES}
              style={{ fontFamily: 'Source Serif 4, serif' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
