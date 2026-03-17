import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import PortalLayout from '../../components/PortalLayout';
import { getRoleLabel, getUserDisplayName } from '../../utils/userDisplay';
import './Dashboard.css';

interface DashboardCard {
  icon: string;
  title: string;
  description: string;
  path: string | null;
  comingSoon?: boolean;
}

const STUDENT_CARDS: DashboardCard[] = [
  {
    icon: '📄',
    title: 'My Resume',
    description: 'Upload, parse, and manage your resume for placement.',
    path: '/resume',
  },
  {
    icon: '👤',
    title: 'Student Profile',
    description: 'View and edit your academic profile details.',
    path: null,
    comingSoon: true,
  },
  {
    icon: '💼',
    title: 'Jobs Registered',
    description: 'Track the job openings you have registered for.',
    path: null,
    comingSoon: true,
  },
];

const ADMIN_CARDS: DashboardCard[] = [
  {
    icon: '📊',
    title: 'Placement Analytics',
    description: 'View placement statistics and insights.',
    path: null,
    comingSoon: true,
  },
  {
    icon: '📋',
    title: 'Job Listings',
    description: 'Manage and post job openings for students.',
    path: null,
    comingSoon: true,
  },
  {
    icon: '🎓',
    title: 'All Students',
    description: 'Browse the full student directory.',
    path: null,
    comingSoon: true,
  },
  {
    icon: '✅',
    title: 'Shortlists',
    description: 'Review and manage candidate shortlists.',
    path: null,
    comingSoon: true,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'STUDENT';
  const cards = isStudent ? STUDENT_CARDS : ADMIN_CARDS;
  const userName = getUserDisplayName(currentUser);
  const roleLabel = getRoleLabel(currentUser.role);

  const handleCardClick = (card: DashboardCard) => {
    if (card.path) {
      navigate(card.path);
    }
  };

  return (
    <PortalLayout title="Dashboard">
      <section className="dashboard-card welcome-card">
        <div className="card-header">
          <h2>Welcome, {userName}</h2>
          <span className="role-badge">{roleLabel}</span>
        </div>
        <p className="card-subtitle">
          {isStudent
            ? 'Access your placement resources from the cards below.'
            : 'Manage placement activities from the cards below.'}
        </p>
      </section>

      <div className="dashboard-cards-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`feature-card${card.path ? ' feature-card--active' : ' feature-card--disabled'}`}
            onClick={() => handleCardClick(card)}
            role={card.path ? 'button' : undefined}
            tabIndex={card.path ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(card);
              }
            }}
          >
            <div className="feature-card__icon">{card.icon}</div>
            <div className="feature-card__body">
              <h3 className="feature-card__title">{card.title}</h3>
              <p className="feature-card__description">{card.description}</p>
            </div>
            {card.comingSoon && (
              <span className="feature-card__badge">Coming Soon</span>
            )}
            {card.path && (
              <span className="feature-card__arrow">→</span>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
