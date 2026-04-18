import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OwnersPage from './pages/owners/OwnersPage';
import OwnerDetailPage from './pages/owners/OwnerDetailPage';
import { logout } from './store/slices/authSlice';

const Placeholder = ({ title }) => (
  <div className="container py-4">
    <p className="text-muted">{title} — coming soon</p>
  </div>
);

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = () => dispatch(logout());
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated routes — all roles */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/owners/:id" element={<OwnerDetailPage />} />
            <Route path="/pets" element={<Placeholder title="Pets" />} />
            <Route path="/pets/:id" element={<Placeholder title="Pet Details" />} />
            <Route path="/pets/:id/history" element={<Placeholder title="Pet History" />} />
          </Route>
        </Route>

        {/* Admin + Vet only */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Veterinarian']} />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/visits" element={<Placeholder title="Visits" />} />
            <Route path="/visits/:id" element={<Placeholder title="Visit Details" />} />
          </Route>
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/admin/veterinarians" element={<Placeholder title="Admin Panel" />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
