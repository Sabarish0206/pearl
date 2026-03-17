import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

interface DropzoneStateProps {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DropzoneState({
  isDragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: DropzoneStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Upload Your Resume
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Our AI will parse your resume and extract key information for verification.
      </Typography>
      <Paper
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF — click or press Enter/Space to browse files"
        elevation={0}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 3,
          py: 8,
          px: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          bgcolor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(99, 102, 241, 0.04)',
          },
        }}
      >
        <DescriptionIcon
          sx={{
            fontSize: 64,
            color: isDragging ? 'primary.main' : 'text.secondary',
            mb: 1,
          }}
        />
        <Typography variant="h6" fontWeight={600} color="text.primary">
          {isDragging ? 'Drop your PDF here' : 'Drag & drop your resume PDF here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse
        </Typography>
        <Chip
          label="PDF only · Max 5 MB"
          size="small"
          sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={onFileInput}
        />
      </Paper>
    </Box>
  );
}
