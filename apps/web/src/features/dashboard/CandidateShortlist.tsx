import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchShortlist, fetchJob } from '../../api/job.api';
import type { ShortlistedCandidate, JobRequirementRow } from '@pearl/common';
import { DonutChart } from '../../components/Charts';
import PortalLayout from '../../components/PortalLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import './CandidateShortlist.css';

export default function CandidateShortlist() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
  const [job, setJob] = useState<JobRequirementRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([fetchShortlist(jobId), fetchJob(jobId)])
      .then(([c, j]) => { setCandidates(c); setJob(j); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const filtered = candidates.filter((c) => {
    const name = `${c.firstName} ${c.lastName} ${c.registerNumber} ${c.department}`.toLowerCase();
    return name.includes(search.toLowerCase()) && c.compositeScore >= minScore;
  });

  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Register No', 'Department', 'Email', 'CGPA', 'ATS Score', 'Skill Match %', 'Composite Score'];
    const rows = filtered.map((c) => [
      c.rank, `${c.firstName} ${c.lastName}`, c.registerNumber, c.department, c.email,
      c.cgpa ?? 'N/A', c.atsScore ?? 'N/A', `${c.skillMatchPct}%`, c.compositeScore,
    ]);
    const escapeCsvValue = (value: unknown): string => {
      const str = value == null ? '' : String(value);
      const needsQuoting = /[",\n\r]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuoting ? `"${escaped}"` : escaped;
    };
    const csv = [headers, ...rows]
      .map((r) => r.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlist-${job?.title ?? 'job'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="cs-loading"><div className="cs-spinner" /><p>Loading shortlist…</p></div>;
  }

  if (error) {
    return <div className="cs-error"><p>⚠️ {error}</p><button onClick={() => navigate(-1)}>← Back</button></div>;
  }

  return (
    <PortalLayout title={job ? `Shortlist: ${job.title}` : 'Candidate Shortlist'}>
      {/* Header */}
      <div className="cs-header">
        <button className="cs-back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="small" /> Back
        </button>
        <div className="cs-header-info">
          <h2 className="cs-job-title">{job?.title}</h2>
          <p className="cs-job-company">{job?.companyName}</p>
        </div>
        <button className="cs-export-btn" onClick={handleExportCSV} disabled={filtered.length === 0}>
          <DownloadIcon fontSize="small" /> Export CSV
        </button>
      </div>

      {/* Job criteria summary */}
      {job && (
        <div className="cs-criteria">
          <div className="cs-criterion">
            <span className="cs-criterion-label">Required Skills</span>
            <div className="cs-skill-chips">
              {job.requiredSkills.slice(0, 5).map((s, i) => <span key={i} className="cs-skill-chip">{s}</span>)}
              {job.requiredSkills.length > 5 && <span className="cs-skill-chip more">+{job.requiredSkills.length - 5}</span>}
            </div>
          </div>
          <div className="cs-criterion">
            <span className="cs-criterion-label">Min CGPA</span>
            <span className="cs-criterion-value">{job.minCgpa ?? 'Any'}</span>
          </div>
          <div className="cs-criterion">
            <span className="cs-criterion-label">Max Arrears</span>
            <span className="cs-criterion-value">{job.maxArrears ?? 'Any'}</span>
          </div>
          <div className="cs-criterion">
            <span className="cs-criterion-label">Eligible Depts</span>
            <span className="cs-criterion-value">{job.eligibleDepts.length} dept(s)</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="cs-stats">
        <div className="cs-stat"><span className="cs-stat-num">{candidates.length}</span><span className="cs-stat-label">Eligible</span></div>
        <div className="cs-stat"><span className="cs-stat-num">{filtered.length}</span><span className="cs-stat-label">Filtered</span></div>
        <div className="cs-stat">
          <span className="cs-stat-num">
            {candidates.length > 0 ? Math.round(candidates.reduce((a, c) => a + c.compositeScore, 0) / candidates.length) : 0}
          </span>
          <span className="cs-stat-label">Avg Score</span>
        </div>
        <div className="cs-stat">
          <span className="cs-stat-num">
            {candidates.length > 0 ? Math.round(candidates.reduce((a, c) => a + c.skillMatchPct, 0) / candidates.length) : 0}%
          </span>
          <span className="cs-stat-label">Avg Skill Match</span>
        </div>
      </div>

      {/* Filters */}
      <div className="cs-filters">
        <input
          className="cs-search"
          placeholder="Search by name, register no, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="cs-score-filter">
          <label>Min Score: <strong>{minScore}</strong></label>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="cs-range"
          />
        </div>
      </div>

      {/* Candidate List */}
      {filtered.length === 0 ? (
        <div className="cs-empty">
          {candidates.length === 0
            ? '😕 No eligible candidates found for this job requirement.'
            : '🔍 No candidates match your current filters.'}
        </div>
      ) : (
        <div className="cs-list">
          {filtered.map((c) => (
            <div key={c.studentId} className={`cs-card ${c.rank <= 3 ? `top-${c.rank}` : ''}`}>
              <div className="cs-rank">
                <span className={`cs-rank-num ${c.rank <= 3 ? 'top' : ''}`}>#{c.rank}</span>
              </div>

              <div className="cs-candidate-info">
                <div className="cs-candidate-header">
                  <div>
                    <h4 className="cs-name">{c.firstName} {c.lastName}</h4>
                    <p className="cs-meta">{c.registerNumber} · {c.department} · Batch {c.batchYear}</p>
                    <p className="cs-email">{c.email}</p>
                  </div>
                  <div className="cs-composite-score">
                    <DonutChart value={c.compositeScore} size={64} strokeWidth={7} color={c.compositeScore >= 70 ? '#10b981' : c.compositeScore >= 50 ? '#f59e0b' : '#ef4444'} />
                    <div>
                      <p className="cs-score-num">{c.compositeScore}</p>
                      <p className="cs-score-label">Score</p>
                    </div>
                  </div>
                </div>

                <div className="cs-metrics">
                  <div className="cs-metric">
                    <span className="cs-metric-label">CGPA</span>
                    <span className="cs-metric-value">{c.cgpa?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="cs-metric">
                    <span className="cs-metric-label">ATS Score</span>
                    <span className="cs-metric-value">{c.atsScore ?? 'N/A'}</span>
                  </div>
                  <div className="cs-metric">
                    <span className="cs-metric-label">Arrears</span>
                    <span className="cs-metric-value">{c.activeArrears ?? 0}</span>
                  </div>
                  <div className="cs-metric">
                    <span className="cs-metric-label">Skill Match</span>
                    <span className={`cs-metric-value ${c.skillMatchPct >= 70 ? 'good' : c.skillMatchPct >= 40 ? 'avg' : 'poor'}`}>
                      {c.skillMatchPct}%
                    </span>
                  </div>
                </div>

                {c.matchedSkills.length > 0 && (
                  <div className="cs-matched-skills">
                    <span className="cs-skills-label">Matched:</span>
                    {c.matchedSkills.slice(0, 6).map((s, i) => (
                      <span key={i} className="cs-matched-chip">{s}</span>
                    ))}
                    {c.matchedSkills.length > 6 && <span className="cs-matched-chip more">+{c.matchedSkills.length - 6}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
