import React from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Section from './Section';
import type { DraftFormData } from './types';

interface DraftFormProps {
  data: DraftFormData;
  onChange: (d: DraftFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(255,255,255,0.04)',
  },
};

export default function DraftForm({ data, onChange, onSubmit }: DraftFormProps) {
  const setField = <K extends keyof DraftFormData>(key: K, value: DraftFormData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const skillsStr = data.skills.join(', ');

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Review Parsed Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Our AI has extracted the following information. Please review, edit if necessary, then submit.
        </Typography>
        <Paper
          elevation={0}
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 0.5,
            bgcolor: 'background.paper',
            p: '0.75rem 1.25rem',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            width: 'fit-content',
            mt: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mr: 1 }}
          >
            ATS Score
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main" lineHeight={1}>
            {data.ats_score}
          </Typography>
          <Typography variant="body1" color="text.disabled">
            /100
          </Typography>
        </Paper>
      </Box>

      {/* Academic Metrics */}
      <Section title="Academic Metrics">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 2,
          }}
        >
          <TextField
            label="CGPA"
            size="small"
            type="number"
            slotProps={{ htmlInput: { step: 0.01, min: 0, max: 10 } }}
            value={data.cgpa ?? ''}
            onChange={(e) =>
              setField('cgpa', e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder="e.g. 8.5"
            sx={inputSx}
          />
          <TextField
            label="10th Mark (%)"
            size="small"
            type="number"
            slotProps={{ htmlInput: { step: 0.01, min: 0, max: 100 } }}
            value={data.tenth_mark ?? ''}
            onChange={(e) =>
              setField('tenth_mark', e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder="e.g. 92.5"
            sx={inputSx}
          />
          <TextField
            label="12th Mark (%)"
            size="small"
            type="number"
            slotProps={{ htmlInput: { step: 0.01, min: 0, max: 100 } }}
            value={data.twelfth_mark ?? ''}
            onChange={(e) =>
              setField('twelfth_mark', e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder="e.g. 88.0"
            sx={inputSx}
          />
          <TextField
            label="Active Arrears"
            size="small"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={data.active_arrears ?? ''}
            onChange={(e) =>
              setField(
                'active_arrears',
                e.target.value === '' ? null : parseInt(e.target.value, 10),
              )
            }
            placeholder="0"
            sx={inputSx}
          />
          <TextField
            label="History of Arrears"
            size="small"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={data.history_of_arrears ?? ''}
            onChange={(e) =>
              setField(
                'history_of_arrears',
                e.target.value === '' ? null : parseInt(e.target.value, 10),
              )
            }
            placeholder="0"
            sx={inputSx}
          />
        </Box>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <TextField
          multiline
          minRows={3}
          value={skillsStr}
          onChange={(e) =>
            setField(
              'skills',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="e.g. Python, React, Node.js, SQL"
          helperText="Separate skills with commas"
          sx={inputSx}
        />
      </Section>

      {/* Education */}
      <Section title="Education">
        {data.education.map((edu, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {edu.institution || 'Institution'}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setField(
                    'education',
                    data.education.filter((_, idx) => idx !== i),
                  )
                }
                sx={{ color: 'error.main' }}
                aria-label="Remove education entry"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 2,
              }}
            >
              <TextField
                label="Institution"
                size="small"
                value={edu.institution}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, institution: e.target.value };
                  setField('education', updated);
                }}
              />
              <TextField
                label="Degree"
                size="small"
                value={edu.degree}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, degree: e.target.value };
                  setField('education', updated);
                }}
              />
              <TextField
                label="Start Year"
                size="small"
                value={edu.start_year}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, start_year: e.target.value };
                  setField('education', updated);
                }}
              />
              <TextField
                label="End Year"
                size="small"
                value={edu.end_year}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, end_year: e.target.value };
                  setField('education', updated);
                }}
              />
              <TextField
                label="Score/CGPA"
                size="small"
                value={edu.score}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, score: e.target.value };
                  setField('education', updated);
                }}
              />
            </Box>
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={() =>
            setField('education', [
              ...data.education,
              { institution: '', degree: '', start_year: '', end_year: '', score: '' },
            ])
          }
          sx={{ width: 'fit-content', borderStyle: 'dashed' }}
        >
          Add Education
        </Button>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {data.experience.map((exp, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {exp.role || 'Role'} @ {exp.company || 'Company'}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setField(
                    'experience',
                    data.experience.filter((_, idx) => idx !== i),
                  )
                }
                sx={{ color: 'error.main' }}
                aria-label="Remove experience entry"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 2,
              }}
            >
              <TextField
                label="Role"
                size="small"
                value={exp.role}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, role: e.target.value };
                  setField('experience', updated);
                }}
              />
              <TextField
                label="Company"
                size="small"
                value={exp.company}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, company: e.target.value };
                  setField('experience', updated);
                }}
              />
              <TextField
                label="Duration"
                size="small"
                value={exp.duration}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, duration: e.target.value };
                  setField('experience', updated);
                }}
              />
            </Box>
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={exp.description}
              sx={inputSx}
              onChange={(e) => {
                const updated = [...data.experience];
                updated[i] = { ...exp, description: e.target.value };
                setField('experience', updated);
              }}
            />
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={() =>
            setField('experience', [
              ...data.experience,
              { role: '', company: '', duration: '', description: '' },
            ])
          }
          sx={{ width: 'fit-content', borderStyle: 'dashed' }}
        >
          Add Experience
        </Button>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {data.projects.map((proj, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {proj.title || 'Project'}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setField(
                    'projects',
                    data.projects.filter((_, idx) => idx !== i),
                  )
                }
                sx={{ color: 'error.main' }}
                aria-label="Remove project entry"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 2,
              }}
            >
              <TextField
                label="Title"
                size="small"
                value={proj.title}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, title: e.target.value };
                  setField('projects', updated);
                }}
              />
              <TextField
                label="Link"
                size="small"
                value={proj.link ?? ''}
                placeholder="Optional"
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, link: e.target.value || null };
                  setField('projects', updated);
                }}
              />
              <TextField
                label="Technologies"
                size="small"
                value={proj.technologies.join(', ')}
                placeholder="React, Node.js..."
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = {
                    ...proj,
                    technologies: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  };
                  setField('projects', updated);
                }}
              />
            </Box>
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={proj.description}
              sx={inputSx}
              onChange={(e) => {
                const updated = [...data.projects];
                updated[i] = { ...proj, description: e.target.value };
                setField('projects', updated);
              }}
            />
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={() =>
            setField('projects', [
              ...data.projects,
              { title: '', description: '', technologies: [], link: null },
            ])
          }
          sx={{ width: 'fit-content', borderStyle: 'dashed' }}
        >
          Add Project
        </Button>
      </Section>

      {/* Certifications */}
      <Section title="Certifications">
        {data.certifications.map((cert, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {cert.name || 'Certification'}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setField(
                    'certifications',
                    data.certifications.filter((_, idx) => idx !== i),
                  )
                }
                sx={{ color: 'error.main' }}
                aria-label="Remove certification entry"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 2,
              }}
            >
              <TextField
                label="Name"
                size="small"
                value={cert.name}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, name: e.target.value };
                  setField('certifications', updated);
                }}
              />
              <TextField
                label="Issuer"
                size="small"
                value={cert.issuer}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, issuer: e.target.value };
                  setField('certifications', updated);
                }}
              />
              <TextField
                label="Date"
                size="small"
                value={cert.date}
                sx={inputSx}
                onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, date: e.target.value };
                  setField('certifications', updated);
                }}
              />
            </Box>
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={() =>
            setField('certifications', [
              ...data.certifications,
              { name: '', issuer: '', date: '' },
            ])
          }
          sx={{ width: 'fit-content', borderStyle: 'dashed' }}
        >
          Add Certification
        </Button>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        {data.achievements.map((ach, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              value={ach}
              onChange={(e) => {
                const updated = [...data.achievements];
                updated[i] = e.target.value;
                setField('achievements', updated);
              }}
              sx={{ ...inputSx, flex: 1 }}
            />
            <IconButton
              size="small"
              onClick={() =>
                setField(
                  'achievements',
                  data.achievements.filter((_, idx) => idx !== i),
                )
              }
              sx={{ color: 'error.main' }}
              aria-label="Remove achievement"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setField('achievements', [...data.achievements, ''])}
          sx={{ width: 'fit-content', borderStyle: 'dashed' }}
        >
          Add Achievement
        </Button>
      </Section>

      {/* Submit */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            px: 4,
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            },
          }}
        >
          Confirm & Save Resume
        </Button>
      </Box>
    </Box>
  );
}
