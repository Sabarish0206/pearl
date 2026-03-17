import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PageHeaderProps {
  onBack: () => void;
}

export function PageHeader({ onBack }: PageHeaderProps) {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box
            sx={{
              width: '2rem',
              height: '2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
            }}
          >
            P
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#f1f5f9',
              }}
            >
              Pearl
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              Resume Processing
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            color: '#94a3b8',
            borderColor: '#334155',
            backgroundColor: '#1e293b',
            '&:hover': {
              borderColor: '#475569',
              backgroundColor: '#334155',
            },
          }}
        >
          Dashboard
        </Button>
      </Toolbar>
    </AppBar>
  );
}
