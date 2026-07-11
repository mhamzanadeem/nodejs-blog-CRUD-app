import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../App';
import { avatarUrl, imageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: 'home', label: 'Home', exact: true },
  { to: '/create', icon: 'edit_note', label: 'Write' },
  { to: '/settings', icon: 'person', label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/signin');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 text-xs font-semibold tracking-wider ${
      isActive ? 'bg-white/10' : 'hover:bg-white/5'
    }`;

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--color-secondary-container)' : 'var(--color-on-primary-fixed-variant)',
    borderLeft: isActive ? '3px solid var(--color-secondary-container)' : '3px solid transparent',
    paddingLeft: isActive ? '9px' : '12px',
  });

  return (
    <>
      <style>{`
        .sidebar-transition {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .overlay-fade {
          transition: opacity 0.3s ease;
        }
        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--color-on-primary-fixed-variant);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(3px, 3px);
        }
        .hamburger-line.open:nth-child(2) {
          opacity: 0;
        }
        .hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(3px, -3px);
        }
        @media (min-width: 768px) {
          .main-content {
            margin-left: 240px;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .main-content.collapsed {
            margin-left: 64px;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col sidebar-transition"
        style={{
          width: sidebarOpen ? 240 : 64,
          background: 'var(--color-primary-container)',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4 flex-shrink-0">
          {sidebarOpen && (
            <h1 className="text-lg font-bold whitespace-nowrap" style={{ color: 'var(--color-secondary-container)' }}>
              Medium Blog
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 mt-6 flex-1 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={navLinkClass}
              style={navLinkStyle}
              title={item.label}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 22 }}>{item.icon}</span>
              <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 px-3 pb-4">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <img
                src={imageUrl(user.avatar) || avatarUrl(user.fullName)}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid var(--color-secondary-container)' }}
              />
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-secondary-container)' }}>
                    {user.fullName}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-on-primary-fixed-variant)', opacity: 0.7 }}>
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/signin')}
                className="w-full text-xs uppercase tracking-wider py-2 px-3 rounded-lg transition-all hover:bg-white/10"
                style={{ color: 'var(--color-secondary-container)', border: '1px solid var(--color-secondary-container)' }}>
                {sidebarOpen ? 'Sign In' : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>}
              </button>
            </div>
          )}
          {user && (
            <button onClick={handleLogout}
              className="w-full mt-1 text-xs uppercase tracking-wider py-2 px-3 rounded-lg transition-all hover:bg-white/10 flex items-center gap-2"
              style={{ color: 'var(--color-on-primary-fixed-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-14"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-surface-container-high)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} style={{ color: 'var(--color-on-surface)' }}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Medium Blog</h1>
        </div>
        {user && (
          <img
            src={imageUrl(user.avatar) || avatarUrl(user.fullName)}
            alt={user.fullName}
            className="w-8 h-8 rounded-full object-cover"
            onClick={() => navigate('/settings')}
          />
        )}
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 overlay-fade"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className="absolute left-0 top-0 h-full w-64 flex flex-col py-6 px-4"
            style={{ background: 'var(--color-primary-container)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-secondary-container)' }}>Medium Blog</h1>
              <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-on-primary-fixed-variant)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {user && (
              <button onClick={() => { navigate('/create'); setMobileOpen(false); }}
                className="mb-6 w-full font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
                Write Post
              </button>
            )}

            <div className="flex flex-col gap-1 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkClass}
                  style={navLinkStyle}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            {user ? (
              <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3 px-3 mb-3">
                  <img src={imageUrl(user.avatar) || avatarUrl(user.fullName)} alt={user.fullName}
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ border: '2px solid var(--color-secondary-container)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-secondary-container)' }}>{user.fullName}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-on-primary-fixed-variant)', opacity: 0.7 }}>{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-xs uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--color-on-primary-fixed-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button onClick={() => { navigate('/signin'); setMobileOpen(false); }}
                  className="w-full text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all"
                  style={{ color: 'var(--color-secondary-container)', border: '1px solid var(--color-secondary-container)' }}>
                  Sign In
                </button>
                <button onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  className="w-full text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg"
                  style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)' }}>
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 z-40 flex justify-around items-center"
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-surface-container-high)' }}>
        {navItems.map((item, i) => (
          <NavLink key={item.to} to={item.to} end={i === 0}
            className="flex flex-col items-center gap-0.5"
            style={({ isActive }) => ({ color: isActive ? 'var(--color-primary)' : 'var(--color-outline)' })}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
