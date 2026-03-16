import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { ParsedResumeData, ResumeRow } from '@pearl/common';
import { fetchResume, parseResume, commitResume } from '../../api/resume.api';

// ============================================================
// Types
// ============================================================
type UIState = 'loading' | 'not_uploaded' | 'parsing' | 'draft' | 'saving' | 'verified';

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

// ============================================================
// Helper Components
// ============================================================
function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: '80px',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function ResumePage() {
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<UIState>('loading');
  const [draftData, setDraftData] = useState<DraftFormData | null>(null);
  const [verifiedData, setVerifiedData] = useState<ResumeRow | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Populate draft state from a ResumeRow ----
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

  // ---- Initial load ----
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
    } catch {
      toast.error('Failed to load resume data. Please refresh the page or try again later.');
      setUiState('not_uploaded');
    }
  }, [populateDraft]);

  useEffect(() => {
    const init = async () => {
      await loadResume();
    };
    void init();
  }, [loadResume]);

  // ---- File upload handling ----
  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
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
      toast.success('Resume parsed successfully! Please review and confirm the data below.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse resume. Please ensure the file is a valid, readable PDF and try again.');
      setUiState('not_uploaded');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  // ---- Commit handling ----
  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftData) return;

    setUiState('saving');
    try {
      await commitResume({
        resume_id: draftData.resume_id,
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
      });
      toast.success('Resume verified and saved!');
      await loadResume();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save resume. Please check your connection and try again.');
      setUiState('draft');
    }
  };

  // ---- Render ----
  return (
    <div style={styles.page}>
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <PageHeader onBack={() => navigate('/dashboard')} />

      <div style={styles.container}>
        {uiState === 'loading' && <SkeletonLoader />}
        {uiState === 'not_uploaded' && (
          <DropzoneState
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onFileInput={handleFileInput}
          />
        )}
        {uiState === 'parsing' && <ParsingState />}
        {uiState === 'draft' && draftData && (
          <DraftForm
            data={draftData}
            onChange={setDraftData}
            onSubmit={handleCommit}
          />
        )}
        {uiState === 'saving' && (
          <div style={styles.centerBox}>
            <div style={styles.spinner} />
            <p style={styles.savingText}>Saving your verified resume...</p>
          </div>
        )}
        {uiState === 'verified' && verifiedData && (
          <VerifiedDashboard
            data={verifiedData}
            onReplace={() => {
              setVerifiedData(null);
              setDraftData(null);
              setUiState('not_uploaded');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.logo}>P</div>
        <div>
          <span style={styles.brandName}>Pearl</span>
          <p style={styles.brandSub}>Resume Processing</p>
        </div>
      </div>
      <button style={styles.btnSecondary} onClick={onBack}>← Dashboard</button>
    </header>
  );
}

function DropzoneState({
  isDragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={styles.dropzoneWrapper}>
      <h2 style={styles.sectionTitle}>Upload Your Resume</h2>
      <p style={styles.sectionDesc}>
        Our AI will parse your resume and extract key information for verification.
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF — click or press Enter/Space to browse files"
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {}),
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div style={styles.dropzoneIcon}>📄</div>
        <p style={styles.dropzoneText}>
          {isDragging ? 'Drop your PDF here' : 'Drag & drop your resume PDF here'}
        </p>
        <p style={styles.dropzoneSubText}>or click to browse</p>
        <span style={styles.badge}>PDF only · Max 5 MB</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={onFileInput}
        />
      </div>
    </div>
  );
}

function ParsingState() {
  return (
    <div style={styles.centerBox}>
      <div style={styles.spinner} />
      <h3 style={styles.parsingTitle}>Parsing Your Resume</h3>
      <p style={styles.parsingDesc}>
        Our AI is analyzing your resume. This may take a few seconds...
      </p>
      <SkeletonLoader />
    </div>
  );
}

function DraftForm({
  data,
  onChange,
  onSubmit,
}: {
  data: DraftFormData;
  onChange: (d: DraftFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const setField = <K extends keyof DraftFormData>(key: K, value: DraftFormData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const skillsStr = data.skills.join(', ');

  return (
    <form onSubmit={onSubmit} style={styles.draftForm}>
      <div style={styles.draftHeader}>
        <h2 style={styles.sectionTitle}>Review Parsed Data</h2>
        <p style={styles.sectionDesc}>
          Our AI has extracted the following information. Please review, edit if necessary, then submit.
        </p>
        <div style={styles.atsCard}>
          <span style={styles.atsLabel}>ATS Score</span>
          <span style={styles.atsScore}>{data.ats_score}</span>
          <span style={styles.atsMax}>/100</span>
        </div>
      </div>

      {/* Academic Metrics */}
      <Section title="Academic Metrics">
        <div style={styles.fieldGrid}>
          <FormField label="CGPA">
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={data.cgpa ?? ''}
              onChange={(e) => setField('cgpa', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 8.5"
            />
          </FormField>
          <FormField label="10th Mark (%)">
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.tenth_mark ?? ''}
              onChange={(e) => setField('tenth_mark', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 92.5"
            />
          </FormField>
          <FormField label="12th Mark (%)">
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.twelfth_mark ?? ''}
              onChange={(e) => setField('twelfth_mark', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="e.g. 88.0"
            />
          </FormField>
          <FormField label="Active Arrears">
            <input
              style={styles.input}
              type="number"
              min="0"
              value={data.active_arrears ?? ''}
              onChange={(e) => setField('active_arrears', e.target.value === '' ? null : parseInt(e.target.value, 10))}
              placeholder="0"
            />
          </FormField>
          <FormField label="History of Arrears">
            <input
              style={styles.input}
              type="number"
              min="0"
              value={data.history_of_arrears ?? ''}
              onChange={(e) => setField('history_of_arrears', e.target.value === '' ? null : parseInt(e.target.value, 10))}
              placeholder="0"
            />
          </FormField>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <textarea
          style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
          value={skillsStr}
          onChange={(e) =>
            setField(
              'skills',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="e.g. Python, React, Node.js, SQL"
        />
        <p style={styles.hint}>Separate skills with commas</p>
      </Section>

      {/* Education */}
      <Section title="Education">
        {data.education.map((edu, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{edu.institution || 'Institution'}</strong>
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => setField('education', data.education.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
            <div style={styles.fieldGrid}>
              <FormField label="Institution">
                <input style={styles.input} value={edu.institution} onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, institution: e.target.value };
                  setField('education', updated);
                }} />
              </FormField>
              <FormField label="Degree">
                <input style={styles.input} value={edu.degree} onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, degree: e.target.value };
                  setField('education', updated);
                }} />
              </FormField>
              <FormField label="Start Year">
                <input style={styles.input} value={edu.start_year} onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, start_year: e.target.value };
                  setField('education', updated);
                }} />
              </FormField>
              <FormField label="End Year">
                <input style={styles.input} value={edu.end_year} onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, end_year: e.target.value };
                  setField('education', updated);
                }} />
              </FormField>
              <FormField label="Score/CGPA">
                <input style={styles.input} value={edu.score} onChange={(e) => {
                  const updated = [...data.education];
                  updated[i] = { ...edu, score: e.target.value };
                  setField('education', updated);
                }} />
              </FormField>
            </div>
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={() =>
          setField('education', [...data.education, { institution: '', degree: '', start_year: '', end_year: '', score: '' }])
        }>
          + Add Education
        </button>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {data.experience.map((exp, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{exp.role || 'Role'} @ {exp.company || 'Company'}</strong>
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => setField('experience', data.experience.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
            <div style={styles.fieldGrid}>
              <FormField label="Role">
                <input style={styles.input} value={exp.role} onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, role: e.target.value };
                  setField('experience', updated);
                }} />
              </FormField>
              <FormField label="Company">
                <input style={styles.input} value={exp.company} onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, company: e.target.value };
                  setField('experience', updated);
                }} />
              </FormField>
              <FormField label="Duration">
                <input style={styles.input} value={exp.duration} onChange={(e) => {
                  const updated = [...data.experience];
                  updated[i] = { ...exp, duration: e.target.value };
                  setField('experience', updated);
                }} />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }} value={exp.description} onChange={(e) => {
                const updated = [...data.experience];
                updated[i] = { ...exp, description: e.target.value };
                setField('experience', updated);
              }} />
            </FormField>
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={() =>
          setField('experience', [...data.experience, { role: '', company: '', duration: '', description: '' }])
        }>
          + Add Experience
        </button>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {data.projects.map((proj, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{proj.title || 'Project'}</strong>
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => setField('projects', data.projects.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
            <div style={styles.fieldGrid}>
              <FormField label="Title">
                <input style={styles.input} value={proj.title} onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, title: e.target.value };
                  setField('projects', updated);
                }} />
              </FormField>
              <FormField label="Link">
                <input style={styles.input} value={proj.link ?? ''} placeholder="Optional" onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, link: e.target.value || null };
                  setField('projects', updated);
                }} />
              </FormField>
              <FormField label="Technologies">
                <input style={styles.input} value={proj.technologies.join(', ')} placeholder="React, Node.js..." onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) };
                  setField('projects', updated);
                }} />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }} value={proj.description} onChange={(e) => {
                const updated = [...data.projects];
                updated[i] = { ...proj, description: e.target.value };
                setField('projects', updated);
              }} />
            </FormField>
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={() =>
          setField('projects', [...data.projects, { title: '', description: '', technologies: [], link: null }])
        }>
          + Add Project
        </button>
      </Section>

      {/* Certifications */}
      <Section title="Certifications">
        {data.certifications.map((cert, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{cert.name || 'Certification'}</strong>
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => setField('certifications', data.certifications.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
            <div style={styles.fieldGrid}>
              <FormField label="Name">
                <input style={styles.input} value={cert.name} onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, name: e.target.value };
                  setField('certifications', updated);
                }} />
              </FormField>
              <FormField label="Issuer">
                <input style={styles.input} value={cert.issuer} onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, issuer: e.target.value };
                  setField('certifications', updated);
                }} />
              </FormField>
              <FormField label="Date">
                <input style={styles.input} value={cert.date} onChange={(e) => {
                  const updated = [...data.certifications];
                  updated[i] = { ...cert, date: e.target.value };
                  setField('certifications', updated);
                }} />
              </FormField>
            </div>
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={() =>
          setField('certifications', [...data.certifications, { name: '', issuer: '', date: '' }])
        }>
          + Add Certification
        </button>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        {data.achievements.map((ach, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={ach}
              onChange={(e) => {
                const updated = [...data.achievements];
                updated[i] = e.target.value;
                setField('achievements', updated);
              }}
            />
            <button
              type="button"
              style={styles.removeBtn}
              onClick={() => setField('achievements', data.achievements.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={() =>
          setField('achievements', [...data.achievements, ''])
        }>
          + Add Achievement
        </button>
      </Section>

      <div style={styles.submitRow}>
        <button type="submit" style={styles.btnPrimary}>
          ✓ Confirm & Save Resume
        </button>
      </div>
    </form>
  );
}

function VerifiedDashboard({ data, onReplace }: { data: ResumeRow; onReplace: () => void }) {
  const pd = data.parsedData;

  return (
    <div style={styles.verifiedWrapper}>
      <div style={styles.verifiedHeader}>
        <div>
          <div style={styles.verifiedBadge}>✓ Verified</div>
          <h2 style={styles.sectionTitle}>Your Resume</h2>
        </div>
        <button style={styles.btnSecondary} onClick={onReplace}>
          ↑ Update Resume
        </button>
      </div>

      <div style={styles.atsCard}>
        <span style={styles.atsLabel}>ATS Score</span>
        <span style={styles.atsScore}>{data.atsScore}</span>
        <span style={styles.atsMax}>/100</span>
      </div>

      {pd && (
        <>
          <Section title="Academic Metrics">
            <div style={styles.metricsGrid}>
              <Metric label="CGPA" value={pd.cgpa ?? '—'} />
              <Metric label="10th %" value={pd.tenth_mark ?? '—'} />
              <Metric label="12th %" value={pd.twelfth_mark ?? '—'} />
              <Metric label="Active Arrears" value={pd.active_arrears ?? '0'} />
              <Metric label="History of Arrears" value={pd.history_of_arrears ?? '0'} />
            </div>
          </Section>

          {pd.skills.length > 0 && (
            <Section title="Skills">
              <div style={styles.tagsContainer}>
                {pd.skills.map((s, i) => <span key={i} style={styles.tag}>{s}</span>)}
              </div>
            </Section>
          )}

          {pd.education.length > 0 && (
            <Section title="Education">
              {pd.education.map((edu, i) => (
                <div key={i} style={styles.listCard}>
                  <strong>{edu.degree}</strong> — {edu.institution}
                  <br />
                  <span style={styles.mutedText}>{edu.start_year} – {edu.end_year} · Score: {edu.score}</span>
                </div>
              ))}
            </Section>
          )}

          {pd.experience.length > 0 && (
            <Section title="Experience">
              {pd.experience.map((exp, i) => (
                <div key={i} style={styles.listCard}>
                  <strong>{exp.role}</strong> at {exp.company}
                  <br />
                  <span style={styles.mutedText}>{exp.duration}</span>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {pd.projects.length > 0 && (
            <Section title="Projects">
              {pd.projects.map((proj, i) => (
                <div key={i} style={styles.listCard}>
                  <strong>{proj.title}</strong>
                  {proj.link && <> · <a href={proj.link} target="_blank" rel="noopener noreferrer" style={styles.link}>{proj.link}</a></>}
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{proj.description}</p>
                  <div style={{ ...styles.tagsContainer, marginTop: '0.5rem' }}>
                    {proj.technologies.map((t, j) => <span key={j} style={styles.tagSmall}>{t}</span>)}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {pd.certifications.length > 0 && (
            <Section title="Certifications">
              {pd.certifications.map((cert, i) => (
                <div key={i} style={styles.listCard}>
                  <strong>{cert.name}</strong> — {cert.issuer}
                  <br />
                  <span style={styles.mutedText}>{cert.date}</span>
                </div>
              ))}
            </Section>
          )}

          {pd.achievements.length > 0 && (
            <Section title="Achievements">
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {pd.achievements.map((a, i) => <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{a}</li>)}
              </ul>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionSubTitle}>{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.formField}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricValue}>{value}</span>
      <span style={styles.metricLabel}>{label}</span>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0f172a',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logo: {
    width: '2rem',
    height: '2rem',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#fff',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  brandSub: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    padding: '3rem 1rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #1e293b',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  dropzoneWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  dropzone: {
    border: '2px dashed #334155',
    borderRadius: '16px',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  dropzoneActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  dropzoneIcon: { fontSize: '3rem' },
  dropzoneText: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#cbd5e1',
    margin: 0,
  },
  dropzoneSubText: { color: '#64748b', fontSize: '0.875rem', margin: 0 },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    backgroundColor: '#1e293b',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
  },
  sectionDesc: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: '0.5rem 0 0',
  },
  parsingTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#f1f5f9',
    margin: 0,
  },
  parsingDesc: {
    color: '#64748b',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    margin: 0,
  },
  savingText: { color: '#94a3b8', margin: 0 },
  draftForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  draftHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  atsCard: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '0.25rem',
    backgroundColor: '#1e293b',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid #334155',
    width: 'fit-content',
    marginTop: '0.5rem',
  },
  atsLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginRight: '0.5rem',
  },
  atsScore: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#6366f1',
  },
  atsMax: {
    fontSize: '1rem',
    color: '#475569',
  },
  section: {
    backgroundColor: '#111827',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  sectionSubTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: 0,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  hint: {
    fontSize: '0.75rem',
    color: '#475569',
    margin: 0,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '1rem',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#cbd5e1',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    borderRadius: '4px',
    lineHeight: 1,
  },
  addBtn: {
    background: 'transparent',
    border: '1px dashed #334155',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    width: 'fit-content',
    transition: 'all 0.2s',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '0.5rem',
  },
  btnPrimary: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnSecondary: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  verifiedWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  verifiedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    backgroundColor: '#052e16',
    color: '#4ade80',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    border: '1px solid #166534',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '1rem',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
  },
  metricValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#6366f1',
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  tag: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    backgroundColor: '#1e1b4b',
    color: '#a5b4fc',
    fontSize: '0.8rem',
    border: '1px solid #3730a3',
  },
  tagSmall: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    fontSize: '0.75rem',
    border: '1px solid #334155',
  },
  listCard: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '1rem',
    border: '1px solid #334155',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  mutedText: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
  },
};
