import React from 'react';
import { Box, Typography } from '@mui/material';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#111827',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
