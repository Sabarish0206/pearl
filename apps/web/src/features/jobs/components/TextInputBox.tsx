import { Box, TextField, Typography } from '@mui/material';

interface TextInputBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInputBox({ value, onChange }: TextInputBoxProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Or paste the job description text directly:
      </Typography>
      <TextField
        multiline
        minRows={8}
        maxRows={16}
        fullWidth
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { 'aria-label': 'Job description text input' },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.main' },
          },
        }}
      />
    </Box>
  );
}
