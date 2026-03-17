import { Paper, Typography } from '@mui/material';

interface MetricProps {
  label: string;
  value: string | number;
}

export default function Metric({ label, value }: MetricProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.04)',
        borderRadius: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {label}
      </Typography>
    </Paper>
  );
}
