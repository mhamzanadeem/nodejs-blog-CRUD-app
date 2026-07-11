import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const CreateBlogPage = lazy(() => import('./pages/CreateBlogPage'));
const EditBlogPage = lazy(() => import('./pages/EditBlogPage'));
const BlogDetailsPage = lazy(() => import('./pages/BlogDetailsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/blog/:id" element={<BlogDetailsPage />} />
        <Route path="/create" element={<ProtectedRoute><CreateBlogPage /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditBlogPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
