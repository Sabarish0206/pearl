import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJobReq } from '../../api/job.api';
import { CreateJobSchema } from '@pearl/common';
import type { CreateJobInput } from '@pearl/common';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PortalLayout from '../../components/PortalLayout';
import './JobRequirementForm.css';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
];

const initialFormData: Omit<CreateJobInput, 'requiredSkills' | 'eligibleDepts'> & {
  requiredSkills: string;
  eligibleDepts: string[];
} = {
  title: '',
  companyName: '',
  description: '',
  requiredSkills: '',
  minCgpa: undefined,
  maxArrears: undefined,
  eligibleDepts: [],
  minExperienceYr: 0,
  salaryLpa: undefined,
  deadline: undefined,
  isActive: true,
};

export default function JobRequirementForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' && value !== '' ? parseFloat(value) : value === '' ? undefined : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDeptToggle = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      eligibleDepts: prev.eligibleDepts.includes(dept)
        ? prev.eligibleDepts.filter((d) => d !== dept)
        : [...prev.eligibleDepts, dept],
    }));
    setErrors((prev) => ({ ...prev, eligibleDepts: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const skills = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreateJobInput = {
      title: formData.title,
      companyName: formData.companyName,
      description: formData.description,
      requiredSkills: skills,
      minCgpa: formData.minCgpa ?? null,
      maxArrears: formData.maxArrears ?? null,
      eligibleDepts: formData.eligibleDepts,
      minExperienceYr: formData.minExperienceYr ?? 0,
      salaryLpa: formData.salaryLpa ?? null,
      deadline: formData.deadline ? new Date(formData.deadline as string).toISOString() : null,
      isActive: formData.isActive ?? true,
    };

    const parsed = CreateJobSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      const flat = parsed.error.flatten().fieldErrors;
      for (const [key, msgs] of Object.entries(flat)) {
        if (msgs?.[0]) fieldErrors[key] = msgs[0];
      }
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors below.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJobReq(parsed.data);
      toast.success('Job requirement created successfully!');
      setTimeout(() => navigate('/recruiter/jobs'), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Post a Job">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Progress Steps */}
      <div className="jf-steps">
        <div className={`jf-step ${step >= 1 ? 'active' : ''}`}>
          <div className="jf-step-num">1</div>
          <span>Job Details</span>
        </div>
        <div className="jf-step-divider" />
        <div className={`jf-step ${step >= 2 ? 'active' : ''}`}>
          <div className="jf-step-num">2</div>
          <span>Requirements</span>
        </div>
        <div className="jf-step-divider" />
        <div className={`jf-step ${step >= 3 ? 'active' : ''}`}>
          <div className="jf-step-num">3</div>
          <span>Eligibility</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="jf-section">
            <h2 className="jf-section-title">📋 Job Details</h2>
            <p className="jf-section-sub">Provide the basic information about the position</p>

            <div className="jf-grid-2">
              <div className="jf-field">
                <label className="jf-label">Job Title *</label>
                <input className={`jf-input ${errors.title ? 'error' : ''}`} name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Software Engineer" />
                {errors.title && <span className="jf-error">{errors.title}</span>}
              </div>
              <div className="jf-field">
                <label className="jf-label">Company Name *</label>
                <input className={`jf-input ${errors.companyName ? 'error' : ''}`} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., Infosys Ltd." />
                {errors.companyName && <span className="jf-error">{errors.companyName}</span>}
              </div>
            </div>

            <div className="jf-field">
              <label className="jf-label">Job Description *</label>
              <textarea
                className={`jf-textarea ${errors.description ? 'error' : ''}`}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={5}
              />
              {errors.description && <span className="jf-error">{errors.description}</span>}
            </div>

            <div className="jf-grid-2">
              <div className="jf-field">
                <label className="jf-label">Salary (LPA)</label>
                <input className="jf-input" name="salaryLpa" type="number" min="0" step="0.5" value={formData.salaryLpa ?? ''} onChange={handleChange} placeholder="e.g., 6.5" />
              </div>
              <div className="jf-field">
                <label className="jf-label">Application Deadline</label>
                <input className="jf-input" name="deadline" type="date" value={formData.deadline as string ?? ''} onChange={handleChange} />
              </div>
            </div>

            <div className="jf-nav">
              <button type="button" className="jf-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="button" className="jf-btn-primary" onClick={() => {
                if (!formData.title || !formData.companyName || !formData.description) {
                  setErrors({ title: !formData.title ? 'Required' : '', companyName: !formData.companyName ? 'Required' : '', description: !formData.description ? 'Required' : '' });
                  return;
                }
                setStep(2);
              }}>
                Next: Requirements →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Requirements */}
        {step === 2 && (
          <div className="jf-section">
            <h2 className="jf-section-title">🛠️ Skills & Requirements</h2>
            <p className="jf-section-sub">Define the technical skills and academic requirements</p>

            <div className="jf-field">
              <label className="jf-label">Required Skills * <span className="jf-hint">(comma-separated)</span></label>
              <input
                className={`jf-input ${errors.requiredSkills ? 'error' : ''}`}
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="e.g., Python, React, SQL, Data Structures"
              />
              {errors.requiredSkills && <span className="jf-error">{errors.requiredSkills}</span>}
              {formData.requiredSkills && (
                <div className="jf-skill-preview">
                  {formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean).map((s, i) => (
                    <span key={i} className="jf-skill-chip">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="jf-grid-3">
              <div className="jf-field">
                <label className="jf-label">Minimum CGPA</label>
                <input className="jf-input" name="minCgpa" type="number" min="0" max="10" step="0.1" value={formData.minCgpa ?? ''} onChange={handleChange} placeholder="e.g., 7.0" />
              </div>
              <div className="jf-field">
                <label className="jf-label">Max Active Arrears</label>
                <input className="jf-input" name="maxArrears" type="number" min="0" value={formData.maxArrears ?? ''} onChange={handleChange} placeholder="e.g., 0" />
              </div>
              <div className="jf-field">
                <label className="jf-label">Min Experience (years)</label>
                <input className="jf-input" name="minExperienceYr" type="number" min="0" value={formData.minExperienceYr ?? 0} onChange={handleChange} placeholder="0 for freshers" />
              </div>
            </div>

            <div className="jf-nav">
              <button type="button" className="jf-btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="jf-btn-primary" onClick={() => {
                if (!formData.requiredSkills.trim()) {
                  setErrors({ requiredSkills: 'At least one skill is required' });
                  return;
                }
                setStep(3);
              }}>
                Next: Eligibility →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Eligibility */}
        {step === 3 && (
          <div className="jf-section">
            <h2 className="jf-section-title">🎓 Eligible Departments</h2>
            <p className="jf-section-sub">Select which departments can apply for this position</p>

            <div className="jf-dept-grid">
              {DEPARTMENTS.map((dept) => (
                <label key={dept} className={`jf-dept-card ${formData.eligibleDepts.includes(dept) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.eligibleDepts.includes(dept)}
                    onChange={() => handleDeptToggle(dept)}
                    style={{ display: 'none' }}
                  />
                  <span className="jf-dept-check">{formData.eligibleDepts.includes(dept) ? '✓' : '+'}</span>
                  <span className="jf-dept-label">{dept}</span>
                </label>
              ))}
            </div>
            {errors.eligibleDepts && <span className="jf-error">{errors.eligibleDepts}</span>}
            {formData.eligibleDepts.length > 0 && (
              <p className="jf-selection-count">{formData.eligibleDepts.length} department(s) selected</p>
            )}

            <div className="jf-field jf-active-toggle">
              <label className="jf-toggle-label">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="jf-checkbox" />
                <span>Publish this job immediately (make active)</span>
              </label>
            </div>

            <div className="jf-nav">
              <button type="button" className="jf-btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="jf-btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : '✓ Create Job Requirement'}
              </button>
            </div>
          </div>
        )}
      </form>
    </PortalLayout>
  );
}
