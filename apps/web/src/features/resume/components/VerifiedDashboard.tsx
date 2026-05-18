import { Box, Button, Typography, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import type { ResumeRow } from '@pearl/common';
import Section from './Section';
import Metric from './Metric';
import { currentTheme } from "../../../theme/theme";

interface VerifiedDashboardProps {
  data: ResumeRow;
  onReplace: () => void;
}

export default function VerifiedDashboard({ data, onReplace }: VerifiedDashboardProps) {
  const pd = data.parsedData;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label="Verified"
            size="small"
            sx={{
              bgcolor: 'rgba(74, 222, 128, 0.1)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontWeight: 600,
              width: 'fit-content',
            }}
          />
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Your Resume
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={onReplace}
          sx={{ color: 'text.secondary', borderColor: 'divider' }}
        >
          Update Resume
        </Button>
      </Box>

      {/* ATS Score */}
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
          {data.atsScore}
        </Typography>
        <Typography variant="body1" color="text.disabled">
          /100
        </Typography>
      </Paper>

      {pd && (
        <>
          {/* Academic Metrics */}
          <Section title="Academic Metrics">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 2,
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {pd.skills.map((s, i) => (
                  <Chip
                    key={i}
                    label={s}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      color: currentTheme.palette.text.primary,
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  />
                ))}
              </Box>
            </Section>
          )}

          {/* Education */}
          {pd.education.length > 0 && (
            <Section title="Education">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pd.education.map((edu, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {edu.degree} — {edu.institution}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p">
                      {edu.start_year} – {edu.end_year} · Score: {edu.score}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Section>
          )}

          {/* Experience */}
          {pd.experience.length > 0 && (
            <Section title="Experience">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pd.experience.map((exp, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {exp.role} at {exp.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p">
                      {exp.duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {exp.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Section>
          )}

          {/* Projects */}
          {pd.projects.length > 0 && (
            <Section title="Projects">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pd.projects.map((proj, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {proj.title}
                      </Typography>
                      {proj.link && (
                        <Typography
                          component="a"
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {proj.link}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {proj.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {proj.technologies.map((t, j) => (
                        <Chip
                          key={j}
                          label={t}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Section>
          )}

          {/* Certifications */}
          {pd.certifications.length > 0 && (
            <Section title="Certifications">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pd.certifications.map((cert, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {cert.name} — {cert.issuer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p">
                      {cert.date}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Section>
          )}

          {/* Achievements */}
          {pd.achievements.length > 0 && (
            <Section title="Achievements">
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {pd.achievements.map((a, i) => (
                  <Box
                    key={i}
                    component="li"
                    sx={{ mb: 0.5, fontSize: '0.9rem', color: 'text.primary' }}
                  >
                    {a}
                  </Box>
                ))}
              </Box>
            </Section>
          )}
        </>
      )}
    </Box>
  );
}
