import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getEligibleJobs } from '../../../api/studentJobs.api';
import type { EligibleJob } from '@pearl/common';
import StudentJobCard from './components/StudentJobCard';
import adminTheme from '../../admin/shared/adminTheme';

// ─── Student Jobs Page ────────────────────────────────────────────────────────

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<EligibleJob[]>([]);
  const [isPlaced, setIsPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getEligibleJobs();
      setIsPlaced(data.isPlaced);
      setJobs(data.jobs);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load placement drives.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  // ─── Derived Data (Client-Side Filtering) ──────────────────────────────────

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      job.companyName.toLowerCase().includes(query) ||
      job.jobRole.toLowerCase().includes(query)
    );
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
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
          <WorkIcon sx={{ color: 'primary.main', fontSize: 24, flexShrink: 0 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
            Placement Drives
          </Typography>
          {!isLoading && !isPlaced && (
            <Chip
              label={`${jobs.length} eligible`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>

        {/* ── Page Body ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >

          {/* ── Error State ─────────────────────────────────────────────────── */}
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
              <Button variant="outlined" onClick={() => void fetchJobs()}>
                Retry
              </Button>
            </Paper>
          )}

          {!loadError && (
            <>
              {/* ── Search / Filter Bar ───────────────────────────────────── */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search by Company Name or Role…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading || isPlaced}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Paper>

              {/* ── Placed State ──────────────────────────────────────────── */}
              {!isLoading && isPlaced && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 4, sm: 6 },
                    border: '1px solid',
                    borderColor: 'success.dark',
                    borderRadius: 3,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 56, color: 'success.main' }} />
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    Congratulations!
                  </Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
                    Congratulations on your placement! According to college policy, you are not
                    eligible for further drives.
                  </Typography>
                </Paper>
              )}

              {/* ── Loading Skeletons ─────────────────────────────────────── */}
              {isLoading && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={220}
                      sx={{ borderRadius: 3 }}
                    />
                  ))}
                </Box>
              )}

              {/* ── Empty State (no eligible drives) ─────────────────────── */}
              {!isLoading && !isPlaced && filteredJobs.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 4, sm: 8 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <WorkIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary">
                    {searchQuery
                      ? `No drives found matching "${searchQuery}".`
                      : 'There are currently no active drives matching your academic profile.'}
                  </Typography>
                  {searchQuery && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </Paper>
              )}

              {/* ── Job Cards Grid ────────────────────────────────────────── */}
              {!isLoading && !isPlaced && filteredJobs.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {filteredJobs.map((job) => (
                    <StudentJobCard
                      key={job.id}
                      job={job}
                      onApplySuccess={() => void fetchJobs()}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
