import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

export default function JobParsingState() {
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
        AI is Extracting Job Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Our AI is analyzing the job description. This may take a few seconds...
      </Typography>
      <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Skeleton variant="rounded" height={24} width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Skeleton variant="rounded" height={24} width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Skeleton variant="rounded" height={24} width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Skeleton variant="rounded" height={24} width="50%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
      </Box>
    </Box>
  );
}
