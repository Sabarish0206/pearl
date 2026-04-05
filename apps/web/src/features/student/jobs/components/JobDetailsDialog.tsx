import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { EligibleJob } from '@pearl/common';
import { applyToJob } from '../../../../api/studentJobs.api';

// ─── Props ────────────────────────────────────────────────────────────────────

interface JobDetailsDialogProps {
  job: EligibleJob;
  open: boolean;
  onClose: () => void;
  onApplySuccess: (jobId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDeadline = (isoString: string | null): string => {
  if (!isoString) return 'No deadline set';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobDetailsDialog({
  job,
  open,
  onClose,
  onApplySuccess,
}: JobDetailsDialogProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const hasApplied = job.applications.length > 0;
  const responsibilities = job.parsedData?.unstructuredData?.responsibilities ?? [];
  const perks = job.parsedData?.unstructuredData?.perks ?? [];

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const result = await applyToJob(job.id);
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      onApplySuccess(job.id);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to apply. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
          },
        }}
      >
        {/* ── Dialog Title ─────────────────────────────────────────────────── */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {job.companyName}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
            >
              <WorkIcon fontSize="small" />
              {job.jobRole}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: 'divider' }} />

        {/* ── Dialog Content ───────────────────────────────────────────────── */}
        <DialogContent sx={{ pt: 2 }}>
          {/* Quick info chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {job.ctc ? (
              <Chip label={`CTC: ${job.ctc}`} color="success" size="small" sx={{ fontWeight: 700 }} />
            ) : (
              <Chip label="CTC: Not disclosed" size="small" sx={{ fontWeight: 600, opacity: 0.7 }} />
            )}
            <Chip
              label={`Deadline: ${formatDeadline(job.applicationDeadline)}`}
              size="small"
              icon={<EventIcon fontSize="small" />}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {job.allowedDepartments.map((dept) => (
              <Chip key={dept} label={dept} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
            ))}
          </Box>

          {/* Required Skills */}
          {job.requiredSkills.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                REQUIRED SKILLS
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {job.requiredSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                RESPONSIBILITIES
              </Typography>
              <List dense disablePadding>
                {responsibilities.map((item, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={`• ${item}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Perks */}
          {perks.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                PERKS &amp; BENEFITS
              </Typography>
              <List dense disablePadding>
                {perks.map((item, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={`• ${item}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Fallback when no structured data */}
          {responsibilities.length === 0 && perks.length === 0 && job.requiredSkills.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Detailed job description is not available for this drive.
            </Typography>
          )}
        </DialogContent>

        <Divider sx={{ borderColor: 'divider' }} />

        {/* ── Dialog Actions ───────────────────────────────────────────────── */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Close
          </Button>
          {hasApplied ? (
            <Button
              variant="contained"
              color="success"
              disabled
              startIcon={<CheckCircleIcon />}
              sx={{ borderRadius: 2, fontWeight: 700, minWidth: 140 }}
            >
              Applied
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => void handleApply()}
              disabled={isApplying}
              sx={{ borderRadius: 2, fontWeight: 700, minWidth: 140 }}
              startIcon={isApplying ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isApplying ? 'Applying…' : 'Apply Now'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Success / Error Snackbar ─────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
