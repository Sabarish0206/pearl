import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile', roles: ['STUDENT'] },
    { label: 'Resume', icon: <DescriptionIcon />, path: '/resume', roles: ['STUDENT'] },
    { label: 'Jobs', icon: <TrackChangesIcon />, path: '/jobs', roles: ['STUDENT'] },
    { label: 'Applications', icon: <EditNoteIcon />, path: '/applications', roles: ['STUDENT'] },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(currentUser?.role || '')
  );

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">P</div>
            <span>Pearl</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <button
              key={item.path}
              className="nav-item"
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="footer-text">Pearl v1.0</p>
        </div>
      </aside>
    </>
  );
}
