import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, passwordStrengthLabel } from '../../utils/validators';
import toast from 'react-hot-toast';

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', bio: '', agree: false });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const pwStrength = validatePassword(form.password);
  const strengthInfo = passwordStrengthLabel(pwStrength.score);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!validateEmail(form.email)) e.email = 'Valid email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agree) e.agree = 'You must accept the terms';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'agree') formData.append(k, v); });
      if (avatar) formData.append('avatar', avatar);
      const { data } = await signup(formData);
      login(data.user || data);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign up failed';
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
    transition: 'border-color 0.2s',
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16"
        style={{ background: 'var(--color-primary-container)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-secondary-container)' }}>Medium Blog</h1>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--color-on-primary-fixed-variant)', opacity: 0.7 }}>Premium Editorial</p>
        </div>
        <div>
          <p className="font-serif text-4xl leading-tight mb-6" style={{ color: 'var(--color-primary-fixed)' }}>
            "Every expert was once a beginner. Start writing your story today."
          </p>
        </div>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>Create account</h2>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Already have an account? <Link to="/signin" style={{ color: 'var(--color-secondary)' }} className="font-semibold">Sign in</Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden cursor-pointer flex items-center justify-center"
                style={{ background: 'var(--color-surface-container)', border: '2px dashed var(--color-outline-variant)' }}
                onClick={() => fileRef.current.click()}>
                {avatarPreview
                  ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar preview" />
                  : <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>person</span>}
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current.click()}
                  className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                  style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                  Upload Photo
                </button>
                <p className="text-xs mt-1" style={{ color: 'var(--color-outline)' }}>Optional</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Full Name</label>
              <input value={form.fullName} onChange={set('fullName')} placeholder="Jane Doe" style={inputStyle('fullName')} />
              {errors.fullName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" style={inputStyle('email')} />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" style={{ ...inputStyle('password'), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-outline)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= pwStrength.score ? strengthInfo.color : 'var(--color-surface-container-high)' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                </div>
              )}
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" style={inputStyle('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Bio (Optional)</label>
              <textarea value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself..."
                rows={3} style={{ ...inputStyle('bio'), resize: 'vertical' }} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={set('agree')} className="w-4 h-4 mt-0.5 rounded flex-shrink-0" />
              <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                I agree to the <a href="#" style={{ color: 'var(--color-secondary)' }} className="font-semibold">Terms of Service</a> and{' '}
                <a href="#" style={{ color: 'var(--color-secondary)' }} className="font-semibold">Privacy Policy</a>
              </span>
            </label>
            {errors.agree && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.agree}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
              style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
