import { Box, Chip, Paper, Tooltip, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import type { JobListItem } from '@pearl/common';
import { STATUS_CHIP_COLOR } from './types';

interface JobCardProps {
  job: JobListItem;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const formattedDate = new Date(job.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const statusColor = STATUS_CHIP_COLOR[job.status];
  const maxDepts = 3;
  const shownDepts = job.allowedDepartments.slice(0, maxDepts);
  const extraDepts = job.allowedDepartments.length - maxDepts;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 1px #6366f1',
        },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* Header: company name + status chip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap>
            {job.companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {job.jobRole}
          </Typography>
        </Box>
        <Chip
          label={job.status}
          size="small"
          sx={{
            bgcolor: `${statusColor}20`,
            color: statusColor,
            fontWeight: 700,
            fontSize: '0.7rem',
            border: `1px solid ${statusColor}40`,
            flexShrink: 0,
          }}
        />
      </Box>

      {/* CTC + application count */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        {job.ctc && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.disabled">
              CTC:
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {job.ctc}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}
          </Typography>
        </Box>
      </Box>

      {/* Allowed departments */}
      {job.allowedDepartments.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {shownDepts.map((dept) => (
            <Chip
              key={dept}
              label={dept}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(99,102,241,0.1)',
                color: 'primary.light',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            />
          ))}
          {extraDepts > 0 && (
            <Tooltip title={job.allowedDepartments.slice(maxDepts).join(', ')}>
              <Chip
                label={`+${extraDepts}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'text.secondary',
                }}
              />
            </Tooltip>
          )}
        </Box>
      )}

      {/* Creation date */}
      <Typography variant="caption" color="text.disabled">
        Created {formattedDate}
      </Typography>
    </Paper>
  );
}
