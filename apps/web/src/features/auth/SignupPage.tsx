import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignupSchema } from '@pearl/common';
import type { SignupInput } from '@pearl/common';
import { signupUser } from '../../api/auth.api';

type Role = 'STUDENT' | 'FACULTY';

interface BaseFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface StudentFormData extends BaseFormData {
  role: 'STUDENT';
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  batchYear: string;
}

interface FacultyFormData extends BaseFormData {
  role: 'FACULTY';
  fullName: string;
  designation: string;
  department: string;
}

type FormData = StudentFormData | FacultyFormData;

const INITIAL_STUDENT_DATA: StudentFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  role: 'STUDENT',
  firstName: '',
  lastName: '',
  registerNumber: '',
  department: '',
  batchYear: '',
};

const INITIAL_FACULTY_DATA: FacultyFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  role: 'FACULTY',
  fullName: '',
  designation: '',
  department: '',
};

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(INITIAL_STUDENT_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: Role) => {
    setFieldErrors({});
    setServerError('');
    if (role === 'STUDENT') {
      setFormData({ ...INITIAL_STUDENT_DATA });
    } else {
      setFormData({ ...INITIAL_FACULTY_DATA });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    const signupInput: SignupInput =
      formData.role === 'STUDENT'
        ? {
            email: formData.email,
            password: formData.password,
            role: 'STUDENT',
            firstName: (formData as StudentFormData).firstName,
            lastName: (formData as StudentFormData).lastName,
            registerNumber: (formData as StudentFormData).registerNumber,
            department: (formData as StudentFormData).department,
            batchYear: parseInt((formData as StudentFormData).batchYear, 10),
          }
        : {
            email: formData.email,
            password: formData.password,
            role: 'FACULTY',
            fullName: (formData as FacultyFormData).fullName,
            designation: (formData as FacultyFormData).designation,
            department: (formData as FacultyFormData).department,
          };

    const parsed = SignupSchema.safeParse(signupInput);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const flatErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(errors)) {
        if (messages && messages.length > 0) flatErrors[key] = messages[0];
      }
      setFieldErrors(flatErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await signupUser(parsed.data);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStudent = formData.role === 'STUDENT';

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <div className="auth-brand-logo">P</div>
          <span className="auth-brand-name">Pearl</span>
        </div>

        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Pearl — your campus placement platform</p>

        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${isStudent ? 'role-btn--active' : ''}`}
            onClick={() => handleRoleChange('STUDENT')}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-btn ${!isStudent ? 'role-btn--active' : ''}`}
            onClick={() => handleRoleChange('FACULTY')}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">College Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@psnacet.edu.in"
              disabled={isSubmitting}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              disabled={isSubmitting}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              disabled={isSubmitting}
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {isStudent ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={(formData as StudentFormData).firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.firstName && (
                    <span className="field-error">{fieldErrors.firstName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={(formData as StudentFormData).lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.lastName && (
                    <span className="field-error">{fieldErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="registerNumber">Register Number</label>
                <input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  value={(formData as StudentFormData).registerNumber}
                  onChange={handleChange}
                  placeholder="e.g., 21CS001"
                  disabled={isSubmitting}
                />
                {fieldErrors.registerNumber && (
                  <span className="field-error">{fieldErrors.registerNumber}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={(formData as StudentFormData).department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.department && (
                    <span className="field-error">{fieldErrors.department}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="batchYear">Batch Year</label>
                  <input
                    id="batchYear"
                    name="batchYear"
                    type="number"
                    min="2000"
                    max="2100"
                    value={(formData as StudentFormData).batchYear}
                    onChange={handleChange}
                    placeholder="e.g., 2021"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.batchYear && (
                    <span className="field-error">{fieldErrors.batchYear}</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={(formData as FacultyFormData).fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                />
                {fieldErrors.fullName && (
                  <span className="field-error">{fieldErrors.fullName}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={(formData as FacultyFormData).designation}
                    onChange={handleChange}
                    placeholder="e.g., Assistant Professor"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.designation && (
                    <span className="field-error">{fieldErrors.designation}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={(formData as FacultyFormData).department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.department && (
                    <span className="field-error">{fieldErrors.department}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
