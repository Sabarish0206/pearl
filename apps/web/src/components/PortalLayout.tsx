import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { logoutUser } from '../api/auth.api';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import './PortalLayout.css';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const MOBILE_BREAKPOINT = 768;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'My Profile', icon: <PersonIcon />, path: '/profile', roles: ['STUDENT'] },
  { label: 'My Resume', icon: <DescriptionIcon />, path: '/resume', roles: ['STUDENT'] },
  { label: 'Analytics', icon: <BarChartIcon />, path: '/recruiter/analytics', roles: ['FACULTY', 'ADMIN'] },
  { label: 'Post a Job', icon: <AddBoxIcon />, path: '/recruiter/jobs/new', roles: ['FACULTY', 'ADMIN'] },
  { label: 'Job Listings', icon: <WorkIcon />, path: '/recruiter/jobs', roles: ['FACULTY', 'ADMIN'] },
  { label: 'All Students', icon: <PeopleIcon />, path: '/recruiter/students', roles: ['FACULTY', 'ADMIN'] },
  { label: 'Shortlists', icon: <ListAltIcon />, path: '/recruiter/shortlists', roles: ['FACULTY', 'ADMIN'] },
];

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, clearCurrentUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= MOBILE_BREAKPOINT;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      clearCurrentUser();
      navigate('/login');
    } catch {
      setIsLoggingOut(false);
    }
  };

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(currentUser?.role ?? '')
  );

  const currentPath = pathname;

  return (
    <div className="portal-container">
      {isMobile && sidebarOpen && (
        <div className="portal-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="portal-sidebar-header">
          <div
            className="portal-logo"
            onClick={() => navigate('/dashboard')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate('/dashboard');
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="portal-logo-icon">P</div>
            <span className="portal-logo-text">Pearl</span>
          </div>
        </div>

        <nav className="portal-nav">
          {filteredNav.map((item) => (
            <button
              key={item.path}
              className={`portal-nav-item ${currentPath.startsWith(item.path) && item.path !== '/dashboard' ? 'active' : currentPath === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
            >
              <span className="portal-nav-icon">{item.icon}</span>
              <span className="portal-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="portal-sidebar-footer">
          <div className="portal-user-pill">
            <div className="portal-avatar">{currentUser?.email?.charAt(0).toUpperCase()}</div>
            <div className="portal-user-info">
              <p className="portal-user-name">{currentUser?.email?.split('@')[0]}</p>
              <p className="portal-user-role">{currentUser?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={`portal-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="portal-header">
          <div className="portal-header-left">
            <button className="portal-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
              <MenuIcon />
            </button>
            {title && <h1 className="portal-page-title">{title}</h1>}
          </div>
          <div className="portal-header-right">
            <span className="portal-header-email">{currentUser?.email}</span>
            <button className="portal-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </button>
            <button className="portal-icon-btn portal-logout-btn" onClick={handleLogout} disabled={isLoggingOut} title="Sign out">
              {isLoggingOut ? '…' : <LogoutIcon fontSize="small" />}
            </button>
          </div>
        </header>
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
