import { Paper, Skeleton, Typography } from '@mui/material';

export interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  isLoading: boolean;
}

export default function SummaryCard({
  label,
  value,
  color,
  isLoading,
}: SummaryCardProps) {
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
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color, mt: 0.5, lineHeight: 1.2 }}
          >
            {value}
          </Typography>
        </>
      )}
    </Paper>
  );
}
