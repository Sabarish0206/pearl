import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchResume, parseResume, commitResume } from '../../api/resume.api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { ParsedResumeData, ResumeRow } from '@pearl/common';
import './ResumeSection.css';

type ResumeUIState = 'loading' | 'not_uploaded' | 'parsing' | 'draft' | 'saving' | 'verified';

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

export default function ResumeSection() {
  const [uiState, setUiState] = useState<ResumeUIState>('loading');
  const [draftData, setDraftData] = useState<DraftFormData | null>(null);
  const [verifiedData, setVerifiedData] = useState<ResumeRow | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const populateDraft = useCallback((row: ResumeRow) => {
    const pd = row.parsedData;
    setDraftData({
      resume_id: row.id,
      ats_score: row.atsScore ?? 0,
      cgpa: pd?.cgpa ?? null,
      active_arrears: pd?.active_arrears ?? null,
      history_of_arrears: pd?.history_of_arrears ?? null,
      tenth_mark: pd?.tenth_mark ?? null,
      twelfth_mark: pd?.twelfth_mark ?? null,
      skills: pd?.skills ?? [],
      education: pd?.education ?? [],
      projects: pd?.projects ?? [],
      certifications: pd?.certifications ?? [],
      experience: pd?.experience ?? [],
      achievements: pd?.achievements ?? [],
    });
    setUiState('draft');
  }, []);

  const loadResume = useCallback(async () => {
    setUiState('loading');
    try {
      const result = await fetchResume();
      if (result.status === 'NOT_UPLOADED') {
        setUiState('not_uploaded');
      } else if (result.status === 'DRAFT' && result.data) {
        populateDraft(result.data);
      } else if (result.status === 'VERIFIED' && result.data) {
        setVerifiedData(result.data);
        setUiState('verified');
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      toast.error('Failed to load resume. Please try again.');
      setUiState('not_uploaded');
    }
  }, [populateDraft]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted. Please upload a valid PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5 MB.');
      return;
    }

    setUiState('parsing');
    try {
      const result = await parseResume(file);
      const partialRow: ResumeRow = {
        id: result.resume_id,
        studentId: '',
        filePath: '',
        atsScore: result.parsed_data.ats_score,
        parsedData: result.parsed_data,
        isVerified: false,
      };
      populateDraft(partialRow);
      toast.success('Resume parsed successfully! Please review the data below.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to parse resume. Please try again.'
      );
      setUiState('not_uploaded');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSubmitDraft = async () => {
    if (!draftData) return;

    setIsSaving(true);
    try {
      const payload = {
        resume_id: draftData.resume_id,
        ats_score: draftData.ats_score,
        cgpa: draftData.cgpa,
        active_arrears: draftData.active_arrears,
        history_of_arrears: draftData.history_of_arrears,
        tenth_mark: draftData.tenth_mark,
        twelfth_mark: draftData.twelfth_mark,
        skills: draftData.skills,
        education: draftData.education,
        projects: draftData.projects,
        certifications: draftData.certifications,
        experience: draftData.experience,
        achievements: draftData.achievements,
      };

      await commitResume(payload);
      setVerifiedData({
        id: draftData.resume_id,
        studentId: '',
        filePath: '',
        atsScore: draftData.ats_score,
        parsedData: {
          ats_score: draftData.ats_score,
          cgpa: draftData.cgpa,
          active_arrears: draftData.active_arrears,
          history_of_arrears: draftData.history_of_arrears,
          tenth_mark: draftData.tenth_mark,
          twelfth_mark: draftData.twelfth_mark,
          skills: draftData.skills,
          education: draftData.education,
          projects: draftData.projects,
          certifications: draftData.certifications,
          experience: draftData.experience,
          achievements: draftData.achievements,
        },
        isVerified: true,
      });
      setDraftData(null);
      setUiState('verified');
      setIsSaving(false);
      toast.success('Resume verified and saved successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save resume.');
      setIsSaving(false);
    }
  };

  return (
    <section>
      <ToastContainer position="top-right" autoClose={4000} />

      {uiState === 'loading' && (
        <div className="profile-card profile-resume">
          <div className="skeleton-loader">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      )}

      {uiState === 'not_uploaded' && (
        <div className="profile-card profile-resume">
          <div className="resume-upload-area">
            <h3>📄 Upload Your Resume</h3>
            <p className="upload-subtitle">
              Upload a PDF resume to get started with placement opportunities
            </p>

            <div
              className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📤</div>
              <p className="upload-main-text">Drag and drop your PDF here</p>
              <p className="upload-sub-text">or click to browse</p>
              <p className="upload-hint">Maximum file size: 5 MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {uiState === 'parsing' && (
        <div className="profile-card profile-resume">
          <div className="resume-parsing">
            <div className="spinner"></div>
            <h3>Parsing your resume...</h3>
            <p>This may take a moment while our AI analyzes your resume</p>
          </div>
        </div>
      )}

      {uiState === 'draft' && draftData && (
        <div className="profile-card profile-resume">
          <div className="resume-draft">
            <h3>✨ Resume Preview & Confirmation</h3>
            <p className="draft-subtitle">
              Please review the parsed data below. Make corrections if needed, then confirm.
            </p>

            <div className="draft-grid">
              <div className="draft-item">
                <label>ATS Score</label>
                <div className="ats-score">
                  <span className="score-circle">{draftData.ats_score}</span>
                  <span className="score-text">/100</span>
                </div>
              </div>

              <div className="draft-item">
                <label>CGPA</label>
                <span>{draftData.cgpa?.toFixed(2) ?? 'Not found'}</span>
              </div>

              <div className="draft-item">
                <label>Active Arrears</label>
                <span>{draftData.active_arrears ?? 'None'}</span>
              </div>

              <div className="draft-item">
                <label>History of Arrears</label>
                <span>{draftData.history_of_arrears ?? 'None'}</span>
              </div>

              <div className="draft-item">
                <label>10th Mark</label>
                <span>{draftData.tenth_mark?.toFixed(1) ?? 'Not found'}</span>
              </div>

              <div className="draft-item">
                <label>12th Mark</label>
                <span>{draftData.twelfth_mark?.toFixed(1) ?? 'Not found'}</span>
              </div>
            </div>

            <div className="draft-section">
              <h4>Skills ({draftData.skills.length})</h4>
              <div className="skills-list">
                {draftData.skills.length > 0 ? (
                  draftData.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-data">No skills found</p>
                )}
              </div>
            </div>

            <div className="draft-section">
              <h4>Education ({draftData.education.length})</h4>
              {draftData.education.length > 0 ? (
                draftData.education.map((edu, idx) => (
                  <div key={idx} className="entry-card">
                    <div className="entry-header">
                      <strong>{edu.degree}</strong>
                      <span className="entry-duration">{edu.start_year} - {edu.end_year}</span>
                    </div>
                    <p className="entry-subtitle">{edu.institution}</p>
                    <p className="entry-detail">Score: {edu.score}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No education records found</p>
              )}
            </div>

            <div className="draft-section">
              <h4>Experience ({draftData.experience.length})</h4>
              {draftData.experience.length > 0 ? (
                draftData.experience.map((exp, idx) => (
                  <div key={idx} className="entry-card">
                    <div className="entry-header">
                      <strong>{exp.role}</strong>
                      <span className="entry-duration">{exp.duration}</span>
                    </div>
                    <p className="entry-subtitle">{exp.company}</p>
                    <p className="entry-detail">{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No experience found</p>
              )}
            </div>

            <div className="draft-section">
              <h4>Projects ({draftData.projects.length})</h4>
              {draftData.projects.length > 0 ? (
                draftData.projects.map((proj, idx) => (
                  <div key={idx} className="entry-card">
                    <div className="entry-header">
                      <strong>{proj.title}</strong>
                    </div>
                    <p className="entry-detail">{proj.description}</p>
                    <p className="entry-tech">
                      <strong>Tech:</strong> {proj.technologies.join(', ')}
                    </p>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link">
                        View Project →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No projects found</p>
              )}
            </div>

            <div className="draft-section">
              <h4>Certifications ({draftData.certifications.length})</h4>
              {draftData.certifications.length > 0 ? (
                draftData.certifications.map((cert, idx) => (
                  <div key={idx} className="entry-card">
                    <div className="entry-header">
                      <strong>{cert.name}</strong>
                      <span className="entry-duration">{cert.date}</span>
                    </div>
                    <p className="entry-subtitle">Issued by {cert.issuer}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No certifications found</p>
              )}
            </div>

            <div className="draft-section">
              <h4>Achievements ({draftData.achievements.length})</h4>
              {draftData.achievements.length > 0 ? (
                <div className="achievements-list">
                  {draftData.achievements.map((achievement, idx) => (
                    <p key={idx} className="achievement-item">• {achievement}</p>
                  ))}
                </div>
              ) : (
                <p className="no-data">No achievements found</p>
              )}
            </div>

            <div className="draft-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setUiState('not_uploaded');
                  setDraftData(null);
                }}
                disabled={isSaving}
              >
                ← Upload Different Resume
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitDraft}
                disabled={isSaving}
              >
                {isSaving ? 'Confirming...' : '✓ Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {uiState === 'verified' && verifiedData && (
        <div className="profile-card profile-resume profile-resume-verified">
          <div className="verified-header">
            <div className="verified-badge">✅ VERIFIED</div>
            <button
              className="btn-small"
              onClick={() => {
                setUiState('not_uploaded');
                setVerifiedData(null);
                setDraftData(null);
              }}
            >
              Upload New Resume
            </button>
          </div>

          <h3>Your Resume</h3>

          <div className="verified-grid">
            <div className="verified-stat">
              <span className="stat-label">ATS Score</span>
              <span className="stat-value">{verifiedData.atsScore}/100</span>
            </div>
            <div className="verified-stat">
              <span className="stat-label">Status</span>
              <span className="stat-value">Ready for Placements</span>
            </div>
          </div>

          {verifiedData.parsedData?.skills && verifiedData.parsedData.skills.length > 0 && (
            <div className="verified-section">
              <h4>Skills</h4>
              <div className="skills-compact">
                {verifiedData.parsedData.skills.slice(0, 8).map((skill, idx) => (
                  <span key={idx} className="skill-tag-small">
                    {skill}
                  </span>
                ))}
                {verifiedData.parsedData.skills.length > 8 && (
                  <span className="skill-tag-small more-skills">
                    +{verifiedData.parsedData.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
