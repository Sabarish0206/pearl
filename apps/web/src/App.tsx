import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { fetchCurrentUser, logoutUser } from './api/auth.api';
import './App.css';

const queryClient = new QueryClient();

function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, clearCurrentUser } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    clearCurrentUser();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div className="auth-brand-logo" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.9rem' }}>P</div>
            <span className="auth-brand-name">Pearl</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Campus Placement Platform
          </p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <div className="dashboard-card">
        <h2>Signed in as</h2>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '0.25rem' }}>
          {currentUser?.email}
        </p>
        <span className="dashboard-badge">
          {currentUser?.role}
        </span>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, setCurrentUser } = useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
    };
    bootstrapAuth();
  }, [setCurrentUser]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="error-page">
            <h1>403</h1>
            <p>You do not have permission to view this page.</p>
            <Link to="/dashboard">Go back to Dashboard</Link>
          </div>
        }
      />

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
