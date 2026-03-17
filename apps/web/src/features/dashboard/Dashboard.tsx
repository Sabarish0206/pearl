import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import PortalLayout from '../../components/PortalLayout';
import { getRoleLabel, getUserDisplayName } from '../../utils/userDisplay';
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

const PLACEMENT_LINKS: DashboardLink[] = [
  { label: 'Analytics', path: '/placement/analytics' },
  { label: 'Post a Job', path: '/placement/jobs/new' },
  { label: 'Job Listings', path: '/placement/jobs' },
  { label: 'All Students', path: '/placement/students' },
  { label: 'Shortlists', path: '/placement/shortlists' },
  { label: 'Settings', path: '/settings' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'STUDENT';
  const links = isStudent ? STUDENT_LINKS : PLACEMENT_LINKS;
  const userName = getUserDisplayName(currentUser);
  const roleLabel = getRoleLabel(currentUser.role);

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
