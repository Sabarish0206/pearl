import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginSchema } from '@pearl/common';
import type { LoginInput } from '@pearl/common';
import { loginUser } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = LoginSchema.safeParse(formData);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await loginUser(parsed.data);
      if (response.user) {
        setCurrentUser(response.user);
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">P</div>
          <span className="auth-brand-name">Pearl</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Pearl account</p>

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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
