import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import ResumeSection from './ResumeSection';
import PortalLayout from '../../components/PortalLayout';
import { getRoleLabel, getUserDisplayName } from '../../utils/userDisplay';
import './StudentProfile.css';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const displayName = getUserDisplayName(currentUser);
  const roleLabel = getRoleLabel(currentUser.role);

  return (
    <PortalLayout title="My Profile">
      <div className="student-profile-content">
        {/* Profile Header */}
        <section className="profile-card profile-welcome">
          <div className="welcome-content">
            <div>
              <h2>Your Profile 👤</h2>
              <p className="email-display">{displayName}</p>
              <p className="email-display">{currentUser.email}</p>
              <span className="role-badge">{roleLabel}</span>
            </div>
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <ResumeSection />

        {/* Quick Links */}
        <section className="profile-card profile-info">
          <h3>Quick Links</h3>
          <div className="info-grid">
            <a href="/dashboard" className="info-link">
              <span className="link-icon">📊</span>
              <span>View Dashboard</span>
            </a>
            <a href="/resume" className="info-link">
              <span className="link-icon">📄</span>
              <span>Manage Resume</span>
            </a>
            <a href="/dashboard" className="info-link">
              <span className="link-icon">🎯</span>
              <span>Job Opportunities</span>
            </a>
            <a href="/dashboard" className="info-link">
              <span className="link-icon">⚙️</span>
              <span>Settings</span>
            </a>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
