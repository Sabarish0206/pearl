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
import PersonIcon from '@mui/icons-material/Person';
import type { StudentProfileData } from '@pearl/common';
import { getStudentProfile } from '../../../api/profile.api';
import adminTheme from '../../admin/shared/adminTheme';

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function formatNullableValue(value: number | null): string {
  return value === null ? '—' : String(value);
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getStudentProfile();
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

  const isPlaced = profile?.placementStatus === 'PLACED';

  return (
    <ThemeProvider theme={adminTheme}>
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
          <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Student Profile
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          {isLoading && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
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
                        {profile.firstName} {profile.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={profile.placementStatus}
                      color={isPlaced ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoPanel title="Student Details">
                    <MetricBlock label="Register Number" value={profile.registerNumber} />
                    <MetricBlock label="Department" value={profile.department} />
                    <MetricBlock label="Batch Year" value={String(profile.batchYear)} />
                  </InfoPanel>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoPanel title="Academic Performance">
                    <MetricBlock label="CGPA" value={formatNullableValue(profile.cgpa)} />
                    <MetricBlock label="Active Arrears" value={formatNullableValue(profile.activeArrears)} />
                    <MetricBlock
                      label="History of Arrears"
                      value={formatNullableValue(profile.historyOfArrears)}
                    />
                  </InfoPanel>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoPanel title="Prior Academic Scores">
                    <MetricBlock label="10th Mark" value={formatNullableValue(profile.tenthMark)} />
                    <MetricBlock label="12th Mark" value={formatNullableValue(profile.twelfthMark)} />
                  </InfoPanel>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
