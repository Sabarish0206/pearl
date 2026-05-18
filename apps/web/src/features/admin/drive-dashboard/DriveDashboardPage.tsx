import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BusinessIcon from '@mui/icons-material/Business';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {
  getJobApplications,
  updateApplicationStatus,
  exportJobApplications,
} from '../../../api/ats.api';
import { updateJobStatus } from '../../../api/jobs.api';
import type {
  ApplicationRecord,
  ApplicationStatus,
  ApplicationsJobInfo,
  JobStatus,
} from '@pearl/common';
import SummaryCard from './components/SummaryCard';
import OfferedConfirmDialog from './components/OfferedConfirmDialog';
import EmptyState from './components/EmptyState';
import ApplicationsTable from './components/ApplicationsTable';
import { TAB_OPTIONS } from './components/types';
import type { TabValue } from './components/types';

// ─── Theme ────────────────────────────────────────────────────────────────────
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#06b6d4' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#0f172a', paper: '#111827' },
    divider: '#1e293b',
    text: { primary: '#e2e8f0', secondary: '#94a3b8', disabled: '#475569' },
  },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, minHeight: 44 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0f172a',
          fontWeight: 700,
          color: '#94a3b8',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid #1e293b',
        },
        body: {
          borderBottom: '1px solid #1e293b',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

// ─── Drive status config ──────────────────────────────────────────────────────

type CloseableStatus = 'CLOSED' | 'COMPLETED' | 'CANCELLED';
const MANAGEABLE_DRIVE_STATUSES: JobStatus[] = ['ACTIVE', 'CLOSED'];

const DRIVE_STATUS_OPTIONS: { value: CloseableStatus; label: string; description: string; color: string }[] = [
  { value: 'CLOSED', label: 'Close Drive', description: 'Stop accepting new applications', color: '#06b6d4' },
  { value: 'COMPLETED', label: 'Mark Completed', description: 'Drive finished; candidates placed', color: '#22c55e' },
  { value: 'CANCELLED', label: 'Cancel Drive', description: 'Permanently cancel this drive', color: '#ef4444' },
];

const JOB_STATUS_CHIP_COLOR: Record<JobStatus, string> = {
  DRAFT: '#f59e0b',
  ACTIVE: '#22c55e',
  CLOSED: '#06b6d4',
  COMPLETED: '#94a3b8',
  CANCELLED: '#ef4444',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function countByStatus(
  applications: ApplicationRecord[],
  status: ApplicationStatus,
): number {
  return applications.filter((a) => a.status === status).length;
}

// ─── Drive Dashboard Page ─────────────────────────────────────────────────────

export default function DriveDashboardPage() {
  const { id: jobId } = useParams<{ id: string }>();

  // Data state
  const [jobInfo, setJobInfo] = useState<ApplicationsJobInfo | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Drive status dialog state
  const [isDriveStatusDialogOpen, setIsDriveStatusDialogOpen] = useState(false);
  const [pendingDriveStatus, setPendingDriveStatus] = useState<CloseableStatus | null>(null);
  const [isUpdatingDriveStatus, setIsUpdatingDriveStatus] = useState(false);

  // OFFERED confirmation dialog state
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    applicationId: string;
    newStatus: ApplicationStatus;
    studentName: string;
  } | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getJobApplications(jobId);
      setJobInfo(data.job);
      setApplications(data.applications);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to load applications.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  // ─── Derived Data ───────────────────────────────────────────────────────────

  const filteredApplications =
    activeTab === 'ALL'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  const totalCount = applications.length;
  const appliedCount = countByStatus(applications, 'APPLIED');
  const shortlistedCount = countByStatus(applications, 'SHORTLISTED');
  const offeredCount = countByStatus(applications, 'OFFERED');
  const rejectedCount = countByStatus(applications, 'REJECTED');
  const shouldShowManageStatus =
    !isLoading &&
    !loadError &&
    jobInfo !== null &&
    MANAGEABLE_DRIVE_STATUSES.includes(jobInfo.status);
  const availableDriveStatusOptions = useMemo(() => {
    if (!jobInfo || !MANAGEABLE_DRIVE_STATUSES.includes(jobInfo.status)) return [];
    return DRIVE_STATUS_OPTIONS.filter((opt) => opt.value !== jobInfo.status);
  }, [jobInfo]);

  // ─── Drive Status Update ────────────────────────────────────────────────────

  const handleDriveStatusChange = async () => {
    if (!jobId || !pendingDriveStatus) return;
    setIsUpdatingDriveStatus(true);
    try {
      const updated = await updateJobStatus(jobId, pendingDriveStatus);
      setJobInfo((prev) => prev ? { ...prev, status: updated.status } : prev);
      toast.success(`Drive marked as ${updated.status}`);
      setIsDriveStatusDialogOpen(false);
      setPendingDriveStatus(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update drive status.');
    } finally {
      setIsUpdatingDriveStatus(false);
    }
  };

  // ─── Application Status Update ──────────────────────────────────────────────

  const handleStatusChange = (
    applicationId: string,
    newStatus: ApplicationStatus,
    studentName: string,
  ) => {
    if (newStatus === 'OFFERED') {
      setPendingStatusChange({ applicationId, newStatus, studentName });
      return;
    }
    void executeStatusUpdate(applicationId, newStatus);
  };

  const executeStatusUpdate = async (
    applicationId: string,
    newStatus: ApplicationStatus,
  ) => {
    setUpdatingIds((prev) => new Set(prev).add(applicationId));
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app,
        ),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update status.',
      );
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  const handleOfferedConfirm = () => {
    if (!pendingStatusChange) return;
    const { applicationId, newStatus } = pendingStatusChange;
    setPendingStatusChange(null);
    void executeStatusUpdate(applicationId, newStatus);
  };

  const handleOfferedCancel = () => {
    setPendingStatusChange(null);
  };

  // ─── Export ─────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    if (!jobId || !jobInfo) return;
    setIsExporting(true);
    try {
      await exportJobApplications(jobId, jobInfo.companyName);
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to export CSV.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <BusinessIcon sx={{ color: 'primary.main', fontSize: 24, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              {isLoading ? (
                <>
                  <Skeleton variant="text" width={200} height={22} />
                  <Skeleton variant="text" width={140} height={16} />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="text.primary"
                      lineHeight={1.2}
                      noWrap
                    >
                      {jobInfo?.companyName ?? 'Drive Dashboard'}
                    </Typography>
                    {jobInfo?.status && (
                      <Chip
                        label={jobInfo.status}
                        size="small"
                        sx={{
                          bgcolor: `${JOB_STATUS_CHIP_COLOR[jobInfo.status]}20`,
                          color: JOB_STATUS_CHIP_COLOR[jobInfo.status],
                          border: `1px solid ${JOB_STATUS_CHIP_COLOR[jobInfo.status]}40`,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {jobInfo?.jobRole ?? ''} · Placement Drive
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {shouldShowManageStatus && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<EditNoteIcon fontSize="small" />}
                onClick={() => setIsDriveStatusDialogOpen(true)}
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Manage Status
              </Button>
            )}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={
                isExporting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DownloadIcon fontSize="small" />
                )
              }
              onClick={() => void handleExport()}
              disabled={isExporting || isLoading || !!loadError}
              sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Export Pipeline (CSV)
            </Button>
          </Box>
        </Box>

        {/* ── Page Body ───────────────────────────────────────────────────── */}
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
          {/* ── Summary Cards ─────────────────────────────────────────────── */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)',
              },
              gap: 2,
            }}
          >
            <SummaryCard label="Total Applied" value={totalCount} color="#e2e8f0" isLoading={isLoading} />
            <SummaryCard label="Applied" value={appliedCount} color="#94a3b8" isLoading={isLoading} />
            <SummaryCard label="Shortlisted" value={shortlistedCount} color="#6366f1" isLoading={isLoading} />
            <SummaryCard label="Offered" value={offeredCount} color="#22c55e" isLoading={isLoading} />
            <SummaryCard label="Rejected" value={rejectedCount} color="#ef4444" isLoading={isLoading} />
          </Box>

          {/* ── Error State ───────────────────────────────────────────────── */}
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

          {/* ── Main Content ──────────────────────────────────────────────── */}
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
              {/* Pipeline Tabs */}
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_e, val: TabValue) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  textColor="primary"
                  indicatorColor="primary"
                >
                  {TAB_OPTIONS.map((tab) => {
                    const count =
                      tab.value === 'ALL'
                        ? totalCount
                        : tab.value === 'APPLIED'
                          ? appliedCount
                          : tab.value === 'SHORTLISTED'
                            ? shortlistedCount
                            : tab.value === 'OFFERED'
                              ? offeredCount
                              : rejectedCount;
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
                                    activeTab === tab.value
                                      ? '#fff'
                                      : 'text.secondary',
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

              {/* Table / Skeleton / Empty */}
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                {isLoading ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1 }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Box
                        key={i}
                        sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
                      >
                        <Skeleton variant="text" width="18%" height={20} />
                        <Skeleton variant="text" width="12%" height={20} />
                        <Skeleton variant="text" width="10%" height={20} />
                        <Skeleton variant="rounded" width="8%" height={20} />
                        <Skeleton variant="rounded" width="20%" height={20} />
                        <Skeleton variant="rounded" width="10%" height={24} />
                        <Skeleton variant="text" width="12%" height={20} />
                      </Box>
                    ))}
                  </Box>
                ) : filteredApplications.length === 0 ? (
                  <EmptyState tab={activeTab} />
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <ApplicationsTable
                      applications={filteredApplications}
                      updatingIds={updatingIds}
                      onStatusChange={handleStatusChange}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* ── OFFERED Warning Dialog ──────────────────────────────────────────── */}
      <OfferedConfirmDialog
        open={pendingStatusChange !== null}
        studentName={pendingStatusChange?.studentName ?? ''}
        onConfirm={handleOfferedConfirm}
        onCancel={handleOfferedCancel}
      />

      {/* ── Manage Drive Status Dialog ──────────────────────────────────────── */}
      <Dialog
        open={isDriveStatusDialogOpen}
        onClose={() => {
          if (!isUpdatingDriveStatus) {
            setIsDriveStatusDialogOpen(false);
            setPendingDriveStatus(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#111827', border: '1px solid #1e293b', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Manage Drive Status
        </DialogTitle>
        <Divider sx={{ borderColor: 'divider' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the new status for <strong>{jobInfo?.companyName}</strong> — {jobInfo?.jobRole}:
          </Typography>
          <MenuList sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {availableDriveStatusOptions.map((opt) => (
              <MenuItem
                key={opt.value}
                selected={pendingDriveStatus === opt.value}
                onClick={() => setPendingDriveStatus(opt.value)}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: pendingDriveStatus === opt.value ? opt.color : 'divider',
                  bgcolor: pendingDriveStatus === opt.value ? `${opt.color}15` : 'transparent',
                  '&:hover': { bgcolor: `${opt.color}10`, borderColor: opt.color },
                  transition: 'all 0.15s',
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: opt.color }}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {opt.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        </DialogContent>
        <Divider sx={{ borderColor: 'divider' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => {
              setIsDriveStatusDialogOpen(false);
              setPendingDriveStatus(null);
            }}
            disabled={isUpdatingDriveStatus}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => void handleDriveStatusChange()}
            disabled={!pendingDriveStatus || isUpdatingDriveStatus}
            startIcon={isUpdatingDriveStatus ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              fontWeight: 700,
              bgcolor: pendingDriveStatus ? DRIVE_STATUS_OPTIONS.find((o) => o.value === pendingDriveStatus)?.color : undefined,
              '&:hover': {
                bgcolor: pendingDriveStatus ? `${DRIVE_STATUS_OPTIONS.find((o) => o.value === pendingDriveStatus)?.color}cc` : undefined,
              },
            }}
          >
            {isUpdatingDriveStatus ? 'Updating…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
      />
    </ThemeProvider>
  );
}
