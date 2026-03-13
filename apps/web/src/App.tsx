import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { fetchCurrentUser } from './api/auth.api';
import './App.css';

const queryClient = new QueryClient();

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
            <div>
              <h1>Dashboard</h1>
              <p>Welcome to Pearl! 🚀</p>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div>
            <h1>403 — Access Denied</h1>
            <p>You do not have permission to view this page.</p>
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
