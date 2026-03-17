import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import PortalLayout from '../../components/PortalLayout';
import './Dashboard.css';

interface DashboardLink {
  label: string;
  path: string;
}

const STUDENT_LINKS: DashboardLink[] = [
  { label: 'My Profile', path: '/profile' },
  { label: 'My Resume', path: '/resume' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Applications', path: '/applications' },
  { label: 'Settings', path: '/settings' },
];

const RECRUITER_LINKS: DashboardLink[] = [
  { label: 'Analytics', path: '/recruiter/analytics' },
  { label: 'Post a Job', path: '/recruiter/jobs/new' },
  { label: 'Job Listings', path: '/recruiter/jobs' },
  { label: 'All Students', path: '/recruiter/students' },
  { label: 'Shortlists', path: '/recruiter/shortlists' },
  { label: 'Settings', path: '/settings' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'STUDENT';
  const links = isStudent ? STUDENT_LINKS : RECRUITER_LINKS;
  const userName = currentUser.email.split('@')[0];
  const roleLabel = isStudent ? 'Student' : 'Recruiter';

  return (
    <PortalLayout title="Dashboard">
      <section className="dashboard-card welcome-card">
        <div className="card-header">
          <h2>Welcome, {userName}</h2>
          <span className="role-badge">{roleLabel}</span>
        </div>
        <p className="card-subtitle">
          Use the links below to navigate through the core dashboard sections.
        </p>
      </section>

      <section className="dashboard-card">
        <h3>Quick Navigation</h3>
        <div className="actions-grid">
          {links.map((link) => (
            <button
              key={link.path}
              className="action-btn"
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </section>
    </PortalLayout>
  );
}
