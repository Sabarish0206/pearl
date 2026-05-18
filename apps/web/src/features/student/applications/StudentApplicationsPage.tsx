import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Paper,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStatus, StudentApplicationHistory } from '@pearl/common';
import { getApplicationHistory } from '../../../api/studentApplications.api';
import { currentTheme } from '../../../theme/theme';

// ─── ATS Pipeline steps ───────────────────────────────────────────────────────

const PIPELINE_STEPS: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'OFFERED'];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
};

const JOB_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
};

const JOB_STATUS_CHIP_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  ACTIVE: 'success',
  CLOSED: 'info',
  COMPLETED: 'default',
  CANCELLED: 'error',
  DRAFT: 'warning',
};

/** Returns the activeStep index for the MUI Stepper (0-based). */
function getActiveStep(status: ApplicationStatus): number {
  if (status === 'REJECTED') return -1; // handled separately
  return PIPELINE_STEPS.indexOf(status);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ application }: { application: StudentApplicationHistory }) {
  const isRejected = application.status === 'REJECTED';
  const isOffered = application.status === 'OFFERED';
  const activeStep = getActiveStep(application.status);

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isRejected ? 'error.dark' : isOffered ? 'success.dark' : 'divider',
        borderRadius: 3,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {application.job.companyName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <WorkIcon sx={{ fontSize: 14 }} />
              {application.job.jobRole}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            {application.job.ctc && (
              <Chip
                label={`CTC: ${application.job.ctc}`}
                color="success"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
            <Chip
              label={STATUS_LABELS[application.status]}
              color={isRejected ? 'error' : isOffered ? 'success' : 'primary'}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
            <Chip
              label={`Drive: ${JOB_STATUS_LABELS[application.job.status] ?? application.job.status}`}
              color={JOB_STATUS_CHIP_COLOR[application.job.status] ?? 'default'}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>

        {/* ATS Pipeline Stepper */}
        {isRejected ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'error.dark',
              opacity: 0.85,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={700} color="error.contrastText">
              Pipeline Closed — Application Rejected
            </Typography>
          </Box>
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel>
            {PIPELINE_STEPS.map((step) => (
              <Step key={step}>
                <StepLabel>{STATUS_LABELS[step]}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Applied date */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', mt: 1.5, textAlign: 'right' }}
        >
          Applied on {formatDate(application.createdAt)}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<StudentApplicationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getApplicationHistory();
      setApplications(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load application history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

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
          <AssignmentIcon sx={{ color: 'primary.main', fontSize: 24, flexShrink: 0 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
            My Applications
          </Typography>
          {!isLoading && (
            <Chip
              label={`${applications.length} application${applications.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>

        {/* ── Page Body ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            maxWidth: 900,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
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
              <Button variant="outlined" onClick={() => void fetchApplications()}>
                Retry
              </Button>
            </Paper>
          )}

          {/* ── Loading Skeletons ─────────────────────────────────────────── */}
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: 3 }} />
            ))}

          {/* ── Empty State ──────────────────────────────────────────────── */}
          {!isLoading && !loadError && applications.length === 0 && (
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
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                You haven&apos;t applied to any drives yet.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/student/jobs')}
              >
                Browse Drives
              </Button>
            </Paper>
          )}

          {/* ── Application Cards ─────────────────────────────────────────── */}
          {!isLoading && !loadError && applications.length > 0 &&
            applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
