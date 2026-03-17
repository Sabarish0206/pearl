import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { fetchCurrentUser } from './api/auth.api';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import Dashboard from './features/dashboard/Dashboard';
import ResumePage from './features/resume/ResumePage';
import ResumeUploadDemo from './features/demo/ResumeUploadDemo';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, setCurrentUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        // User not authenticated
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAuth();
  }, [setCurrentUser, setIsLoading]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/demo/resume-upload" element={<ResumeUploadDemo />} />

      {/* Protected Routes - Dashboard (role-aware) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Student Only */}
      <Route
        path="/resume"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ResumePage />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Dynamically load theme store for its side effects in a browser-only effect
    import('./stores/themeStore').catch(() => {
      // Optional: handle or log theme initialization errors
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
