import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnalytics } from '../../api/recruiter.api';
import { fetchJobs } from '../../api/job.api';
import type { PlacementAnalytics, JobRequirementRow } from '@pearl/common';
import { BarChart, HorizontalBar } from '../../components/Charts';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import './RecruiterDashboard.css';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PlacementAnalytics | null>(null);
  const [jobs, setJobs] = useState<JobRequirementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchJobs()])
      .then(([a, j]) => { setAnalytics(a); setJobs(j); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rdash-loading">
        <div className="rdash-spinner" />
        <p>Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rdash-error">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const a = analytics!;
  const deptBarData = a.departmentBreakdown.slice(0, 8).map((d) => ({
    label: d.department.replace('Computer ', 'CS').replace('Information ', 'IT').replace('Electronics', 'ECE'),
    value: d.count,
  }));
  const maxSkillCount = Math.max(...a.skillDistribution.map((s) => s.count), 1);

  return (
    <div className="rdash">
      {/* Summary Stats */}
      <div className="rdash-grid-4">
        <div className="rdash-stat-card primary">
          <div className="rdash-stat-icon"><PeopleIcon /></div>
          <div>
            <p className="rdash-stat-label">Total Students</p>
            <p className="rdash-stat-value">{a.totalStudents}</p>
          </div>
        </div>
        <div className="rdash-stat-card success">
          <div className="rdash-stat-icon"><VerifiedIcon /></div>
          <div>
            <p className="rdash-stat-label">Verified Profiles</p>
            <p className="rdash-stat-value">{a.studentsVerified}</p>
          </div>
        </div>
        <div className="rdash-stat-card purple">
          <div className="rdash-stat-icon"><TrendingUpIcon /></div>
          <div>
            <p className="rdash-stat-label">Avg ATS Score</p>
            <p className="rdash-stat-value">{a.averageAtsScore}</p>
          </div>
        </div>
        <div className="rdash-stat-card orange">
          <div className="rdash-stat-icon"><WorkIcon /></div>
          <div>
            <p className="rdash-stat-label">Active Jobs</p>
            <p className="rdash-stat-value">{jobs.filter((j) => j.isActive).length}</p>
          </div>
        </div>
      </div>

      <div className="rdash-grid-2">
        {/* Department Breakdown */}
        <div className="rdash-card">
          <div className="rdash-card-header">
            <h3 className="rdash-card-title">Students by Department</h3>
          </div>
          {deptBarData.length > 0 ? (
            <BarChart data={deptBarData} height={180} />
          ) : (
            <p className="rdash-empty">No data yet</p>
          )}
        </div>

        {/* CGPA Distribution */}
        <div className="rdash-card">
          <div className="rdash-card-header">
            <h3 className="rdash-card-title">CGPA Distribution</h3>
          </div>
          {a.cgpaDistribution.some((d) => d.count > 0) ? (
            <BarChart
              data={a.cgpaDistribution.map((d) => ({ label: d.range, value: d.count }))}
              height={180}
            />
          ) : (
            <p className="rdash-empty">No CGPA data yet</p>
          )}
        </div>
      </div>

      {/* Skill Distribution */}
      <div className="rdash-card">
        <div className="rdash-card-header">
          <h3 className="rdash-card-title">Top Skills Among Students</h3>
          <span className="rdash-badge">Top 10</span>
        </div>
        {a.skillDistribution.length > 0 ? (
          <div className="rdash-skills-bars">
            {a.skillDistribution.map((s, i) => (
              <HorizontalBar
                key={i}
                label={s.skill}
                value={s.count}
                maxValue={maxSkillCount}
                color={`hsl(${(i * 36) % 360}, 65%, 55%)`}
              />
            ))}
          </div>
        ) : (
          <p className="rdash-empty">No skill data yet. Students need to upload resumes.</p>
        )}
      </div>

      {/* Active Jobs */}
      <div className="rdash-card">
        <div className="rdash-card-header">
          <h3 className="rdash-card-title">Active Job Listings</h3>
          <button className="rdash-btn-primary" onClick={() => navigate('/recruiter/jobs/new')}>
            <AddIcon fontSize="small" /> Post Job
          </button>
        </div>
        {jobs.length === 0 ? (
          <div className="rdash-empty-jobs">
            <p>No job listings yet.</p>
            <button className="rdash-btn-outline" onClick={() => navigate('/recruiter/jobs/new')}>
              + Create your first job posting
            </button>
          </div>
        ) : (
          <div className="rdash-jobs-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Departments</th>
                  <th>Min CGPA</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td className="rdash-job-title">{job.title}</td>
                    <td>{job.companyName}</td>
                    <td><span className="rdash-dept-list">{job.eligibleDepts.slice(0, 2).join(', ')}{job.eligibleDepts.length > 2 ? ` +${job.eligibleDepts.length - 2}` : ''}</span></td>
                    <td>{job.minCgpa ?? '—'}</td>
                    <td><span className={`rdash-status-pill ${job.isActive ? 'active' : 'inactive'}`}>{job.isActive ? 'Active' : 'Closed'}</span></td>
                    <td>
                      <button className="rdash-link-btn" onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}>
                        Shortlist →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length > 5 && (
              <button className="rdash-view-all" onClick={() => navigate('/recruiter/jobs')}>
                View all {jobs.length} jobs →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
