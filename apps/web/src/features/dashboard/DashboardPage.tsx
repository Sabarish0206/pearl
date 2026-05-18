import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import { useAuthStore } from '../../stores/authStore';
import { logoutUser } from '../../api/auth.api';
import adminTheme from '../admin/shared/adminTheme';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
}

// ─── Role Configs ──────────────────────────────────────────────────────────────

const STUDENT_CARDS: NavCard[] = [
  {
    icon: <WorkIcon sx={{ fontSize: 32 }} />,
    title: 'Browse Drives',
    description: 'Explore active placement drives and apply to companies hiring on campus.',
    path: '/student/jobs',
    color: '#6366f1',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
    title: 'My Applications',
    description: 'Track your application status and follow your progress through the ATS pipeline.',
    path: '/student/applications',
    color: '#06b6d4',
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
    title: 'My Resume',
    description: 'Upload and manage your resume. Let AI parse and verify your skills automatically.',
    path: '/resume',
    color: '#22c55e',
  },
  {
    icon: <PersonIcon sx={{ fontSize: 32 }} />,
    title: 'My Profile',
    description: 'Review your academic profile and placement readiness status.',
    path: '/student/profile',
    color: '#a855f7',
  },
];

const ADMIN_CARDS: NavCard[] = [
  {
    icon: <WorkIcon sx={{ fontSize: 32 }} />,
    title: 'Job Drives',
    description: 'View and manage all placement drives. Monitor application pipelines and statuses.',
    path: '/admin/jobs',
    color: '#6366f1',
  },
  {
    icon: <AddIcon sx={{ fontSize: 32 }} />,
    title: 'Create Drive',
    description: 'Post a new job drive by uploading a JD or entering details directly.',
    path: '/admin/jobs/new',
    color: '#f59e0b',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
    title: 'Talent Directory',
    description: 'Browse and filter the student talent pool by skills, department, CGPA and more.',
    path: '/admin/talent-directory',
    color: '#06b6d4',
  },
  {
    icon: <PersonIcon sx={{ fontSize: 32 }} />,
    title: 'My Profile',
    description: 'View your faculty profile and placement drive contribution metrics.',
    path: '/admin/profile',
    color: '#a855f7',
  },
];

const FACULTY_CARDS: NavCard[] = [
  {
    icon: <WorkIcon sx={{ fontSize: 32 }} />,
    title: 'Job Drives',
    description: 'View and manage placement drives. Monitor pipelines and shortlisting progress.',
    path: '/admin/jobs',
    color: '#6366f1',
  },
  {
    icon: <AddIcon sx={{ fontSize: 32 }} />,
    title: 'Create Drive',
    description: 'Post a new job drive by uploading a job description or entering details manually.',
    path: '/admin/jobs/new',
    color: '#f59e0b',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
    title: 'Talent Directory',
    description: 'Explore the student talent pool. Filter by skills, department, CGPA and placement status.',
    path: '/admin/talent-directory',
    color: '#06b6d4',
  },
  {
    icon: <PersonIcon sx={{ fontSize: 32 }} />,
    title: 'My Profile',
    description: 'View your faculty profile and placement drive contribution metrics.',
    path: '/admin/profile',
    color: '#a855f7',
  },
];

function getCardsForRole(role: string): NavCard[] {
  switch (role) {
    case 'STUDENT':
      return STUDENT_CARDS;
    case 'ADMIN':
      return ADMIN_CARDS;
    case 'FACULTY':
      return FACULTY_CARDS;
    default:
      return [];
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'STUDENT':
      return 'Student';
    case 'ADMIN':
      return 'Administrator';
    case 'FACULTY':
      return 'Faculty';
    default:
      return role;
  }
}

function getRoleSubtitle(role: string): string {
  switch (role) {
    case 'STUDENT':
      return 'Use the links below to browse drives, track your applications, or manage your resume.';
    case 'ADMIN':
      return 'Manage placement drives, review applications, and explore the student talent pool.';
    case 'FACULTY':
      return 'Coordinate placement drives, review applications, and browse the student talent pool.';
    default:
      return 'Select a section below to get started.';
  }
}

function getRoleIcon(role: string): React.ReactNode {
  switch (role) {
    case 'STUDENT':
      return <SchoolIcon sx={{ fontSize: 18 }} />;
    case 'ADMIN':
      return <DashboardIcon sx={{ fontSize: 18 }} />;
    case 'FACULTY':
      return <SchoolIcon sx={{ fontSize: 18 }} />;
    default:
      return <DashboardIcon sx={{ fontSize: 18 }} />;
  }
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, clearCurrentUser } = useAuthStore();

  const role = currentUser?.role ?? '';
  const cards = getCardsForRole(role);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors — clear state and redirect regardless
    }
    clearCurrentUser();
    navigate('/login');
  };

  // Show nothing while user data is not yet available (ProtectedRoute handles redirect)
  if (!currentUser) {
    return null;
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* ── Top Bar ────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <DashboardIcon sx={{ color: 'primary.main', fontSize: 24, flexShrink: 0 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={() => void handleLogout()}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.secondary', color: 'text.primary' },
            }}
          >
            Sign out
          </Button>
        </Box>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, sm: 4 }, maxWidth: 1100, mx: 'auto' }}>

          {/* Welcome Section */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Welcome back
              </Typography>
              <Chip
                icon={getRoleIcon(role) as React.ReactElement}
                label={getRoleLabel(role)}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: '#fff',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {getRoleSubtitle(role)}
            </Typography>
          </Box>

          {/* Navigation Cards Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {cards.map((card) => (
              <Card
                key={card.path}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: card.color,
                    boxShadow: `0 0 0 1px ${card.color}40`,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(card.path)}
                  sx={{ height: '100%', p: 0 }}
                >
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        bgcolor: `${card.color}1a`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                        mb: 2,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
