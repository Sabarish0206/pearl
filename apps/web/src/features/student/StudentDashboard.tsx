import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { fetchResume } from '../../api/resume.api';
import type { ResumeRow } from '@pearl/common';
import { DonutChart } from '../../components/Charts';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [resume, setResume] = useState<ResumeRow | null>(null);
  const [resumeStatus, setResumeStatus] = useState<'loading' | 'NOT_UPLOADED' | 'DRAFT' | 'VERIFIED'>('loading');

  useEffect(() => {
    fetchResume().then((res) => {
      setResumeStatus(res.status);
      if (res.data) setResume(res.data);
    }).catch(() => setResumeStatus('NOT_UPLOADED'));
  }, []);

  const pd = resume?.parsedData;
  const atsScore = resume?.atsScore ?? 0;
  const completionItems = [
    { label: 'Resume uploaded', done: resumeStatus !== 'NOT_UPLOADED' },
    { label: 'Resume verified', done: resumeStatus === 'VERIFIED' },
    { label: 'Skills added', done: (pd?.skills?.length ?? 0) > 0 },
    { label: 'Education filled', done: (pd?.education?.length ?? 0) > 0 },
    { label: 'Projects added', done: (pd?.projects?.length ?? 0) > 0 },
    { label: 'Certifications', done: (pd?.certifications?.length ?? 0) > 0 },
  ];
  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  return (
    <div className="student-dash">
      {/* Welcome */}
      <div className="sdash-welcome">
        <div>
          <h2 className="sdash-greeting">Welcome back, {currentUser?.email?.split('@')[0]}! 👋</h2>
          <p className="sdash-subtitle">Here's your placement readiness overview</p>
        </div>
        <span className={`sdash-status-badge ${resumeStatus === 'VERIFIED' ? 'verified' : resumeStatus === 'DRAFT' ? 'draft' : 'pending'}`}>
          {resumeStatus === 'VERIFIED' ? '✅ Profile Verified' : resumeStatus === 'DRAFT' ? '⏳ Draft Saved' : '⚠️ Setup Incomplete'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="sdash-grid-4">
        <div className="sdash-stat-card">
          <div className="sdash-stat-icon ats"><DescriptionIcon /></div>
          <div>
            <p className="sdash-stat-label">ATS Score</p>
            <p className="sdash-stat-value">{resumeStatus === 'loading' ? '—' : resumeStatus === 'NOT_UPLOADED' ? 'N/A' : `${atsScore}/100`}</p>
          </div>
        </div>
        <div className="sdash-stat-card">
          <div className="sdash-stat-icon skills"><StarIcon /></div>
          <div>
            <p className="sdash-stat-label">Skills</p>
            <p className="sdash-stat-value">{pd?.skills?.length ?? '—'}</p>
          </div>
        </div>
        <div className="sdash-stat-card">
          <div className="sdash-stat-icon projects"><WorkIcon /></div>
          <div>
            <p className="sdash-stat-label">Projects</p>
            <p className="sdash-stat-value">{pd?.projects?.length ?? '—'}</p>
          </div>
        </div>
        <div className="sdash-stat-card">
          <div className="sdash-stat-icon edu"><SchoolIcon /></div>
          <div>
            <p className="sdash-stat-label">CGPA</p>
            <p className="sdash-stat-value">{pd?.cgpa?.toFixed(2) ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="sdash-grid-2">
        {/* Profile Completion */}
        <div className="sdash-card">
          <h3 className="sdash-card-title">Profile Completion</h3>
          <div className="sdash-completion-header">
            <DonutChart value={completionPct} size={80} color={completionPct === 100 ? '#10b981' : '#4f46e5'} />
            <div>
              <p className="sdash-completion-pct">{completionPct}%</p>
              <p className="sdash-completion-label">Complete</p>
            </div>
          </div>
          <div className="sdash-checklist">
            {completionItems.map((item, i) => (
              <div key={i} className={`sdash-check-item ${item.done ? 'done' : ''}`}>
                <span className="sdash-check-icon">{item.done ? '✓' : '○'}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          {resumeStatus !== 'VERIFIED' && (
            <button className="sdash-action-btn" onClick={() => navigate('/resume')}>
              {resumeStatus === 'NOT_UPLOADED' ? '📤 Upload Resume' : '✏️ Complete Profile'}
            </button>
          )}
        </div>

        {/* ATS Score & Skills */}
        <div className="sdash-card">
          <h3 className="sdash-card-title">ATS Score Breakdown</h3>
          {resumeStatus === 'loading' ? (
            <div className="sdash-loading">Loading…</div>
          ) : resumeStatus === 'NOT_UPLOADED' ? (
            <div className="sdash-empty-state">
              <p>Upload your resume to get an ATS score</p>
              <button className="sdash-action-btn" onClick={() => navigate('/resume')}>Upload Resume →</button>
            </div>
          ) : (
            <>
              <div className="sdash-ats-display">
                <DonutChart value={atsScore} size={100} strokeWidth={12} color={atsScore >= 70 ? '#10b981' : atsScore >= 50 ? '#f59e0b' : '#ef4444'} />
                <div className="sdash-ats-info">
                  <p className="sdash-ats-score">{atsScore}</p>
                  <p className="sdash-ats-label">out of 100</p>
                  <p className={`sdash-ats-grade ${atsScore >= 70 ? 'good' : atsScore >= 50 ? 'avg' : 'poor'}`}>
                    {atsScore >= 70 ? '🟢 Good' : atsScore >= 50 ? '🟡 Average' : '🔴 Needs Work'}
                  </p>
                </div>
              </div>
              {resumeStatus === 'VERIFIED' && <div className="sdash-verified-badge"><VerifiedIcon fontSize="small" /> Verified for Placements</div>}
            </>
          )}
          {pd?.skills && pd.skills.length > 0 && (
            <div className="sdash-skills-section">
              <p className="sdash-skills-header">Top Skills</p>
              <div className="sdash-skills-list">
                {pd.skills.slice(0, 8).map((s, i) => <span key={i} className="sdash-skill-tag">{s}</span>)}
                {pd.skills.length > 8 && <span className="sdash-skill-tag more">+{pd.skills.length - 8}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sdash-card">
        <h3 className="sdash-card-title">Quick Actions</h3>
        <div className="sdash-actions-grid">
          <button className="sdash-quick-btn" onClick={() => navigate('/profile')}>
            <span>👤</span><span>View Profile</span>
          </button>
          <button className="sdash-quick-btn" onClick={() => navigate('/resume')}>
            <span>📄</span><span>Manage Resume</span>
          </button>
          <button className="sdash-quick-btn" onClick={() => navigate('/dashboard')}>
            <span>💼</span><span>Browse Jobs</span>
          </button>
          <button className="sdash-quick-btn" onClick={() => navigate('/dashboard')}>
            <span>📊</span><span>My Applications</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {pd?.experience && pd.experience.length > 0 && (
        <div className="sdash-card">
          <h3 className="sdash-card-title">Experience Highlights</h3>
          <div className="sdash-entries">
            {pd.experience.slice(0, 3).map((exp, i) => (
              <div key={i} className="sdash-entry">
                <div className="sdash-entry-header">
                  <strong>{exp.role}</strong>
                  <span className="sdash-entry-meta">{exp.duration}</span>
                </div>
                <p className="sdash-entry-sub">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
