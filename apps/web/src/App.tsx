import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { fetchCurrentUser } from './api/auth.api';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ResumeUploadDemo from './features/demo/ResumeUploadDemo';
import ResumePage from './features/resume/ResumePage';
import JobParsePage from './features/jobs/JobParsePage';
import JobVerifyPage from './features/jobs/JobVerifyPage';
import TalentDirectoryPage from './features/admin/talent-directory/TalentDirectoryPage';
import DriveDashboardPage from './features/admin/drive-dashboard/DriveDashboardPage';
import JobsListPage from './features/admin/jobs-list/JobsListPage';
import StudentJobsPage from './features/student/jobs/StudentJobsPage';
import StudentApplicationsPage from './features/student/applications/StudentApplicationsPage';
import StudentProfilePage from './features/student/profile/StudentProfilePage';
import AdminProfilePage from './features/admin/profile/AdminProfilePage';
import DashboardPage from './features/dashboard/DashboardPage';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isLoading, setCurrentUser, setIsLoading } =
    useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    bootstrapAuth();
  }, [setCurrentUser, setIsLoading]);

  // Avoid rendering public routes (like /login) before we know session state.
  if (isLoading) {
    return (
      <Box
        role="status"
        aria-live="polite"
        aria-label="Loading"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage />
          )
        }
      />
      <Route path="/demo/resume-upload" element={<ResumeUploadDemo />} />

      <Route
        path="/resume"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ResumePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/jobs"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentJobsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/applications"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentApplicationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FACULTY"]}>
            <JobsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs/new"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FACULTY"]}>
            <JobParsePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs/:id/verify"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FACULTY"]}>
            <JobVerifyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FACULTY"]}>
            <DriveDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/talent-directory"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FACULTY"]}>
            <TalentDirectoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
            <AdminProfilePage />
          </ProtectedRoute>
        }
      />

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
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />

      <Route
        path="*"
        element={
          <div className="error-page">
            <h1>404</h1>
            <p>Page not found.</p>
            <Link to="/dashboard">Go back to Dashboard</Link>
          </div>
        }
      />

      <Route
        path="*"
        element={
          <div className="error-page">
            <h1>404</h1>
            <p>Page not found.</p>
            <Link to="/dashboard">Go back to Dashboard</Link>
          </div>
        }
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
