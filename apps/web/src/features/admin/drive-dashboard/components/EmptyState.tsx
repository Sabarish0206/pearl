import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import type { TabValue } from './types';

interface EmptyStateProps {
  tab: TabValue;
}

export default function EmptyState({ tab }: EmptyStateProps) {
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
