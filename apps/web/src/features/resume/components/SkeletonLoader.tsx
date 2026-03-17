import { Box, Skeleton } from '@mui/material';

export default function SkeletonLoader() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
          animation="wave"
        />
      ))}
    </Box>
  );
}
