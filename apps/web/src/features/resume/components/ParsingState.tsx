import { Box, CircularProgress, Typography } from '@mui/material';
import SkeletonLoader from './SkeletonLoader';

export default function ParsingState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress color="primary" size={48} />
      <Typography variant="h6" fontWeight={600} color="text.primary">
        Parsing Your Resume
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Our AI is analyzing your resume. This may take a few seconds...
      </Typography>
      <Box sx={{ width: '100%', mt: 2 }}>
        <SkeletonLoader />
      </Box>
    </Box>
  );
}
