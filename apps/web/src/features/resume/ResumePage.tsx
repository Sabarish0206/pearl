import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { ParsedResumeData, ResumeRow } from '@pearl/common';
import { fetchResume, parseResume, commitResume } from '../../api/resume.api';
import {
  PageHeader,
  SkeletonLoader,
  DropzoneState,
  ParsingState,
  DraftForm,
  VerifiedDashboard,
} from './components';

// ============================================================
// Types
// ============================================================
type UIState = 'loading' | 'not_uploaded' | 'parsing' | 'draft' | 'saving' | 'verified';

interface DraftFormData {
  resume_id: string;
  ats_score: number;
  cgpa: number | null;
  active_arrears: number | null;
  history_of_arrears: number | null;
  tenth_mark: number | null;
  twelfth_mark: number | null;
  skills: string[];
  education: ParsedResumeData['education'];
  projects: ParsedResumeData['projects'];
  certifications: ParsedResumeData['certifications'];
  experience: ParsedResumeData['experience'];
  achievements: string[];
}

// ============================================================
// Main Component
// ============================================================
export default function ResumePage() {
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<UIState>('loading');
  const [draftData, setDraftData] = useState<DraftFormData | null>(null);
  const [verifiedData, setVerifiedData] = useState<ResumeRow | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Populate draft state from a ResumeRow ----
  const populateDraft = useCallback((row: ResumeRow) => {
    const pd = row.parsedData;
    setDraftData({
      resume_id: row.id,
      ats_score: row.atsScore ?? 0,
      cgpa: pd?.cgpa ?? null,
      active_arrears: pd?.active_arrears ?? null,
      history_of_arrears: pd?.history_of_arrears ?? null,
      tenth_mark: pd?.tenth_mark ?? null,
      twelfth_mark: pd?.twelfth_mark ?? null,
      skills: pd?.skills ?? [],
      education: pd?.education ?? [],
      projects: pd?.projects ?? [],
      certifications: pd?.certifications ?? [],
      experience: pd?.experience ?? [],
      achievements: pd?.achievements ?? [],
    });
    setUiState('draft');
  }, []);

  // ---- Initial load ----
  const loadResume = useCallback(async () => {
    setUiState('loading');
    try {
      const result = await fetchResume();
      if (result.status === 'NOT_UPLOADED') {
        setUiState('not_uploaded');
      } else if (result.status === 'DRAFT' && result.data) {
        populateDraft(result.data);
      } else if (result.status === 'VERIFIED' && result.data) {
        setVerifiedData(result.data);
        setUiState('verified');
      }
    } catch {
      toast.error('Failed to load resume data. Please refresh the page or try again later.');
      setUiState('not_uploaded');
    }
  }, [populateDraft]);

  useEffect(() => {
    const init = async () => {
      await loadResume();
    };
    void init();
  }, [loadResume]);

  // ---- File upload handling ----
  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5 MB.');
      return;
    }

    setUiState('parsing');
    try {
      const result = await parseResume(file);
      const partialRow: ResumeRow = {
        id: result.resume_id,
        studentId: '',
        filePath: '',
        atsScore: result.parsed_data.ats_score,
        parsedData: result.parsed_data,
        isVerified: false,
      };
      populateDraft(partialRow);
      toast.success('Resume parsed successfully! Please review and confirm the data below.');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to parse resume. Please ensure the file is a valid, readable PDF and try again.'
      );
      setUiState('not_uploaded');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  // ---- Commit handling ----
  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftData) return;

    setUiState('saving');
    try {
      await commitResume({
        resume_id: draftData.resume_id,
        cgpa: draftData.cgpa,
        active_arrears: draftData.active_arrears,
        history_of_arrears: draftData.history_of_arrears,
        tenth_mark: draftData.tenth_mark,
        twelfth_mark: draftData.twelfth_mark,
        skills: draftData.skills,
        education: draftData.education,
        projects: draftData.projects,
        certifications: draftData.certifications,
        experience: draftData.experience,
        achievements: draftData.achievements,
      });
      toast.success('Resume verified and saved!');
      await loadResume();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to save resume. Please check your connection and try again.'
      );
      setUiState('draft');
    }
  };

  // ---- Render ----
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <PageHeader onBack={() => navigate('/dashboard')} />

      <Box
        sx={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {uiState === 'loading' && <SkeletonLoader />}
        {uiState === 'not_uploaded' && (
          <DropzoneState
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onFileInput={handleFileInput}
          />
        )}
        {uiState === 'parsing' && <ParsingState />}
        {uiState === 'draft' && draftData && (
          <DraftForm data={draftData} onChange={setDraftData} onSubmit={handleCommit} />
        )}
        {uiState === 'saving' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '3rem 1rem',
            }}
          >
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
            <Typography sx={{ color: '#94a3b8' }}>Saving your verified resume...</Typography>
          </Box>
        )}
        {uiState === 'verified' && verifiedData && (
          <VerifiedDashboard
            data={verifiedData}
            onReplace={() => {
              setVerifiedData(null);
              setDraftData(null);
              setUiState('not_uploaded');
            }}
          />
        )}
      </Box>
    </Box>
  );
}
