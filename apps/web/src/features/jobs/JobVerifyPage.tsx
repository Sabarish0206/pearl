import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PublishIcon from '@mui/icons-material/Publish';
import { deleteDraftJob, getJob, publishJob } from '../../api/jobs.api';
import type { JobRow } from '@pearl/common';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    background: { default: '#0f172a', paper: '#111827' },
    divider: '#1e293b',
    text: { primary: '#e2e8f0', secondary: '#94a3b8', disabled: '#475569' },
    error: { main: '#ef4444' },
    success: { main: '#22c55e' },
  },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

interface FormState {
  companyName: string;
  jobRole: string;
  ctc: string;
  minCgpa: string;
  maxActiveArrears: string;
  maxHistoryOfArrears: string;
  allowedDepartments: string[];
  requiredSkills: string[];
}

function extractStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function jobToFormState(job: JobRow): FormState {
  const pd = job.parsedData;
  const parsedSkills =
    pd && typeof pd === 'object' && 'requiredSkills' in pd
      ? extractStringArray((pd as Record<string, unknown>)['requiredSkills'])
      : [];

  return {
    companyName: job.companyName,
    jobRole: job.jobRole,
    ctc: job.ctc ?? '',
    minCgpa: job.minCgpa !== null ? String(job.minCgpa) : '0',
    maxActiveArrears: job.maxActiveArrears !== null ? String(job.maxActiveArrears) : '0',
    maxHistoryOfArrears: job.maxHistoryOfArrears !== null ? String(job.maxHistoryOfArrears) : '99',
    allowedDepartments: job.allowedDepartments,
    requiredSkills: parsedSkills,
  };
}

export default function JobVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobRow | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadJob = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getJob(id);
      setJob(data);
      setForm(jobToFormState(data));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load job.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handlePublish = async () => {
    if (!form || !id) return;

    const minCgpa = parseFloat(form.minCgpa);
    const maxActiveArrears = parseInt(form.maxActiveArrears, 10);
    const maxHistoryOfArrears = parseInt(form.maxHistoryOfArrears, 10);

    if (!form.companyName.trim()) {
      toast.error('Company name is required.');
      return;
    }
    if (!form.jobRole.trim()) {
      toast.error('Job role is required.');
      return;
    }
    if (isNaN(minCgpa) || minCgpa < 0 || minCgpa > 10) {
      toast.error('Min CGPA must be a number between 0 and 10.');
      return;
    }
    if (isNaN(maxActiveArrears) || maxActiveArrears < 0) {
      toast.error('Max active arrears must be a non-negative integer.');
      return;
    }
    if (isNaN(maxHistoryOfArrears) || maxHistoryOfArrears < 0) {
      toast.error('Max history of arrears must be a non-negative integer.');
      return;
    }

    setIsPublishing(true);
    try {
      await publishJob(id, {
        companyName: form.companyName.trim(),
        jobRole: form.jobRole.trim(),
        ctc: form.ctc.trim() || null,
        minCgpa,
        maxActiveArrears,
        maxHistoryOfArrears,
        allowedDepartments: form.allowedDepartments,
        requiredSkills: form.requiredSkills,
        parsedData: job?.parsedData ?? null,
      });
      toast.success('Job published successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish job.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteDraftJob(id);
      setIsDeleteDialogOpen(false);
      toast.success('Draft job deleted successfully.');
      setTimeout(() => navigate('/admin/jobs'), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete draft job.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.2}>
                Review & Publish Job
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verify AI-extracted data and publish the job · Phase 2
              </Typography>
            </Box>
          </Box>

          {/* Loading */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {/* Error */}
          {!isLoading && loadError && (
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'error.main', borderRadius: 3, textAlign: 'center' }}>
              <Typography color="error">{loadError}</Typography>
              <Button sx={{ mt: 2 }} variant="outlined" onClick={loadJob}>
                Retry
              </Button>
            </Paper>
          )}

          {/* Form */}
          {!isLoading && !loadError && form && (
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Job Details
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    label="Company Name"
                    value={form.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    required
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                  />
                  <TextField
                    label="Job Role"
                    value={form.jobRole}
                    onChange={(e) => handleFieldChange('jobRole', e.target.value)}
                    required
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                  />
                  <TextField
                    label="CTC (e.g. 6 LPA)"
                    value={form.ctc}
                    onChange={(e) => handleFieldChange('ctc', e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                  <TextField
                    label="Min CGPA"
                    type="number"
                    value={form.minCgpa}
                    onChange={(e) => handleFieldChange('minCgpa', e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                  />
                  <TextField
                    label="Max Active Arrears"
                    type="number"
                    value={form.maxActiveArrears}
                    onChange={(e) => handleFieldChange('maxActiveArrears', e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                  <TextField
                    label="Max History of Arrears"
                    type="number"
                    value={form.maxHistoryOfArrears}
                    onChange={(e) => handleFieldChange('maxHistoryOfArrears', e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    helperText="Use 99 for no restriction"
                  />
                </Box>

                <Divider sx={{ borderColor: 'divider' }} />

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={form.allowedDepartments}
                  onChange={(_e, newValue) => setForm((prev) => prev ? { ...prev, allowedDepartments: newValue.filter((v): v is string => typeof v === 'string') } : prev)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Allowed Departments"
                      placeholder="Type and press Enter to add"
                      helperText="Add department names (e.g. CSE, ECE, IT)"
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={form.requiredSkills}
                  onChange={(_e, newValue) => setForm((prev) => prev ? { ...prev, requiredSkills: newValue.filter((v): v is string => typeof v === 'string') } : prev)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Required Skills"
                      placeholder="Type and press Enter to add"
                      helperText="Add required technical and soft skills"
                    />
                  )}
                />

                <Divider sx={{ borderColor: 'divider' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlineIcon />}
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isPublishing || isDeleting}
                    sx={{ fontWeight: 700 }}
                  >
                    Delete Draft
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={isPublishing ? <CircularProgress size={18} color="inherit" /> : <PublishIcon />}
                    onClick={handlePublish}
                    disabled={isPublishing || isDeleting}
                    sx={{ fontWeight: 700, px: 4 }}
                  >
                    {isPublishing ? 'Publishing…' : 'Publish Job'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
      />
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #ef4444',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          Delete Draft Drive?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            This will soft-delete the draft by marking it as cancelled. You can&apos;t publish it after this action.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{ borderColor: 'divider' }}
          >
            Keep Draft
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{ fontWeight: 700 }}
          >
            {isDeleting ? 'Deleting…' : 'Delete Draft'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
