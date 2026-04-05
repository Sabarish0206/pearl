import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface OfferedConfirmDialogProps {
  open: boolean;
  studentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OfferedConfirmDialog({
  open,
  studentName,
  onConfirm,
  onCancel,
}: OfferedConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#111827',
          border: '1px solid #f59e0b',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}
      >
        <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 28 }} />
        <Typography variant="h6" fontWeight={700} color="warning.main">
          College Policy Warning
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ color: 'text.primary', fontSize: '0.95rem', lineHeight: 1.7 }}
        >
          You are about to mark <strong>{studentName}</strong> as{' '}
          <Chip
            label="OFFERED"
            color="success"
            size="small"
            sx={{ mx: 0.5, fontWeight: 700 }}
          />
          .
        </DialogContentText>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'rgba(245,158,11,0.08)',
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            color="warning.light"
            fontWeight={600}
            sx={{ mb: 0.5 }}
          >
            ⚠ Irreversible Action — College Policy Guardrail
          </Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
            Setting a student&apos;s status to <strong>OFFERED</strong> will
            permanently mark them as <strong>Placed</strong>. This will prevent
            the student from applying to any future placement drives and cannot
            be undone. Please confirm this is the correct decision.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{ borderColor: 'divider' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          sx={{ fontWeight: 700 }}
        >
          Confirm — Mark as Offered
        </Button>
      </DialogActions>
    </Dialog>
  );
}
