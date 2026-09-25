'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Lock, Mail, User, Building, Globe, CheckCircle2, AlertCircle, RefreshCw, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { validatePasswordStrength, generateMathCaptcha, MathCaptchaChallenge } from '../../lib/security/captchaHelper';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onOpenPDPA?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onOpenPDPA }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [pdpaConsent, setPdpaConsent] = useState(false);

  // Security / Captcha
  const [captchaChallenge, setCaptchaChallenge] = useState<MathCaptchaChallenge>({ question: '', expectedAnswer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptchaChallenge(generateMathCaptcha());
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError(null);
      setSuccessMsg(null);
      refreshCaptcha();
    }
  }, [isOpen, defaultMode, refreshCaptcha]);

  const passwordStrength = validatePasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify CAPTCHA
    if (parseInt(captchaInput.trim(), 10) !== captchaChallenge.expectedAnswer) {
      setError('Incorrect CAPTCHA answer. Please solve the math verification to proceed.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setError(res.error || 'Failed to sign in. Please verify your email and password.');
      refreshCaptcha();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate PDPA
    if (!pdpaConsent) {
      setError('You must accept the PDPA & Personal Data Protection terms to register.');
      return;
    }

    // Validate password complexity
    if (!passwordStrength.isValid) {
      setError('Password does not meet enterprise security requirements.');
      return;
    }

    // Validate CAPTCHA
    if (parseInt(captchaInput.trim(), 10) !== captchaChallenge.expectedAnswer) {
      setError('Incorrect CAPTCHA answer. Please try again.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const res = await register({
      firstName,
      lastName,
      email,
      organization,
      country,
      password,
      pdpaConsent
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully! You are now logged in as an Author.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(res.error || 'Registration failed.');
      refreshCaptcha();
    }
  };

  const fillQuickDemo = (role: 'admin' | 'author') => {
    if (role === 'admin') {
      setEmail('admin@conference.org');
      setPassword('Admin@Secure2025!');
    } else {
      setEmail('author.reviewer@university.edu');
      setPassword('Author@Secure2025!');
    }
    setCaptchaInput(captchaChallenge.expectedAnswer.toString());
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: mode === 'register' ? '580px' : '460px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease'
      }}>
        {/* Modal Top Banner */}
        <div style={{
          backgroundColor: '#0f3d3e',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', color: '#fef3c7' }}>
                ESIT 2025 PORTAL AUTHENTICATION
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
              {mode === 'login' ? 'Sign In to Account' : 'Register Conference Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid #0f3d3e' : '3px solid transparent',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? '#0f3d3e' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid #0f3d3e' : '3px solid transparent',
              backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? '#0f3d3e' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            New Registration (Author/Reviewer)
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#059669',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. author@university.edu"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Bot Protection CAPTCHA */}
              <div style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f3d3e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} color="#f59e0b" /> Anti-Bot Security Verification:
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    title="Get new captcha"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f3d3e',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#0f3d3e',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '6px',
                    fontSize: '1rem',
                    letterSpacing: '1px'
                  }}>
                    {captchaChallenge.question}
                  </div>
                  <input
                    type="number"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Answer"
                    style={{
                      width: '90px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              {/* Demo Account Quick Access */}
              <div style={{
                marginTop: '10px',
                paddingTop: '14px',
                borderTop: '1px dashed #cbd5e1',
                fontSize: '0.8rem',
                color: '#64748b'
              }}>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>⚡ Quick Demo Logins:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('admin')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#0f3d3e'
                    }}
                  >
                    👑 Admin Login
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('author')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#0f3d3e'
                    }}
                  >
                    ✍️ Author & Reviewer
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    First Name (Name) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Somchai"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Last Name (Surname) *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Prasert"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai.p@kmutnb.ac.th"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Organization / University *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="KMUTNB"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Country *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Thailand"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password Creation with Security Standards Validator */}
              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Create Secure Password * (Encrypted in Firebase)
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong standard password"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '6px',
                      border: password ? (passwordStrength.isValid ? '1px solid #10b981' : '1px solid #f59e0b') : '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {password && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ fontWeight: 600, color: passwordStrength.isValid ? '#059669' : '#d97706', display: 'block', marginBottom: '4px' }}>
                      {passwordStrength.isValid ? '✓ Strong Password Criteria Met' : 'Password Standards Requirements:'}
                    </span>
                    <ul style={{ paddingLeft: '18px', margin: 0, color: '#64748b' }}>
                      <li style={{ color: password.length >= 8 ? '#059669' : '#64748b' }}>At least 8 characters</li>
                      <li style={{ color: /[A-Z]/.test(password) ? '#059669' : '#64748b' }}>At least 1 uppercase letter (A-Z)</li>
                      <li style={{ color: /[a-z]/.test(password) ? '#059669' : '#64748b' }}>At least 1 lowercase letter (a-z)</li>
                      <li style={{ color: /[0-9]/.test(password) ? '#059669' : '#64748b' }}>At least 1 number (0-9)</li>
                      <li style={{ color: /[!@#$%^&*]/.test(password) ? '#059669' : '#64748b' }}>At least 1 symbol (!@#$%^&*)</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* CAPTCHA */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f3d3e' }}>
                    Security CAPTCHA:
                  </span>
                  <button type="button" onClick={refreshCaptcha} style={{ background: 'none', border: 'none', color: '#0f3d3e', cursor: 'pointer', fontSize: '0.75rem' }}>
                    <RefreshCw size={12} /> New
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ padding: '6px 12px', backgroundColor: '#0f3d3e', color: '#fff', fontWeight: 700, borderRadius: '4px', fontSize: '0.9rem' }}>
                    {captchaChallenge.question}
                  </div>
                  <input
                    type="number"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Answer"
                    style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* PDPA Consent Checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf9',
                border: '1px solid rgba(15, 61, 62, 0.2)'
              }}>
                <input
                  type="checkbox"
                  id="pdpaCheckbox"
                  required
                  checked={pdpaConsent}
                  onChange={(e) => setPdpaConsent(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="pdpaCheckbox" style={{ fontSize: '0.82rem', color: '#0f3d3e', lineHeight: '1.4', cursor: 'pointer' }}>
                  I consent to the collection and secure storage of my academic profile data in accordance with the{' '}
                  <button
                    type="button"
                    onClick={onOpenPDPA}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#d97706',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    PDPA Data Privacy Policy
                  </button>.
                </label>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                💡 <em>Note: Your account will be granted <strong>Author</strong> role upon creation. The <strong>Reviewer</strong> role is assigned by the Admin / Scientific Committee.</em>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
