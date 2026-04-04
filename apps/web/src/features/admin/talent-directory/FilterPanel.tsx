import React from 'react';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Slider,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import type { FilterState } from './types';
import { INITIAL_FILTERS } from './types';

const DEPARTMENT_OPTIONS = [
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'IT',
  'AIDS',
  'AIML',
  'CSD',
  'MCT',
];

const SKILL_SUGGESTIONS = [
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Deep Learning',
  'Data Science',
  'C++',
  'C',
  'Go',
  'Rust',
  'AWS',
  'Azure',
  'Git',
];

const ARREARS_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const handleSkillsChange = (_: React.SyntheticEvent, newValue: string[]) => {
    onChange({ ...filters, skills: newValue });
  };

  const handleCgpaChange = (_: Event, value: number | number[]) => {
    onChange({ ...filters, minCgpa: Array.isArray(value) ? value[0] : value });
  };

  const handleArrearsChange = (event: { target: { value: unknown } }) => {
    const val = event.target.value;
    onChange({
      ...filters,
      maxActiveArrears: val === '' ? undefined : (val as number),
    });
  };

  const handleDepartmentsChange = (_: React.SyntheticEvent, newValue: string[]) => {
    onChange({ ...filters, departments: newValue });
  };

  const handleClearAll = () => {
    onChange(INITIAL_FILTERS);
  };

  const arrearsValue = filters.maxActiveArrears === undefined ? '' : filters.maxActiveArrears;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Filters
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearAll}
          sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5 }}
        >
          Clear All
        </Button>
      </Box>

      {/* Skills */}
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
          Skills
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={SKILL_SUGGESTIONS}
          value={filters.skills}
          onChange={handleSkillsChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                size="small"
                color="primary"
                {...getTagProps({ index })}
                key={`${option}-${index}`}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={filters.skills.length === 0 ? 'e.g. React, Python…' : ''}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}
        />
      </Box>

      {/* Minimum CGPA */}
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
          Minimum CGPA:{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {filters.minCgpa.toFixed(1)}
          </Box>
        </Typography>
        <Slider
          value={filters.minCgpa}
          onChange={handleCgpaChange}
          min={0}
          max={10}
          step={0.1}
          valueLabelDisplay="auto"
          sx={{ color: 'primary.main' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1 }}>
          <Typography variant="caption" color="text.disabled">
            0.0
          </Typography>
          <Typography variant="caption" color="text.disabled">
            10.0
          </Typography>
        </Box>
      </Box>

      {/* Active Arrears */}
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
          Max Active Arrears
        </Typography>
        <Select
          value={arrearsValue}
          onChange={handleArrearsChange}
          size="small"
          fullWidth
          displayEmpty
          sx={{ borderRadius: 2 }}
          renderValue={(selected: unknown) => {
            if (selected === '' || selected === undefined) return <em style={{ color: 'inherit' }}>Any</em>;
            if (selected === 4) return '4+';
            return String(selected);
          }}
        >
          {ARREARS_OPTIONS.map((opt) => (
            <MenuItem key={String(opt.value)} value={opt.value === undefined ? '' : opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Departments */}
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
          Departments
        </Typography>
        <Autocomplete
          multiple
          options={DEPARTMENT_OPTIONS}
          value={filters.departments}
          onChange={handleDepartmentsChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                size="small"
                color="secondary"
                {...getTagProps({ index })}
                key={`${option}-${index}`}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={filters.departments.length === 0 ? 'All departments' : ''}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}
        />
      </Box>
    </Paper>
  );
}
