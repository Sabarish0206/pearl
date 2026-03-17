import { Skeleton, Stack } from '@mui/material';

export function SkeletonLoader() {
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={80}
          sx={{
            borderRadius: '12px',
            bgcolor: '#1e293b',
          }}
          animation="wave"
        />
      ))}
    </Stack>
  );
}
