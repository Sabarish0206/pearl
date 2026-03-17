import { Box, Button, Typography, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ParsedResumeData } from '@pearl/common';
import { Section } from './Section';
import { FormField } from './FormField';

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

interface DraftFormProps {
  data: DraftFormData;
  onChange: (d: DraftFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DraftForm({ data, onChange, onSubmit }: DraftFormProps) {
  const setField = <K extends keyof DraftFormData>(key: K, value: DraftFormData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const skillsStr = data.skills.join(', ');

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      '& fieldset': {
        borderColor: '#334155',
      },
      '&:hover fieldset': {
        borderColor: '#475569',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6366f1',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#94a3b8',
    },
    '& .MuiInputBase-input': {
      color: '#e2e8f0',
    },
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
          Review Parsed Data
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
          Our AI has extracted the following information. Please review, edit if necessary, then submit.
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.25rem',
            backgroundColor: '#1e293b',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #334155',
            width: 'fit-content',
            marginTop: '0.5rem',
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>
            ATS Score
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#6366f1' }}>
            {data.ats_score}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#475569' }}>
            /100
          </Typography>
        </Box>
      </Box>

      {/* Academic Metrics */}
      <Section title="Academic Metrics">
        <Box sx={gridStyles}>
          <FormField label="CGPA">
            <TextField
              type="number"
              size="small"
              fullWidth
              inputProps={{ step: 0.01, min: 0, max: 10 }}
              value={data.cgpa ?? ''}
              onChange={(e) => setField('cgpa', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 8.5"
              sx={inputStyles}
            />
          </FormField>
          <FormField label="10th Mark (%)">
            <TextField
              type="number"
              size="small"
              fullWidth
              inputProps={{ step: 0.01, min: 0, max: 100 }}
              value={data.tenth_mark ?? ''}
              onChange={(e) => setField('tenth_mark', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 92.5"
              sx={inputStyles}
            />
          </FormField>
          <FormField label="12th Mark (%)">
            <TextField
              type="number"
              size="small"
              fullWidth
              inputProps={{ step: 0.01, min: 0, max: 100 }}
              value={data.twelfth_mark ?? ''}
              onChange={(e) => setField('twelfth_mark', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 88.0"
              sx={inputStyles}
            />
          </FormField>
          <FormField label="Active Arrears">
            <TextField
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              value={data.active_arrears ?? ''}
              onChange={(e) => setField('active_arrears', e.target.value === '' ? null : parseInt(e.target.value, 10))}
              placeholder="0"
              sx={inputStyles}
            />
          </FormField>
          <FormField label="History of Arrears">
            <TextField
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              value={data.history_of_arrears ?? ''}
              onChange={(e) => setField('history_of_arrears', e.target.value === '' ? null : parseInt(e.target.value, 10))}
              placeholder="0"
              sx={inputStyles}
            />
          </FormField>
        </Box>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <TextField
          multiline
          rows={3}
          fullWidth
          value={skillsStr}
          onChange={(e) =>
            setField(
              'skills',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="e.g. Python, React, Node.js, SQL"
          sx={inputStyles}
        />
        <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>
          Separate skills with commas
        </Typography>
      </Section>

      {/* Education */}
      <Section title="Education">
        {data.education.map((edu, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: '#1e293b',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #334155',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                {edu.institution || 'Institution'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setField('education', data.education.filter((_, idx) => idx !== i))}
                sx={{ color: '#ef4444' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={gridStyles}>
              <FormField label="Institution">
                <TextField
                  size="small"
                  fullWidth
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...data.education];
                    updated[i] = { ...edu, institution: e.target.value };
                    setField('education', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Degree">
                <TextField
                  size="small"
                  fullWidth
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...data.education];
                    updated[i] = { ...edu, degree: e.target.value };
                    setField('education', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Start Year">
                <TextField
                  size="small"
                  fullWidth
                  value={edu.start_year}
                  onChange={(e) => {
                    const updated = [...data.education];
                    updated[i] = { ...edu, start_year: e.target.value };
                    setField('education', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="End Year">
                <TextField
                  size="small"
                  fullWidth
                  value={edu.end_year}
                  onChange={(e) => {
                    const updated = [...data.education];
                    updated[i] = { ...edu, end_year: e.target.value };
                    setField('education', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Score/CGPA">
                <TextField
                  size="small"
                  fullWidth
                  value={edu.score}
                  onChange={(e) => {
                    const updated = [...data.education];
                    updated[i] = { ...edu, score: e.target.value };
                    setField('education', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
            </Box>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            setField('education', [
              ...data.education,
              { institution: '', degree: '', start_year: '', end_year: '', score: '' },
            ])
          }
          sx={{
            color: '#6366f1',
            borderColor: '#334155',
            borderStyle: 'dashed',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          Add Education
        </Button>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {data.experience.map((exp, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: '#1e293b',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #334155',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                {exp.role || 'Role'} @ {exp.company || 'Company'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setField('experience', data.experience.filter((_, idx) => idx !== i))}
                sx={{ color: '#ef4444' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={gridStyles}>
              <FormField label="Role">
                <TextField
                  size="small"
                  fullWidth
                  value={exp.role}
                  onChange={(e) => {
                    const updated = [...data.experience];
                    updated[i] = { ...exp, role: e.target.value };
                    setField('experience', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Company">
                <TextField
                  size="small"
                  fullWidth
                  value={exp.company}
                  onChange={(e) => {
                    const updated = [...data.experience];
                    updated[i] = { ...exp, company: e.target.value };
                    setField('experience', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Duration">
                <TextField
                  size="small"
                  fullWidth
                  value={exp.duration}
                  onChange={(e) => {
                    const updated = [...data.experience];
                    updated[i] = { ...exp, duration: e.target.value };
                    setField('experience', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Description" sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  value={exp.description}
                  onChange={(e) => {
                    const updated = [...data.experience];
                    updated[i] = { ...exp, description: e.target.value };
                    setField('experience', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
            </Box>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            setField('experience', [
              ...data.experience,
              { role: '', company: '', duration: '', description: '' },
            ])
          }
          sx={{
            color: '#6366f1',
            borderColor: '#334155',
            borderStyle: 'dashed',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          Add Experience
        </Button>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {data.projects.map((proj, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: '#1e293b',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #334155',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                {proj.title || 'Project'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setField('projects', data.projects.filter((_, idx) => idx !== i))}
                sx={{ color: '#ef4444' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={gridStyles}>
              <FormField label="Title">
                <TextField
                  size="small"
                  fullWidth
                  value={proj.title}
                  onChange={(e) => {
                    const updated = [...data.projects];
                    updated[i] = { ...proj, title: e.target.value };
                    setField('projects', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Link">
                <TextField
                  size="small"
                  fullWidth
                  value={proj.link ?? ''}
                  placeholder="Optional"
                  onChange={(e) => {
                    const updated = [...data.projects];
                    updated[i] = { ...proj, link: e.target.value || null };
                    setField('projects', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Technologies" sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  size="small"
                  fullWidth
                  value={proj.technologies.join(', ')}
                  placeholder="React, Node.js..."
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
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Description" sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  value={proj.description}
                  onChange={(e) => {
                    const updated = [...data.projects];
                    updated[i] = { ...proj, description: e.target.value };
                    setField('projects', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
            </Box>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            setField('projects', [
              ...data.projects,
              { title: '', description: '', technologies: [], link: null },
            ])
          }
          sx={{
            color: '#6366f1',
            borderColor: '#334155',
            borderStyle: 'dashed',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          Add Project
        </Button>
      </Section>

      {/* Certifications */}
      <Section title="Certifications">
        {data.certifications.map((cert, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: '#1e293b',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #334155',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                {cert.name || 'Certification'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setField('certifications', data.certifications.filter((_, idx) => idx !== i))}
                sx={{ color: '#ef4444' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={gridStyles}>
              <FormField label="Name">
                <TextField
                  size="small"
                  fullWidth
                  value={cert.name}
                  onChange={(e) => {
                    const updated = [...data.certifications];
                    updated[i] = { ...cert, name: e.target.value };
                    setField('certifications', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Issuer">
                <TextField
                  size="small"
                  fullWidth
                  value={cert.issuer}
                  onChange={(e) => {
                    const updated = [...data.certifications];
                    updated[i] = { ...cert, issuer: e.target.value };
                    setField('certifications', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
              <FormField label="Date">
                <TextField
                  size="small"
                  fullWidth
                  value={cert.date}
                  onChange={(e) => {
                    const updated = [...data.certifications];
                    updated[i] = { ...cert, date: e.target.value };
                    setField('certifications', updated);
                  }}
                  sx={inputStyles}
                />
              </FormField>
            </Box>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            setField('certifications', [
              ...data.certifications,
              { name: '', issuer: '', date: '' },
            ])
          }
          sx={{
            color: '#6366f1',
            borderColor: '#334155',
            borderStyle: 'dashed',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          Add Certification
        </Button>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        {data.achievements.map((ach, i) => (
          <Box key={i} sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              value={ach}
              onChange={(e) => {
                const updated = [...data.achievements];
                updated[i] = e.target.value;
                setField('achievements', updated);
              }}
              sx={inputStyles}
            />
            <IconButton
              size="small"
              onClick={() => setField('achievements', data.achievements.filter((_, idx) => idx !== i))}
              sx={{ color: '#ef4444' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setField('achievements', [...data.achievements, ''])}
          sx={{
            color: '#6366f1',
            borderColor: '#334155',
            borderStyle: 'dashed',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
        >
          Add Achievement
        </Button>
      </Section>

      {/* Submit */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<CheckCircleIcon />}
          sx={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontWeight: 600,
            fontSize: '1rem',
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
