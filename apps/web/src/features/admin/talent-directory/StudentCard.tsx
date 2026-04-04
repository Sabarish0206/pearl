import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { StudentRecord } from '../../../api/students.api';

interface StudentCardProps {
  student: StudentRecord;
  searchedSkills?: string[];
}

export default function StudentCard({ student, searchedSkills = [] }: StudentCardProps) {
  const fullName = `${student.firstName} ${student.lastName}`;
  const cgpaDisplay = student.cgpa !== null ? student.cgpa.toFixed(2) : '—';

  const normalizedSearchedSkills = searchedSkills.map((s) => s.toLowerCase().trim());

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.3)',
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              noWrap
              title={fullName}
            >
              {fullName}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
              {student.registerNumber}
            </Typography>
          </Box>
          {student.isPlaced && (
            <Chip
              icon={<CheckCircleIcon fontSize="small" />}
              label="Placed"
              size="small"
              color="success"
              sx={{ flexShrink: 0, fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Dept + CGPA */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {student.department}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.disabled">
            ·
          </Typography>
          <Box>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ mr: 0.5 }}
            >
              CGPA
            </Typography>
            <Typography
              component="span"
              variant="body2"
              fontWeight={700}
              color={
                student.cgpa !== null && student.cgpa >= 8
                  ? 'success.main'
                  : student.cgpa !== null && student.cgpa >= 6
                    ? 'primary.main'
                    : 'text.primary'
              }
            >
              {cgpaDisplay}
            </Typography>
          </Box>
          {student.activeArrears !== null && student.activeArrears > 0 && (
            <>
              <Typography variant="body2" color="text.disabled">
                ·
              </Typography>
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                {student.activeArrears} arrear{student.activeArrears > 1 ? 's' : ''}
              </Typography>
            </>
          )}
        </Box>

        {/* Skills */}
        {student.skills.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto', pt: 0.5 }}>
            {student.skills.map((skill) => {
              const isMatching = normalizedSearchedSkills.includes(skill.toLowerCase().trim());
              return (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  color={isMatching ? 'primary' : 'default'}
                  sx={{ fontSize: '0.7rem' }}
                />
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
