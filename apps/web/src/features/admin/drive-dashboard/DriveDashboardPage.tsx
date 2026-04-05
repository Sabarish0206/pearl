import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  type SelectChangeEvent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import BusinessIcon from '@mui/icons-material/Business';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InboxIcon from '@mui/icons-material/Inbox';
import {
  getJobApplications,
  updateApplicationStatus,
  exportJobApplications,
} from '../../../api/ats.api';
import type {
  ApplicationRecord,
  ApplicationStatus,
  ApplicationsJobInfo,
} from '@pearl/common';

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
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
        },
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

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'OFFERED',
  'REJECTED',
];

type TabValue = 'ALL' | ApplicationStatus;

const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'REJECTED', label: 'Rejected' },
];

// ─── Status chip colors ────────────────────────────────────────────────────────

const STATUS_CHIP_COLOR = {
  APPLIED: 'default',
  SHORTLISTED: 'primary',
  OFFERED: 'success',
  REJECTED: 'error',
} as const;

// ─── Helper: count applications by status ─────────────────────────────────────

function countByStatus(
  applications: ApplicationRecord[],
  status: ApplicationStatus,
): number {
  return applications.filter((a) => a.status === status).length;
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  isLoading: boolean;
}

function SummaryCard({ label, value, color, isLoading }: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
      }}
    >
      {isLoading ? (
        <>
          <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto' }} />
        </>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </>
      )}
    </Paper>
  );
}

// ─── Offered Confirmation Dialog ──────────────────────────────────────────────

interface OfferedDialogProps {
  open: boolean;
  studentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function OfferedConfirmDialog({
  open,
  studentName,
  onConfirm,
  onCancel,
}: OfferedDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#111827',
          border: '1px solid #f59e0b',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 28 }} />
        <Typography variant="h6" fontWeight={700} color="warning.main">
          College Policy Warning
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary', fontSize: '0.95rem', lineHeight: 1.7 }}>
          You are about to mark <strong>{studentName}</strong> as{' '}
          <Chip label="OFFERED" color="success" size="small" sx={{ mx: 0.5, fontWeight: 700 }} />.
        </DialogContentText>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(245,158,11,0.08)',
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="warning.light" fontWeight={600} sx={{ mb: 0.5 }}>
            ⚠ Irreversible Action — College Policy Guardrail
          </Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
            Setting a student's status to <strong>OFFERED</strong> will permanently mark them as{' '}
            <strong>Placed</strong>. This will prevent the student from applying to any future
            placement drives and cannot be undone. Please confirm this is the correct decision.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ borderColor: 'divider' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          sx={{ fontWeight: 700 }}
        >
          Confirm — Mark as Offered
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabValue }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 10,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'rgba(99,102,241,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <InboxIcon sx={{ fontSize: 36, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} color="text.primary">
        No applications
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {tab === 'ALL'
          ? 'No students have applied to this drive yet.'
          : `No students in the ${tab} stage.`}
      </Typography>
    </Box>
  );
}

// ─── Applications Table ───────────────────────────────────────────────────────

interface ApplicationsTableProps {
  applications: ApplicationRecord[];
  updatingIds: Set<string>;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus, studentName: string) => void;
}

function ApplicationsTable({
  applications,
  updatingIds,
  onStatusChange,
}: ApplicationsTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
    >
      <Table sx={{ minWidth: 700 }} aria-label="applications table">
        <TableHead>
          <TableRow>
            <TableCell>Candidate</TableCell>
            <TableCell>Register No.</TableCell>
            <TableCell>Department</TableCell>
            <TableCell align="center">CGPA</TableCell>
            <TableCell>Skills</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Applied On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            const isUpdating = updatingIds.has(app.id);
            return (
              <TableRow
                key={app.id}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                  opacity: isUpdating ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Candidate */}
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {app.student.name}
                    </Typography>
                    {app.student.isPlaced && (
                      <Chip
                        label="Placed"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: '0.65rem', height: 18 }}
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Register No */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {app.student.registerNumber}
                  </Typography>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {app.student.department}
                  </Typography>
                </TableCell>

                {/* CGPA */}
                <TableCell align="center">
                  {app.student.cgpa !== null ? (
                    <Chip
                      label={app.student.cgpa?.toFixed(2) ?? '—'}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'divider', fontWeight: 600, fontSize: '0.8rem' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                  )}
                </TableCell>

                {/* Skills */}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 240 }}>
                    {app.student.skills.slice(0, 4).map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(99,102,241,0.1)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.25)',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    ))}
                    {app.student.skills.length > 4 && (
                      <Tooltip
                        title={app.student.skills.slice(4).join(', ')}
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={`+${app.student.skills.length - 4}`}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(255,255,255,0.05)' }}
                        />
                      </Tooltip>
                    )}
                    {app.student.skills.length === 0 && (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  {isUpdating ? (
                    <CircularProgress size={20} thickness={4} />
                  ) : (
                    <Select
                      value={app.status}
                      size="small"
                      onChange={(e: SelectChangeEvent) =>
                        onStatusChange(
                          app.id,
                          e.target.value as ApplicationStatus,
                          app.student.name,
                        )
                      }
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        minWidth: 130,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          py: 0.75,
                          px: 1.5,
                        },
                      }}
                      renderValue={(value) => (
                        <Chip
                          label={value}
                          size="small"
                          color={STATUS_CHIP_COLOR[value as ApplicationStatus]}
                          sx={{ fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                        />
                      )}
                    >
                      {ALL_STATUSES.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          <Chip
                            label={s}
                            size="small"
                            color={STATUS_CHIP_COLOR[s]}
                            sx={{ fontWeight: 700, fontSize: '0.75rem', mr: 1 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>

                {/* Applied On */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Drive Dashboard Page ─────────────────────────────────────────────────────

export default function DriveDashboardPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data state
  const [jobInfo, setJobInfo] = useState<ApplicationsJobInfo | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

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
      setLoadError(err instanceof Error ? err.message : 'Failed to load applications.');
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

  // ─── Status Update ──────────────────────────────────────────────────────────

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
          <Tooltip title="Back">
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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
                  <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2} noWrap>
                    {jobInfo?.companyName ?? 'Drive Dashboard'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {jobInfo?.jobRole ?? ''} · Placement Drive
                  </Typography>
                </>
              )}
            </Box>
          </Box>

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
            sx={{ fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Export Pipeline (CSV)
          </Button>
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
              {/* Tabs */}
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
      />
    </ThemeProvider>
  );
}
