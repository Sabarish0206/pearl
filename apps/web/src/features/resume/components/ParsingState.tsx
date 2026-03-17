import { Box, Typography, CircularProgress } from '@mui/material';
import { SkeletonLoader } from './SkeletonLoader';

export function ParsingState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '3rem 1rem',
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: '#6366f1',
        }}
      />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: '#f1f5f9',
        }}
      >
        Parsing Your Resume
      </Typography>
      <Typography
        sx={{
          color: '#64748b',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}
      >
        Our AI is analyzing your resume. This may take a few seconds...
      </Typography>
      <SkeletonLoader />
    </Box>
  );
}
