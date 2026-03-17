import { Box, Typography, Button, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';

interface PageHeaderProps {
  onBack: () => void;
}

export default function PageHeader({ onBack }: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
            Pearl
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Resume Processing
          </Typography>
        </Box>
      </Box>
      <Tooltip title="Back to Dashboard">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          size="small"
          sx={{ color: 'text.secondary', borderColor: 'divider' }}
        >
          Dashboard
        </Button>
      </Tooltip>
    </Box>
  );
}
