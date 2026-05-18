import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useTheme, useMediaQuery } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { logoutUser } from '../../api/auth.api';
import { NAV_LINKS } from '../../config/navigation';

export const DRAWER_WIDTH = 260;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, clearCurrentUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors
    }
    clearCurrentUser();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // On mobile, close drawer after navigating
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const allowedLinks = NAV_LINKS.filter(
    (link) => currentUser && link.roles.includes(currentUser.role)
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" color="primary.main" fontWeight={700}>
          Pearl
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1, px: 2 }}>
        {allowedLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
          
          return (
            <ListItem key={link.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(link.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                  <link.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={link.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List sx={{ px: 2, pb: 2, mt: 'auto' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => void handleLogout()}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.lighter',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Sign out" 
              primaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.875rem' 
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
