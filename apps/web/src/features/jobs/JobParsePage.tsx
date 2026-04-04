import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Divider,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
  CssBaseline,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import { parseJob } from '../../api/jobs.api';
import FileUploadBox from './components/FileUploadBox';
import TextInputBox from './components/TextInputBox';
import JobParsingState from './components/JobParsingState';
import JobDraftSuccess from './components/JobDraftSuccess';
import type { JobUIState, ParsedJobResult } from './components/types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    background: {
      default: '#0f172a',
      paper: '#111827',
    },
    divider: '#1e293b',
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function JobParsePage() {
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<JobUIState>('input');
  const [isDragging, setIsDragging] = useState(false);
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParsedJobResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5 MB.');
      return;
    }
    setSelectedFile(file);
    setRawText('');
    toast.success(`File selected: ${file.name}`);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleTextChange = (value: string) => {
    setRawText(value);
    if (value) setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile && !rawText.trim()) {
      toast.error('Please upload a PDF or paste the job description text.');
      return;
    }

    setUiState('parsing');
    try {
      const input = selectedFile ? { file: selectedFile } : { rawText: rawText.trim() };
      const data = await parseJob(input);
      setResult({ job_id: data.job_id, parsed_data: data.parsed_data });
      setUiState('success');
      toast.success('Job description parsed and draft saved successfully!');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to parse job description. Please ensure the file is a valid, readable PDF and try again.',
      );
      setUiState('input');
    }
  };

  const handleParseAnother = () => {
    setUiState('input');
    setSelectedFile(null);
    setRawText('');
    setResult(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="button"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
              sx={{
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.2}>
                  Create New Job
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI-powered Job Description Parser · Phase 1
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            {uiState === 'parsing' && <JobParsingState />}

            {uiState === 'success' && result && (
              <JobDraftSuccess result={result} onParseAnother={handleParseAnother} />
            )}

            {uiState === 'input' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Upload Job Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Upload a PDF or paste the text. Our AI will extract requirements and save a draft.
                  </Typography>
                </Box>

                {/* File upload */}
                <FileUploadBox
                  isDragging={isDragging}
                  fileInputRef={fileInputRef}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onFileInput={handleFileInput}
                />

                {selectedFile && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'rgba(99,102,241,0.08)',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="primary.light" fontWeight={500}>
                      📄 {selectedFile.name}
                    </Typography>
                    <Box
                      component="button"
                      onClick={() => setSelectedFile(null)}
                      sx={{
                        bgcolor: 'transparent',
                        border: 'none',
                        color: 'text.secondary',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        lineHeight: 1,
                        p: 0,
                        '&:hover': { color: 'error.main' },
                      }}
                      aria-label="Remove selected file"
                    >
                      ✕
                    </Box>
                  </Box>
                )}

                <Divider sx={{ borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.disabled">
                    OR
                  </Typography>
                </Divider>

                {/* Text input */}
                <TextInputBox value={rawText} onChange={handleTextChange} />

                {/* Submit */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedFile && !rawText.trim()}
                  sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                >
                  Extract Job Requirements with AI
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
      />
    </ThemeProvider>
  );
}
