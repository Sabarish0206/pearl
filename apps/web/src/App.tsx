import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { fetchCurrentUser } from './api/auth.api';
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import Dashboard from './features/dashboard/Dashboard';
import StudentProfile from './features/student/StudentProfile';
import ResumePage from './features/resume/ResumePage';
import ResumeUploadDemo from './features/demo/ResumeUploadDemo';
import JobRequirementForm from './features/dashboard/JobRequirementForm';
import JobListings from './features/dashboard/JobListings';
import CandidateShortlist from './features/dashboard/CandidateShortlist';
import { NotFoundPage, UnauthorizedPage, ServerErrorPage } from './pages/ErrorPages';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const { setCurrentUser, setIsLoading } = useAuthStore();

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
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Demo Route */}
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
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ResumePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Recruiter/Faculty/Admin */}
      <Route
        path="/recruiter/jobs/new"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <JobRequirementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <JobListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:jobId/candidates"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <CandidateShortlist />
          </ProtectedRoute>
        }
      />

      {/* Alias for recruiter analytics → dashboard */}
      <Route
        path="/recruiter/analytics"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
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

