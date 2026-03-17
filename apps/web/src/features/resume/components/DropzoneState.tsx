import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

interface DropzoneStateProps {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DropzoneState({
  isDragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: DropzoneStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#f1f5f9',
        }}
      >
        Upload Your Resume
      </Typography>
      <Typography
        sx={{
          color: '#64748b',
          fontSize: '0.9rem',
          marginTop: '0.5rem',
        }}
      >
        Our AI will parse your resume and extract key information for verification.
      </Typography>
      <Paper
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF — click or press Enter/Space to browse files"
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? '#6366f1' : '#334155',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: isDragging ? '#1e1b4b' : '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: '#1a1a2e',
          },
        }}
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
      >
        <DescriptionIcon
          sx={{
            fontSize: '3rem',
            color: '#6366f1',
          }}
        />
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#cbd5e1',
          }}
        >
          {isDragging ? 'Drop your PDF here' : 'Drag & drop your resume PDF here'}
        </Typography>
        <Typography
          sx={{
            color: '#64748b',
            fontSize: '0.875rem',
          }}
        >
          or click to browse
        </Typography>
        <Chip
          label="PDF only · Max 5 MB"
          size="small"
          sx={{
            marginTop: '0.5rem',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            fontSize: '0.75rem',
          }}
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
