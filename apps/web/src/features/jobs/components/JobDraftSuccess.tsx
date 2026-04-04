import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Divider, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ParsedJobResult } from './types';

interface JobDraftSuccessProps {
  result: ParsedJobResult;
  onParseAnother: () => void;
}

export default function JobDraftSuccess({ result, onParseAnother }: JobDraftSuccessProps) {
  const { parsed_data } = result;
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Job Draft Created Successfully
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Job ID: {result.job_id}
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        {/* Company & Role */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Company
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {parsed_data.companyName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Role
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {parsed_data.jobRole}
            </Typography>
          </Box>
          {parsed_data.ctc && (
            <Box>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
                CTC
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {parsed_data.ctc}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Min CGPA
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {parsed_data.minCgpa > 0 ? parsed_data.minCgpa : 'No requirement'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Max Active Arrears
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {parsed_data.maxActiveArrears}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
              Max History of Arrears
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {parsed_data.maxHistoryOfArrears === 99 ? 'No restriction' : parsed_data.maxHistoryOfArrears}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'divider' }} />

        {/* Departments */}
        {parsed_data.allowedDepartments.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
              Allowed Departments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {parsed_data.allowedDepartments.map((dept) => (
                <Chip key={dept} label={dept} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Required Skills */}
        {parsed_data.requiredSkills.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {parsed_data.requiredSkills.map((skill) => (
                <Chip key={skill} label={skill} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: 'primary.light' }} />
              ))}
            </Box>
          </Box>
        )}

        {/* Responsibilities */}
        {parsed_data.unstructuredData.responsibilities.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
              Responsibilities
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {parsed_data.unstructuredData.responsibilities.map((r, i) => (
                <Typography key={i} component="li" variant="body2" color="text.secondary">
                  {r}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Perks */}
        {parsed_data.unstructuredData.perks.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
              Perks & Benefits
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {parsed_data.unstructuredData.perks.map((p, i) => (
                <Typography key={i} component="li" variant="body2" color="text.secondary">
                  {p}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onParseAnother}
          sx={{ fontWeight: 600 }}
        >
          Parse Another JD
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate(`/admin/jobs/${result.job_id}/verify`)}
          sx={{ fontWeight: 600 }}
        >
          Review & Publish
        </Button>
      </Box>
    </Box>
  );
}
