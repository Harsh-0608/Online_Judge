import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, ShieldAlert, CheckCircle, Code, ShieldCheck, Flame, Eye, EyeOff, Trophy } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Password dynamic visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleToggle = (targetMode) => {
    if (targetMode === isLogin) return; // avoid redundant triggers
    setIsLogin(targetMode);
    setError('');
    setSuccess('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError('Username is required.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          setSuccess('Successfully signed in! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError(result.message);
        }
      } else {
        const result = await register(username, email, password);
        if (result.success) {
          setSuccess('Account created successfully! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Connection failed. Please check if your server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = (provider) => {
    setError('');
    setSuccess(`Connecting with ${provider}...`);
    setTimeout(() => {
      setSuccess('');
      setError(`Notice: ${provider} authentication is in simulation mode. Please use email & password.`);
    }, 1000);
  };

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  
  const getStrengthConfig = (score) => {
    switch(score) {
      case 1: return { color: '#dc2626', label: 'Weak' };
      case 2: return { color: '#d97706', label: 'Medium' };
      case 3: return { color: '#2563eb', label: 'Good' };
      case 4: return { color: '#059669', label: 'Strong' };
      default: return { color: 'transparent', label: '' };
    }
  };

  const strengthConfig = getStrengthConfig(strengthScore);

  return (
    <div className="cyber-bg">
      {/* Background Animated Neon Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      {/* Center Logo Header (Bigger font, new style) */}
      <div className="logo-center-container animate-fade-in">
        <h1 className="logo-large">
          <span>Code</span>
          <span style={{ color: 'var(--primary)' }}>Plex</span>
        </h1>
        <div className="logo-sub">PREMIUM CODING SANDBOX</div>
      </div>

      {/* Split-screen layout container */}
      <div className="auth-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Side: Product Intro Welcome Panel */}
        <div className="welcome-side">
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
              Interactive Sandbox
            </span>
            <h2 className="welcome-title" style={{ marginTop: '24px' }}>
              {isLogin ? (
                <>
                  Sign In to <br />
                  Continue Your Journey
                </>
              ) : (
                <>
                  Sign Up to <br />
                  Experience the Platform
                </>
              )}
            </h2>
            <p className="welcome-subtitle">
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--color-text-main)', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                About the Platform
              </strong>
              {isLogin 
                ? "CodePlex is a premium coding sandbox and online judge. Log back in to compete in weekly contests, climb global leaderboards, run tests, and compare performance benchmarks."
                : "CodePlex is a premium coding sandbox and online judge. Create your workspace to participate in live contests, climb leaderboards, run tests, and track your coding skills."
              }
              <span style={{ display: 'block', marginTop: '12px', fontSize: '12px', color: 'var(--primary)', fontStyle: 'italic', fontWeight: '600' }}>
                Hover over features below to reveal details.
              </span>
            </p>

            {/* Structured features list with hover reveal */}
            {isLogin ? (
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Code size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Resume Your Workspace</h4>
                    <p className="feature-desc">Access your solved challenges, code drafts, and saved solutions instantly.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Flame size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Fast Code Testing</h4>
                    <p className="feature-desc">Run your code drafts against our automated system to verify correctness immediately.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <ShieldCheck size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Compare Benchmarks</h4>
                    <p className="feature-desc">See how fast your code runs and view memory usage metrics on your profile.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Trophy size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Contests & Leaderboards</h4>
                    <p className="feature-desc">Compete in weekly challenges, view standings, and track your global developer rank.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Code size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Write Code in Your Browser</h4>
                    <p className="feature-desc">A smart, clean workspace with color coding and auto-completions to help you code easily.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Flame size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Instant Code Results</h4>
                    <p className="feature-desc">Run your programs in seconds to see if they work correctly and check the output.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <ShieldCheck size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Track Your Practice</h4>
                    <p className="feature-desc">Keep a record of your solved programming puzzles and watch your skills grow daily.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Trophy size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 className="feature-title">Compete & Rank Up</h4>
                    <p className="feature-desc">Join weekly algorithmic challenges, climb the global leaderboards, and build your rating.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* System status metrics card */}
          <div className="stats-card">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>COMPILER SERVICE ONLINE</span>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '12.5px', fontWeight: '500' }}>
              Queue Latency: <span style={{ color: 'var(--color-text-main)', fontWeight: '700' }}>8.4ms</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="form-side">
          {/* Sliding Pill Tab Switcher */}
          <div className="tab-selector">
            <button 
              type="button"
              className={`tab-btn ${isLogin ? 'active' : ''}`} 
              onClick={() => handleToggle(true)}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`tab-btn ${!isLogin ? 'active' : ''}`} 
              onClick={() => handleToggle(false)}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="alert alert-danger animate-fade-in">
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success animate-fade-in">
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Google-only prominent OAuth Button */}
          <button className="google-btn-full" onClick={() => handleOAuth('Google')} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">or use credentials</div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group animate-fade-in">
                <label className="form-label">Username</label>
                <div className="input-container">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-container">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="password-strength-bar">
                    <div className="strength-segment" style={{ backgroundColor: strengthScore >= 1 ? strengthConfig.color : 'rgba(255, 255, 255, 0.08)', boxShadow: strengthScore >= 1 ? `0 0 8px ${strengthConfig.color}` : 'none' }}></div>
                    <div className="strength-segment" style={{ backgroundColor: strengthScore >= 2 ? strengthConfig.color : 'rgba(255, 255, 255, 0.08)', boxShadow: strengthScore >= 2 ? `0 0 8px ${strengthConfig.color}` : 'none' }}></div>
                    <div className="strength-segment" style={{ backgroundColor: strengthScore >= 3 ? strengthConfig.color : 'rgba(255, 255, 255, 0.08)', boxShadow: strengthScore >= 3 ? `0 0 8px ${strengthConfig.color}` : 'none' }}></div>
                    <div className="strength-segment" style={{ backgroundColor: strengthScore >= 4 ? strengthConfig.color : 'rgba(255, 255, 255, 0.08)', boxShadow: strengthScore >= 4 ? `0 0 8px ${strengthConfig.color}` : 'none' }}></div>
                  </div>
                  <div className="strength-label">
                    Strength: <span style={{ color: strengthConfig.color, fontWeight: '700', marginLeft: '6px' }}>{strengthConfig.label}</span>
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group animate-fade-in">
                <label className="form-label">Confirm Password</label>
                <div className="input-container">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="input-icon-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
            )}

            {/* Remember me & Forgot passcode details */}
            <div className="remember-forgot">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                Remember me
              </label>
              <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); handleOAuth('Google Password Reset'); }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: '6px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : isLogin ? 'Sign In' : 'Sign Up'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
            {isLogin ? "New to CodePlex? " : 'Already registered? '}
            <button
              onClick={() => handleToggle(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', outline: 'none', textDecoration: 'underline' }}
            >
              {isLogin ? 'Create an account' : 'Sign In instead'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
