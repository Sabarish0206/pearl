import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import type { EligibleJob } from '@pearl/common';
import JobDetailsDialog from './JobDetailsDialog';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudentJobCardProps {
  job: EligibleJob;
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

export default function StudentJobCard({ job, onApplySuccess }: StudentJobCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasApplied = job.applications.length > 0;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: hasApplied ? 'success.dark' : 'divider',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: hasApplied ? 'success.main' : 'primary.main',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
        }}
      >
        <CardContent sx={{ flex: 1, pb: 1 }}>
          {/* Company Name */}
          <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
            {job.companyName}
          </Typography>

          {/* Job Role */}
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}
          >
            <WorkIcon fontSize="small" />
            {job.jobRole}
          </Typography>

          {/* CTC Chip */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            {job.ctc ? (
              <Chip
                label={`CTC: ${job.ctc}`}
                color="success"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.8rem' }}
              />
            ) : (
              <Chip
                label="CTC: Not disclosed"
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.7 }}
              />
            )}
            {hasApplied && (
              <Chip
                label="Applied"
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.8rem' }}
              />
            )}
          </Box>

          {/* Application Deadline */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <EventIcon fontSize="small" />
            Deadline: {formatDeadline(job.applicationDeadline)}
          </Typography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          {hasApplied ? (
            <Button
              variant="outlined"
              color="success"
              disabled
              fullWidth
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Applied
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setDialogOpen(true)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              View &amp; Apply
            </Button>
          )}
        </CardActions>
      </Card>

      <JobDetailsDialog
        job={job}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onApplySuccess={(jobId) => {
          setDialogOpen(false);
          onApplySuccess(jobId);
        }}
      />
    </>
  );
}

