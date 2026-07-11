import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BlogProvider } from './context/BlogContext';
import Navbar from './components/common/Navbar';
import ServerStatus from './components/common/ServerStatus';
import AppRoutes from './routes';

const SidebarContext = createContext(null);
export const useSidebar = () => useContext(SidebarContext);

const AUTH_PAGES = ['/signin', '/signup'];

function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const isAuthPage = AUTH_PAGES.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <main style={{
          flex: 1,
          marginLeft: isDesktop ? (sidebarOpen ? 240 : 64) : 0,
          minHeight: '100vh',
          paddingBottom: 80,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
          className="md:pb-0">
          <header className="hidden md:flex sticky top-0 z-40 justify-end items-center px-12 h-16"
            style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-surface-container-high)' }}>
            <div className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ background: 'var(--color-surface-container-low)', border: '1px solid rgba(196,198,207,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-outline)' }}>search</span>
              <input placeholder="Search stories, authors…" className="bg-transparent outline-none text-sm w-48"
                style={{ color: 'var(--color-on-surface)' }} />
            </div>
          </header>
          <AppRoutes />
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BlogProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                borderRadius: 8,
                background: 'var(--color-surface-container-lowest)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-surface-container-high)',
                boxShadow: '0 4px 20px rgba(0,6,19,0.08)',
              },
            }}
          />
          <ServerStatus />
          <Layout />
        </BlogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
