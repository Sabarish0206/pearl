import PortalLayout from '../../components/PortalLayout';
import './Dashboard.css';

interface ComingSoonPageProps {
  title: string;
  message?: string;
}

export default function ComingSoonPage({ title, message }: ComingSoonPageProps) {
  return (
    <PortalLayout title={title}>
      <section className="dashboard-card welcome-card">
        <div className="card-header">
          <h2>{title}</h2>
          <span className="role-badge">Coming Soon</span>
        </div>
        <p className="card-subtitle">
          {message ?? 'This section is intentionally deferred to a dedicated follow-up PR.'}
        </p>
      </section>
    </PortalLayout>
  );
}