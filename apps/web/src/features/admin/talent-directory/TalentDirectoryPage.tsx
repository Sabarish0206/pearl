import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Drawer,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { searchStudents } from '../../../api/students.api';
import type { StudentRecord } from '../../../api/students.api';
import { useDebounce } from '../../../hooks/useDebounce';
import FilterPanel from './FilterPanel';
import type { FilterState } from './types';
import { INITIAL_FILTERS } from './types';
import StudentCard from './StudentCard';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#06b6d4' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#0f172a', paper: '#111827' },
    divider: '#1e293b',
    text: { primary: '#e2e8f0', secondary: '#94a3b8', disabled: '#475569' },
  },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none', backgroundColor: '#111827', borderRight: '1px solid #1e293b' },
      },
    },
  },
});

const RESULTS_PER_PAGE = 12;
const FILTER_DRAWER_WIDTH = 320;

function CardSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>
        <Skeleton variant="rounded" width={70} height={24} />
      </Box>
      <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Skeleton variant="rounded" width={60} height={22} />
        <Skeleton variant="rounded" width={70} height={22} />
        <Skeleton variant="rounded" width={50} height={22} />
      </Box>
    </Paper>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 10,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(99,102,241,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} color="text.primary">
        No students found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        No students match these exact criteria. Try adjusting your filters.
      </Typography>
    </Box>
  );
}

export default function TalentDirectoryPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);

  const fetchStudents = useCallback(async (f: FilterState, p: number) => {
    setIsLoading(true);
    try {
      const payload = {
        ...(f.skills.length > 0 && { skills: f.skills }),
        ...(f.minCgpa > 0 && { minCgpa: f.minCgpa }),
        ...(f.maxActiveArrears !== undefined && { maxActiveArrears: f.maxActiveArrears }),
        ...(f.departments.length > 0 && { departments: f.departments }),
        page: p,
        limit: RESULTS_PER_PAGE,
      };
      const data = await searchStudents(payload);
      setStudents(data.students);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error('[TalentDirectory] Search failed:', err);
      setStudents([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  // Fetch when debouncedFilters or page changes
  useEffect(() => {
    void fetchStudents(debouncedFilters, page);
  }, [debouncedFilters, page, fetchStudents]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterPanel = (
    <FilterPanel filters={filters} onChange={handleFiltersChange} />
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Top Bar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Tooltip title="Back to dashboard">
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <PeopleAltIcon sx={{ color: 'primary.main', fontSize: 26, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2} noWrap>
                Global Talent Directory
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Placement Coordinator · Student Search Engine
              </Typography>
            </Box>
          </Box>

          {isMobile && (
            <Tooltip title="Toggle filters">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: FILTER_DRAWER_WIDTH,
                p: 2,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Filters
              </Typography>
              <Button size="small" onClick={() => setDrawerOpen(false)} color="inherit">
                Close
              </Button>
            </Box>
            {filterPanel}
          </Drawer>
        )}

        {/* Main Layout */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            maxWidth: 1600,
            mx: 'auto',
          }}
        >
          {/* Sidebar — desktop only */}
          {!isMobile && (
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <Box sx={{ position: 'sticky', top: 72 }}>
                {filterPanel}
              </Box>
            </Box>
          )}

          {/* Results Area */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Results Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {isInitialLoad ? (
                    <Skeleton width={200} />
                  ) : isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} thickness={5} />
                      <span>Searching…</span>
                    </Box>
                  ) : (
                    `Showing ${total.toLocaleString()} matching student${total !== 1 ? 's' : ''}`
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Grid */}
            {isInitialLoad || isLoading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {Array.from({ length: RESULTS_PER_PAGE }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </Box>
            ) : students.length === 0 ? (
              <EmptyState />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    searchedSkills={filters.skills}
                  />
                ))}
              </Box>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
