import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import authReducer from '../store/slices/authSlice';

const makeStore = (authState) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

// Convenience wrappers
const LoginPage = () => <div>Login Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const ProtectedContent = () => <div>Protected Content</div>;
const AdminContent = () => <div>Admin Content</div>;

describe('ProtectedRoute', () => {
  // ── Unauthenticated ───────────────────────────────────────────────────────

  it('redirects to /login when there is no token', () => {
    const store = makeStore({ token: null, user: null });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // ── Wrong role ────────────────────────────────────────────────────────────

  it('redirects to /dashboard when the user role is not in allowedRoles', () => {
    const store = makeStore({ token: 'tok', user: { role: 'Receptionist' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects a Veterinarian away from Admin-only routes', () => {
    const store = makeStore({ token: 'tok', user: { role: 'Veterinarian' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  // ── Correct role ──────────────────────────────────────────────────────────

  it('renders the outlet when the user has the required role', () => {
    const store = makeStore({ token: 'tok', user: { role: 'Admin' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders the outlet when multiple roles are allowed and user matches', () => {
    const store = makeStore({ token: 'tok', user: { role: 'Veterinarian' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/visits']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Veterinarian']} />}>
              <Route path="/visits" element={<div>Visits Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Visits Content')).toBeInTheDocument();
  });

  // ── No role restriction ───────────────────────────────────────────────────

  it('renders the outlet when no allowedRoles are specified (any authenticated user)', () => {
    const store = makeStore({ token: 'tok', user: { role: 'Receptionist' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
