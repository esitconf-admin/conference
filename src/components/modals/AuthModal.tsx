'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Lock, Mail, User, Building, Globe, CheckCircle2, AlertCircle, 
  RefreshCw, Shield, KeyRound, ArrowLeft, Eye, EyeOff, Check, Send, Sparkles, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { validatePasswordStrength, generateMathCaptcha, MathCaptchaChallenge } from '../../lib/security/captchaHelper';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onOpenPDPA?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onOpenPDPA }: AuthModalProps) {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);

  // Form states - Login & Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [pdpaConsent, setPdpaConsent] = useState(false);

  // Form states - Forgot / Reset Password
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
      setForgotStep(1);
      setError(null);
      setSuccessMsg(null);
      refreshCaptcha();
    }
  }, [isOpen, defaultMode, refreshCaptcha]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const passwordStrength = validatePasswordStrength(mode === 'forgot' ? newPassword : password);

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

  const handleRequestResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    // Validate CAPTCHA
    if (parseInt(captchaInput.trim(), 10) !== captchaChallenge.expectedAnswer) {
      setError('Incorrect CAPTCHA answer. Please solve the math challenge to proceed.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(targetEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`We have dispatched a 6-digit verification code and reset instructions to ${targetEmail}. Please check your inbox and enter the code below.`);
      setForgotStep(2);
      setResendTimer(60);
      refreshCaptcha();
    } else {
      setError(res.error || 'Failed to dispatch password reset request. Please try again.');
      refreshCaptcha();
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!resetCode.trim()) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Password does not satisfy enterprise complexity requirements (at least 8 chars, uppercase, lowercase, number, special char).');
      return;
    }

    setLoading(true);
    const res = await confirmPasswordReset(resetEmail, resetCode, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password successfully updated! Redirecting to login...');
      setTimeout(() => {
        setEmail(resetEmail);
        setPassword(newPassword);
        setMode('login');
        setForgotStep(1);
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMsg(null);
        refreshCaptcha();
      }, 1400);
    } else {
      setError(res.error || 'Failed to reset password. Please check the verification code.');
    }
  };

  const handleResendResetCode = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await requestPasswordReset(resetEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`A fresh verification code has been dispatched to ${resetEmail}.`);
      setResendTimer(60);
    } else {
      setError(res.error || 'Failed to resend code.');
    }
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
              {mode === 'login' && 'Sign In to Account'}
              {mode === 'register' && 'Register Conference Profile'}
              {mode === 'forgot' && 'Account Recovery & Password Reset'}
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
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid #0f3d3e' : '3px solid transparent',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? '#0f3d3e' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.92rem'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid #0f3d3e' : '3px solid transparent',
              backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? '#0f3d3e' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.92rem'
            }}
          >
            Register Profile
          </button>
          {mode === 'forgot' && (
            <button
              onClick={() => { setError(null); }}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderBottom: '3px solid #f59e0b',
                backgroundColor: '#ffffff',
                fontWeight: 700,
                color: '#b45309',
                cursor: 'default',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <KeyRound size={15} color="#d97706" />
              <span>Reset Password</span>
            </button>
          )}
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

          {/* ========================================================================= */}
          {/* 1. LOGIN FORM                                                             */}
          {/* ========================================================================= */}
          {mode === 'login' && (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep(1);
                      setResetEmail(email);
                      setError(null);
                      setSuccessMsg(null);
                      refreshCaptcha();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#0f3d3e',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    <KeyRound size={13} color="#f59e0b" />
                    <span>Forgot password?</span>
                  </button>
                </div>

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

              <div style={{
                marginTop: '10px',
                padding: '12px',
                backgroundColor: '#f0fdf9',
                borderRadius: '8px',
                border: '1px solid rgba(15, 61, 62, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: '#475569'
              }}>
                <span>Don&apos;t have an account yet?</span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f3d3e',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create Profile
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. FORGOT / RESET PASSWORD FORM                                           */}
          {/* ========================================================================= */}
          {mode === 'forgot' && (
            <div>
              {/* STEP 1: REQUEST VERIFICATION CODE & RESET LINK */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestResetSubmit} style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#92400e',
                    fontSize: '0.84rem',
                    lineHeight: '1.4'
                  }}>
                    <strong>Forgot your password?</strong> Enter your registered email address below. We will send a secure <strong>6-digit verification code</strong> and password recovery link to your inbox.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Registered Account Email *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
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

                  {/* Anti-Bot Security Verification */}
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f3d3e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={16} color="#f59e0b" /> Anti-Abuse Verification:
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
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Sending Verification Email...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Password Reset Code</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => { setForgotStep(2); setError(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f3d3e',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Already have a code? Enter it here &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: ENTER CODE & SET NEW PASSWORD */}
              {forgotStep === 2 && (
                <form onSubmit={handleConfirmResetSubmit} style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#166534',
                    fontSize: '0.84rem',
                    lineHeight: '1.4'
                  }}>
                    <strong>Verification code dispatched!</strong> Check your email for a 6-digit code sent to <em>{resetEmail || 'your email'}</em>. Enter it below along with your new password.
                  </div>

                  {/* 6-Digit OTP Code */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      6-Digit Verification Code (from Email) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          letterSpacing: '4px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong new password"
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 38px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              style={{
                                height: '4px',
                                flex: 1,
                                borderRadius: '2px',
                                backgroundColor: step <= passwordStrength.score
                                  ? passwordStrength.score < 2
                                    ? '#ef4444'
                                    : passwordStrength.score < 4
                                      ? '#f59e0b'
                                      : '#10b981'
                                  : '#e2e8f0'
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: passwordStrength.isValid ? '#059669' : '#dc2626' }}>
                          {passwordStrength.isValid ? '✓ Meets enterprise security strength requirements' : passwordStrength.feedback[0]}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Confirm New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter your new password"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Update Password & Sign In</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setError(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowLeft size={14} /> Change Email Address
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleResendResetCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? '#94a3b8' : '#0f3d3e',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                        textDecoration: resendTimer > 0 ? 'none' : 'underline'
                      }}
                    >
                      {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. REGISTRATION FORM                                                      */}
          {/* ========================================================================= */}
          {mode === 'register' && (
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
                  Institutional / Organization Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. s.prasert@kmutnb.ac.th"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    University / Organization *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. KMUTNB, CIT"
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
                    Country / Region *
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

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong, secure password"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: step <= passwordStrength.score
                              ? passwordStrength.score < 2
                                ? '#ef4444'
                                : passwordStrength.score < 4
                                  ? '#f59e0b'
                                  : '#10b981'
                              : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: passwordStrength.isValid ? '#059669' : '#dc2626' }}>
                      {passwordStrength.isValid ? '✓ Strong password' : passwordStrength.feedback[0]}
                    </div>
                  </div>
                )}
              </div>

              {/* Bot Protection CAPTCHA */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f3d3e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="#f59e0b" /> Security Verification:
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f3d3e',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem'
                    }}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 14px',
                    backgroundColor: '#0f3d3e',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '6px',
                    fontSize: '0.9rem',
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
                      width: '80px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}
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
