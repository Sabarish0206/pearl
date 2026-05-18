import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import { getAdminJobs } from '../../../api/jobs.api';
import type { JobListItem } from '@pearl/common';
import JobCard from './components/JobCard';
import { TAB_OPTIONS } from './components/types';
import type { JobStatus, JobStatusFilter } from './components/types';
import { currentTheme } from '../../../theme/theme';

// ─── Jobs List Page ────────────────────────────────────────────────────────────

export default function JobsListPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<JobStatusFilter>('ALL');

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminJobs();
      setJobs(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load drives.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  // ─── Derived Data ───────────────────────────────────────────────────────────

  const filteredJobs =
    activeTab === 'ALL' ? jobs : jobs.filter((j) => j.status === activeTab);

  const countByStatus = (status: JobStatus) =>
    jobs.filter((j) => j.status === status).length;

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleCardClick = (job: JobListItem) => {
    if (job.status === 'DRAFT') {
      navigate(`/admin/jobs/${job.id}/verify`);
    } else {
      navigate(`/admin/jobs/${job.id}`);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={currentTheme}>
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
            My Drives
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => navigate('/admin/jobs/new')}
            sx={{ fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            New Drive
          </Button>
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

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          {!loadError && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              {/* Status filter tabs */}
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_e, val: JobStatusFilter) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  textColor="primary"
                  indicatorColor="primary"
                >
                  {TAB_OPTIONS.map((tab) => {
                    const count =
                      tab.value === 'ALL'
                        ? jobs.length
                        : countByStatus(tab.value as JobStatus);
                    return (
                      <Tab
                        key={tab.value}
                        value={tab.value}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            {tab.label}
                            {!isLoading && (
                              <Chip
                                label={count}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.7rem',
                                  bgcolor:
                                    activeTab === tab.value
                                      ? 'primary.main'
                                      : 'rgba(255,255,255,0.08)',
                                  color:
                                    activeTab === tab.value ? '#fff' : 'text.secondary',
                                  fontWeight: 700,
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                    );
                  })}
                </Tabs>
              </Box>

              {/* Cards / Skeletons / Empty */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {isLoading ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                      gap: 2,
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
                    ))}
                  </Box>
                ) : filteredJobs.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography color="text.secondary">
                      {activeTab === 'ALL'
                        ? 'No drives created yet. Start by creating a new drive.'
                        : `No ${activeTab.toLowerCase()} drives found.`}
                    </Typography>
                    {activeTab === 'ALL' && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/admin/jobs/new')}
                      >
                        Create New Drive
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                      gap: 2,
                    }}
                  >
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} onClick={() => handleCardClick(job)} />
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
