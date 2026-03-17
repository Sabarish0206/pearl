import { Box, Typography } from '@mui/material';

interface MetricProps {
  label: string;
  value: string | number;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#1e293b',
        borderRadius: '10px',
        padding: '1rem',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <Typography
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#6366f1',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.7rem',
          color: '#64748b',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
