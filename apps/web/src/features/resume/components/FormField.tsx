import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function FormField({ label, children, sx }: FormFieldProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        ...sx,
      }}
    >
      <Typography
        component="label"
        sx={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: '#94a3b8',
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}
