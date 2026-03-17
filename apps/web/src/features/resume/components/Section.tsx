import React from 'react';
import { Paper, Typography } from '@mui/material';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        fontWeight={600}
        sx={{ letterSpacing: '0.08em' }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
