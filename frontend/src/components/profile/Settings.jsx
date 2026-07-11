import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword, deleteAccount, uploadAvatar } from '../../api/authApi';
import { getUserBlogs, deleteBlog } from '../../api/blogApi';
import { avatarUrl, imageUrl, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const SECTIONS = [
  { id: 'profile', icon: 'person', label: 'Profile' },
  { id: 'security', icon: 'lock', label: 'Security' },
  { id: 'posts', icon: 'article', label: 'Your Posts' },
  { id: 'danger', icon: 'warning', label: 'Delete Account' },
];

export default function Settings() {
  const { user, logout, reload } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('profile');
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const fileRef = useRef();

  useEffect(() => {
    if (section === 'posts') {
      setBlogsLoading(true);
      getUserBlogs().then(({ data }) => setBlogs(data.blogs || data)).catch(() => {}).finally(() => setBlogsLoading(false));
    }
  }, [section]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      await reload();
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData(); fd.append('avatar', file);
      await uploadAvatar(fd);
      await reload();
      toast.success('Avatar updated');
    } catch { toast.error('Failed to upload avatar'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.newPw });
      setPasswords({ current: '', newPw: '', confirm: '' });
      toast.success('Password updated');
    } catch { toast.error('Failed to update password'); }
    finally { setSaving(false); }
  };

  const handleDeleteBlog = async () => {
    try {
      await deleteBlog(deleteBlogId);
      setBlogs(prev => prev.filter(b => b._id !== deleteBlogId));
      setDeleteBlogId(null);
      toast.success('Story deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
      toast.success('Account deleted');
      navigate('/');
    } catch { toast.error('Failed to delete account'); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8, outline: 'none',
    background: 'var(--color-surface-container-lowest)',
    border: '1px solid var(--color-outline-variant)',
    color: 'var(--color-on-surface)', fontSize: 14, fontFamily: 'Inter',
  };

  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-12 pb-24">
      <h1 className="text-3xl font-bold mb-10 pt-2" style={{ color: 'var(--color-primary)' }}>Settings</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="md:col-span-1">
          <ul className="space-y-1">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <button onClick={() => setSection(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all"
                  style={section === s.id
                    ? { background: 'var(--color-surface-container)', color: 'var(--color-primary)' }
                    : { color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="md:col-span-3">
          {/* Profile section */}
          {section === 'profile' && (
            <div className="rounded-lg p-8" style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)' }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--color-primary)' }}>Profile Information</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img src={imageUrl(avatarPreview) || avatarUrl(user?.fullName || 'U')} alt=""
                    className="w-20 h-20 rounded-full object-cover"
                    style={{ border: '3px solid var(--color-secondary-container)' }} />
                  <button onClick={() => fileRef.current.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{user?.fullName}</p>
                  <p className="text-sm" style={{ color: 'var(--color-outline)' }}>{user?.email}</p>
                </div>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-5">
                {[
                  { label: 'Full Name', field: 'fullName', type: 'text' },
                  { label: 'Email', field: 'email', type: 'email' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</label>
                    <input type={type} value={profile[field]} onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Security section */}
          {section === 'security' && (
            <div className="rounded-lg p-8" style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)' }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--color-primary)' }}>Security</h2>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                {[
                  { label: 'Current Password', field: 'current' },
                  { label: 'New Password', field: 'newPw' },
                  { label: 'Confirm New Password', field: 'confirm' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</label>
                    <input type="password" value={passwords[field]} onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Your posts */}
          {section === 'posts' && (
            <div className="rounded-lg" style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container)' }}>
              <div className="p-8 border-b" style={{ borderColor: 'var(--color-surface-container-high)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>Your Stories</h2>
              </div>
              {blogsLoading ? <div className="p-8"><Loader /></div>
                : blogs.length === 0
                  ? <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl mb-3 block" style={{ color: 'var(--color-outline)' }}>article</span>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>You haven't written any stories yet.</p>
                    <button onClick={() => navigate('/create')}
                      className="px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
                      style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                      Write Your First Story
                    </button>
                  </div>
                  : blogs.map((blog, i) => (
                    <div key={blog._id} className="flex items-center gap-4 px-8 py-5 border-b"
                      style={{ borderColor: 'var(--color-surface-container-high)' }}>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1" style={{ color: 'var(--color-primary)' }}>{blog.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--color-outline)' }}>{formatDate(blog.createdAt)}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{ background: blog.status === 'published' ? 'rgba(39,174,96,0.15)' : 'var(--color-surface-container)', color: blog.status === 'published' ? '#27ae60' : 'var(--color-outline)' }}>
                            {blog.status || 'published'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => navigate(`/blog/${blog._id}`)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: 'var(--color-on-surface-variant)', border: '1px solid var(--color-outline-variant)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
                        </button>
                        <button onClick={() => navigate(`/edit/${blog._id}`)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: 'var(--color-on-surface-variant)', border: '1px solid var(--color-outline-variant)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                        </button>
                        <button onClick={() => setDeleteBlogId(blog._id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: 'var(--color-error)', border: '1px solid var(--color-error-container)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* Danger zone */}
          {section === 'danger' && (
            <div className="rounded-lg p-8" style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-error-container)' }}>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-error)' }}>Danger Zone</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
                Deleting your account is permanent. All your stories, comments, and profile data will be removed immediately and cannot be recovered.
              </p>
              <button onClick={() => setDeleteModal(true)}
                className="px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider"
                style={{ background: 'var(--color-error)', color: '#fff' }}>
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account">
        <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
          This action is permanent and cannot be undone. All your data will be deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(false)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>Cancel</button>
          <button onClick={handleDeleteAccount}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-error)', color: '#fff' }}>Delete Forever</button>
        </div>
      </Modal>

      <Modal open={!!deleteBlogId} onClose={() => setDeleteBlogId(null)} title="Delete Story">
        <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
          Are you sure you want to delete this story? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteBlogId(null)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>Cancel</button>
          <button onClick={handleDeleteBlog}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-error)', color: '#fff' }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
