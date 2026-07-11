import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await signin({ email: form.email, password: form.password });
      login(data.user || data);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign in failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 16px', borderRadius: 8, outline: 'none',
    background: 'var(--color-surface-container-lowest)',
    border: `1px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
    color: 'var(--color-on-surface)', fontSize: 14, fontFamily: 'Inter',
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16"
        style={{ background: 'var(--color-primary-container)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-secondary-container)' }}>Medium Blog</h1>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--color-on-primary-fixed-variant)', opacity: 0.7 }}>Premium Editorial</p>
        </div>
        <div>
          <p className="font-serif text-4xl leading-tight mb-6" style={{ color: 'var(--color-primary-fixed)' }}>
            "Words are the most powerful tool in the writer's arsenal."
          </p>
          <p className="text-sm" style={{ color: 'var(--color-on-primary-fixed-variant)' }}>— Premium Editorial Platform</p>
        </div>
        <div className="flex gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-1 rounded-full flex-1"
              style={{ background: i === 1 ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--color-secondary)' }} className="font-semibold">Sign up</Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Email</label>
              <input type="email" value={form.email} placeholder="you@example.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle('email')} />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Password</label>
                <a href="#" className="text-xs font-semibold" style={{ color: 'var(--color-secondary)' }}>Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} placeholder="••••••••"
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle('password'), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-outline)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.remember}
                onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Remember me</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
              style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
              <span className="text-xs" style={{ color: 'var(--color-outline)' }}>or continue with</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'GitHub'].map(provider => (
                <button key={provider}
                  className="py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-surface-container"
                  style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }}>
                  {provider}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
