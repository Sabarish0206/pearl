import { Box, Button, Typography, Chip, Link } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import UploadIcon from '@mui/icons-material/Upload';
import type { ResumeRow } from '@pearl/common';
import { Section } from './Section';
import { Metric } from './Metric';

interface VerifiedDashboardProps {
  data: ResumeRow;
  onReplace: () => void;
}

export function VerifiedDashboard({ data, onReplace }: VerifiedDashboardProps) {
  const pd = data.parsedData;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Chip
            icon={<VerifiedIcon />}
            label="Verified"
            sx={{
              backgroundColor: '#052e16',
              color: '#4ade80',
              fontWeight: 600,
              border: '1px solid #166534',
              marginBottom: '0.5rem',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
            Your Resume
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={onReplace}
          sx={{
            color: '#94a3b8',
            borderColor: '#334155',
            backgroundColor: '#1e293b',
            '&:hover': {
              borderColor: '#475569',
              backgroundColor: '#334155',
            },
          }}
        >
          Update Resume
        </Button>
      </Box>

      {/* ATS Score */}
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
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginRight: '0.5rem',
          }}
        >
          ATS Score
        </Typography>
        <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#6366f1' }}>
          {data.atsScore}
        </Typography>
        <Typography sx={{ fontSize: '1rem', color: '#475569' }}>
          /100
        </Typography>
      </Box>

      {pd && (
        <>
          {/* Academic Metrics */}
          <Section title="Academic Metrics">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1rem',
              }}
            >
              <Metric label="CGPA" value={pd.cgpa ?? '—'} />
              <Metric label="10th %" value={pd.tenth_mark ?? '—'} />
              <Metric label="12th %" value={pd.twelfth_mark ?? '—'} />
              <Metric label="Active Arrears" value={pd.active_arrears ?? '0'} />
              <Metric label="History of Arrears" value={pd.history_of_arrears ?? '0'} />
            </Box>
          </Section>

          {/* Skills */}
          {pd.skills.length > 0 && (
            <Section title="Skills">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {pd.skills.map((s, i) => (
                  <Chip
                    key={i}
                    label={s}
                    sx={{
                      backgroundColor: '#1e1b4b',
                      color: '#a5b4fc',
                      border: '1px solid #3730a3',
                    }}
                  />
                ))}
              </Box>
            </Section>
          )}

          {/* Education */}
          {pd.education.length > 0 && (
            <Section title="Education">
              {pd.education.map((edu, i) => (
                <Box
                  key={i}
                  sx={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #334155',
                    lineHeight: 1.6,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    {edu.degree} — {edu.institution}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {edu.start_year} – {edu.end_year} · Score: {edu.score}
                  </Typography>
                </Box>
              ))}
            </Section>
          )}

          {/* Experience */}
          {pd.experience.length > 0 && (
            <Section title="Experience">
              {pd.experience.map((exp, i) => (
                <Box
                  key={i}
                  sx={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #334155',
                    lineHeight: 1.6,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    {exp.role} at {exp.company}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {exp.duration}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {exp.description}
                  </Typography>
                </Box>
              ))}
            </Section>
          )}

          {/* Projects */}
          {pd.projects.length > 0 && (
            <Section title="Projects">
              {pd.projects.map((proj, i) => (
                <Box
                  key={i}
                  sx={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #334155',
                    lineHeight: 1.6,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    {proj.title}
                    {proj.link && (
                      <>
                        {' · '}
                        <Link
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#6366f1', textDecoration: 'none' }}
                        >
                          {proj.link}
                        </Link>
                      </>
                    )}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {proj.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {proj.technologies.map((t, j) => (
                      <Chip
                        key={j}
                        label={t}
                        size="small"
                        sx={{
                          backgroundColor: '#1e293b',
                          color: '#94a3b8',
                          border: '1px solid #334155',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Section>
          )}

          {/* Certifications */}
          {pd.certifications.length > 0 && (
            <Section title="Certifications">
              {pd.certifications.map((cert, i) => (
                <Box
                  key={i}
                  sx={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #334155',
                    lineHeight: 1.6,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    {cert.name} — {cert.issuer}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {cert.date}
                  </Typography>
                </Box>
              ))}
            </Section>
          )}

          {/* Achievements */}
          {pd.achievements.length > 0 && (
            <Section title="Achievements">
              <Box component="ul" sx={{ margin: 0, paddingLeft: '1.25rem' }}>
                {pd.achievements.map((a, i) => (
                  <Typography
                    key={i}
                    component="li"
                    sx={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}
                  >
                    {a}
                  </Typography>
                ))}
              </Box>
            </Section>
          )}
        </>
      )}
    </Box>
  );
}
