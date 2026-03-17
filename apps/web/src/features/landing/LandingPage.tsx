import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hamburgerBarClass = `landing-hamburger-bar${mobileNavOpen ? ' open' : ''}`;

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">P</div>
            <span>Pearl</span>
          </div>
          <div className="landing-nav-links">
            <button className="btn-text" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-gradient" onClick={() => navigate('/signup')}>Get Started →</button>
          </div>
          <button
            className="landing-hamburger"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className={hamburgerBarClass} />
            <span className={hamburgerBarClass} />
            <span className={hamburgerBarClass} />
          </button>
        </div>
        {mobileNavOpen && (
          <div className="landing-mobile-nav">
            <button className="btn-text" onClick={() => { navigate('/login'); setMobileNavOpen(false); }}>Sign In</button>
            <button className="btn-gradient" onClick={() => { navigate('/signup'); setMobileNavOpen(false); }}>Get Started →</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">🎓 Campus Placement Platform</div>
          <h1>Your Gateway to Campus Placements</h1>
          <p>Connect with top employers, showcase your skills with AI-powered resume analysis, and land your dream job.</p>
          <div className="hero-cta">
            <button className="btn-large btn-primary" onClick={() => navigate('/signup')}>
              Create Your Account →
            </button>
            <button className="btn-large btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-pill">
              <span className="stat-dot green" />
              5,000+ Students Placed
            </div>
            <div className="hero-stat-pill">
              <span className="stat-dot blue" />
              500+ Companies
            </div>
            <div className="hero-stat-pill">
              <span className="stat-dot purple" />
              95% Placement Rate
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="illustration-card">
            <span>🎓</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2>Why Choose Pearl?</h2>
          <p className="section-sub">Everything you need for a successful campus placement journey, in one intelligent platform.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '📄', title: 'Resume Parser', desc: 'AI-powered analysis that extracts your skills, education, and experience automatically.' },
            { icon: '📊', title: 'ATS Score Tracking', desc: 'Real-time feedback on ATS compatibility and smart suggestions to optimize your profile.' },
            { icon: '🎯', title: 'Smart Job Matching', desc: 'Discover opportunities that align perfectly with your skills and academic qualifications.' },
            { icon: '👥', title: 'Employer Network', desc: 'Connect with 500+ companies actively recruiting directly from your campus.' },
            { icon: '📈', title: 'Career Analytics', desc: 'Track placement progress with live dashboards for students and placement officers.' },
            { icon: '🤝', title: 'Faculty Support', desc: 'Coordinators get ATS-ranked shortlists and one-click CSV exports for placement drives.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <div className="landing-stats-section">
        <div className="landing-stats">
          {[
            { num: '5000+', label: 'Students Placed' },
            { num: '500+',  label: 'Partner Companies' },
            { num: '95%',   label: 'Placement Rate' },
            { num: '20+',   label: 'Partner Colleges' },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="landing-how landing-features" style={{ background: 'var(--color-bg)' }}>
        <div className="section-header">
          <div className="section-tag">How it Works</div>
          <h2>Get Placed in 3 Steps</h2>
          <p className="section-sub">Simple, fast, and effective placement workflow built for modern campuses.</p>
        </div>
        <div className="how-steps">
          {[
            { num: '1', title: 'Upload Your Resume', desc: 'Our AI parser instantly extracts your skills, education, and projects.' },
            { num: '2', title: 'Get Your ATS Score', desc: 'See how your profile ranks and get actionable improvement tips.' },
            { num: '3', title: 'Apply & Get Shortlisted', desc: 'Match with job requirements and appear on placement shortlists automatically.' },
          ].map((step, i) => (
            <div key={i} className="how-step">
              <div className="how-step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <h2>Ready to Start Your Placement Journey?</h2>
        <p>Join thousands of students who have successfully landed their dream jobs through Pearl.</p>
        <div className="cta-btns">
          <button className="btn-large btn-primary" onClick={() => navigate('/signup')}>
            Sign Up Free →
          </button>
          <button className="btn-large btn-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Pearl</h4>
            <p>The intelligent campus placement platform connecting students with top employers through AI-powered matching and ATS analysis.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Pearl. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

