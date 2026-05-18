import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Grid,
  Paper,
  Skeleton,
  ThemeProvider,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import type { AdminProfileData } from '@pearl/common';
import { getAdminProfile } from '../../../api/profile.api';
import { currentTheme } from '../../../theme/theme';

function MetricCard({
  title,
  value,
  caption,
}: {
  title: string;
  value: string | number;
  caption: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminProfile();
      setProfile(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load profile.');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
            gap: 1.25,
          }}
        >
          <AdminPanelSettingsIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Admin Profile
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          {isLoading && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {!isLoading && loadError && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <Typography color="error" sx={{ mb: 2 }}>
                {loadError}
              </Typography>
              <Button variant="outlined" onClick={() => void fetchProfile()}>
                Retry
              </Button>
            </Paper>
          )}

          {!isLoading && !loadError && profile && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="text.primary">
                        {profile.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.email}
                      </Typography>
                    </Box>
                    <Chip label={profile.designation} color="primary" sx={{ fontWeight: 700 }} />
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <MetricCard
                    title="Department"
                    value={profile.department}
                    caption="Your assigned department"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkHistoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          Drive Impact
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.15 }}>
                        {profile.jobsCreatedCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Total Job Drives Initiated
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
