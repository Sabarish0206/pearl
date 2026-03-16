import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  icon?: string;
}

function ErrorPage({ code, title, message, icon = '⚠️' }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-icon">{icon}</div>
        <h1 className="error-code">{code}</h1>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Page Not Found"
      message="Sorry, the page you're looking for doesn't exist. It might have been moved or deleted."
      icon="🔍"
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code={403}
      title="Access Denied"
      message="You don't have permission to access this page. Contact your administrator if you think this is a mistake."
      icon="🔒"
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="Server Error"
      message="Something went wrong on our end. Our team has been notified and is working to fix it. Please try again later."
      icon="💥"
    />
  );
}
