'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, User, LogOut, Shield, ChevronDown, Menu, X, 
  FileUp, FileText, Award, Calendar, Users, Archive, Bell,
  LogIn, UserPlus, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSubmission: () => void;
  onOpenAdmin: () => void;
  onOpenMySubmissions: () => void;
  onOpenReviewerPortal?: () => void;
}

export default function Navbar({
  onOpenAuth,
  onOpenSubmission,
  onOpenAdmin,
  onOpenMySubmissions,
  onOpenReviewerPortal
}: NavbarProps) {
  const { currentUser, logout, isAdmin, isReviewer } = useAuth();
  const { content } = useConferenceData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1040 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMobileNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      {/* 1. Top Bar */}
      <div style={{
        backgroundColor: '#092c2c',
        color: '#e2e8f0',
        padding: '5px 0',
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Left: Edition & Conference Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{
              backgroundColor: 'rgba(245, 158, 11, 0.25)',
              color: '#fef3c7',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {content.hero.edition}
            </span>
            <span className="navbar-top-full-title" style={{
              color: '#cbd5e1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              International Conference on Engineering Science & Innovative Technology
            </span>
          </div>

          {/* Right: Venue & Dates */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fef3c7', fontWeight: 600 }}>
              <MapPin size={13} color="#f59e0b" />
              <span className="navbar-top-venue">{content.hero.venueCityCountry || content.hero.venueName}</span>
            </div>
            <span className="navbar-top-divider" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
            <span className="navbar-top-date" style={{ color: '#cbd5e1' }}>📅 {content.hero.dateRange}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '72px'
        }}>
          {/* Brand Logo & Title */}
          <a
            href="#hero"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0',
              flexShrink: 0
            }} className="navbar-logo-box">
              <img
                src="/logo.png"
                alt={content.hero.edition}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f3d3e',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }} className="navbar-brand-title">
                {content.hero.edition}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {content.hero.venueCityCountry}
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="desktop-menu" style={{
            display: 'none',
            alignItems: 'center',
            gap: '16px'
          }}>
            <a href="#author-guide" style={navLinkStyle}>For Author</a>
            <a href="#reviewer-guide" style={navLinkStyle}>For Reviewer</a>
            <a href="#dates" style={navLinkStyle}>Important Dates</a>
            <a href="#committee" style={navLinkStyle}>Committee</a>
            <a href="#venue" style={navLinkStyle}>Venue</a>
            <a href="#previous-conferences" style={navLinkStyle}>Past Conferences</a>
            <a href="#news" style={navLinkStyle}>News</a>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Submit Manuscript CTA */}
            <button
              onClick={onOpenSubmission}
              className="btn btn-primary btn-sm"
              style={{
                fontWeight: 700,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px'
              }}
            >
              <FileUp size={16} style={{ flexShrink: 0 }} />
              <span className="navbar-submit-desktop">Submit Your Manuscript</span>
              <span className="navbar-submit-mobile">Submit</span>
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    backgroundColor: '#f0fdf9',
                    border: '1px solid rgba(15, 61, 62, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#0f3d3e',
                    fontSize: '0.86rem',
                    fontWeight: 600
                  }}
                  aria-label="User profile menu"
                >
                  <User size={16} color="#0f3d3e" />
                  <span className="navbar-user-name" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.firstName}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '240px',
                    maxWidth: 'calc(100vw - 24px)',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2)',
                    border: '1px solid #e2e8f0',
                    padding: '8px',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {currentUser.roles.map(r => (
                          <span key={r} style={{
                            padding: '2px 6px',
                            backgroundColor: r === 'admin' ? '#fef3c7' : r === 'reviewer' ? '#e0f2fe' : '#ecfdf5',
                            color: r === 'admin' ? '#b45309' : r === 'reviewer' ? '#0369a1' : '#047857',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setUserDropdownOpen(false); onOpenMySubmissions(); }}
                      style={dropdownItemStyle}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FileText size={16} color="#0f3d3e" />
                      <span>My Submissions</span>
                    </button>

                    {(isReviewer || isAdmin) && onOpenReviewerPortal && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onOpenReviewerPortal(); }}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Award size={16} color="#059669" />
                        <span style={{ fontWeight: 700 }}>Reviewer Portal</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onOpenAdmin(); }}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Shield size={16} color="#f59e0b" />
                        <span style={{ fontWeight: 700 }}>Admin CMS Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      style={{
                        ...dropdownItemStyle,
                        color: '#ef4444'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-outline-primary btn-sm"
                  style={{ borderRadius: '8px', padding: '7px 12px', fontSize: '0.84rem' }}
                >
                  <span className="navbar-auth-desktop">Login</span>
                  <span className="navbar-auth-mobile">Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-secondary btn-sm navbar-register-btn"
                  style={{ borderRadius: '8px', padding: '7px 12px', fontSize: '0.84rem' }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#0f3d3e',
                cursor: 'pointer',
                padding: '7px',
                minWidth: '40px',
                minHeight: '40px'
              }}
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-container">
            {/* Backdrop */}
            <div 
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)} 
            />

            {/* Drawer Content */}
            <div className="mobile-drawer-content">
              {/* User Status / Auth in Mobile Drawer */}
              {currentUser ? (
                <div style={{
                  padding: '14px',
                  backgroundColor: '#f0fdf9',
                  border: '1px solid rgba(15, 61, 62, 0.15)',
                  borderRadius: '10px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#0f3d3e',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      {currentUser.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenMySubmissions(); }}
                      className="btn btn-outline-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
                    >
                      <FileText size={16} /> My Submissions
                    </button>

                    {(isReviewer || isAdmin) && onOpenReviewerPortal && (
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenReviewerPortal(); }}
                        className="btn btn-sm"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          gap: '8px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        <Award size={16} /> Reviewer Evaluation Portal
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                        className="btn btn-sm"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          gap: '8px',
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a'
                        }}
                      >
                        <Shield size={16} /> Admin Secretariat CMS
                      </button>
                    )}

                    <button
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="btn btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                    className="btn btn-outline-primary btn-sm"
                    style={{ justifyContent: 'center' }}
                  >
                    <LogIn size={15} /> Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'center' }}
                  >
                    <UserPlus size={15} /> Register
                  </button>
                </div>
              )}

              {/* Submit CTA in Drawer */}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenSubmission(); }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginBottom: '18px',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                }}
              >
                <FileUp size={18} /> Submit Your Manuscript
              </button>

              {/* Section Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <a href="#author-guide" onClick={() => handleMobileNavClick('#author-guide')} style={mobileDrawerLinkStyle}>
                  <FileText size={18} color="#0f3d3e" />
                  <span>For Authors & IEEE Guidelines</span>
                </a>
                <a href="#reviewer-guide" onClick={() => handleMobileNavClick('#reviewer-guide')} style={mobileDrawerLinkStyle}>
                  <Award size={18} color="#0f3d3e" />
                  <span>For Reviewers & Rubrics</span>
                </a>
                <a href="#dates" onClick={() => handleMobileNavClick('#dates')} style={mobileDrawerLinkStyle}>
                  <Calendar size={18} color="#0f3d3e" />
                  <span>Important Dates & Timeline</span>
                </a>
                <a href="#committee" onClick={() => handleMobileNavClick('#committee')} style={mobileDrawerLinkStyle}>
                  <Users size={18} color="#0f3d3e" />
                  <span>Committees & Leadership</span>
                </a>
                <a href="#venue" onClick={() => handleMobileNavClick('#venue')} style={mobileDrawerLinkStyle}>
                  <MapPin size={18} color="#0f3d3e" />
                  <span>Venue, Hotels & Travel</span>
                </a>
                <a href="#previous-conferences" onClick={() => handleMobileNavClick('#previous-conferences')} style={mobileDrawerLinkStyle}>
                  <Archive size={18} color="#0f3d3e" />
                  <span>Past Conferences & Archive</span>
                </a>
                <a href="#news" onClick={() => handleMobileNavClick('#news')} style={mobileDrawerLinkStyle}>
                  <Bell size={18} color="#0f3d3e" />
                  <span>News & Official Bulletins</span>
                </a>
              </div>

              {/* Drawer Footer Info */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>📍 {content.hero.venueName}, {content.hero.venueCityCountry}</div>
                <div>📅 {content.hero.dateRange}</div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        .navbar-submit-desktop {
          display: inline;
        }
        .navbar-submit-mobile {
          display: none;
        }
        .navbar-auth-desktop {
          display: inline;
        }
        .navbar-auth-mobile {
          display: none;
        }

        /* Desktop Breakpoints */
        @media (min-width: 1040px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (min-width: 1040px) and (max-width: 1240px) {
          .desktop-menu {
            gap: 10px !important;
          }
        }

        /* Tablet and Mobile Breakpoints */
        @media (max-width: 860px) {
          .navbar-top-full-title {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .navbar-top-date {
            display: none !important;
          }
          .navbar-top-divider {
            display: none !important;
          }
          .navbar-submit-desktop {
            display: none !important;
          }
          .navbar-submit-mobile {
            display: inline !important;
          }
          .navbar-register-btn {
            display: none !important;
          }
          .navbar-auth-desktop {
            display: none !important;
          }
          .navbar-auth-mobile {
            display: inline !important;
          }
          .navbar-logo-box {
            width: 36px !important;
            height: 36px !important;
          }
          .navbar-brand-title {
            font-size: 1.05rem !important;
          }
          .navbar-user-name {
            display: none !important;
          }
        }

        /* Mobile Drawer Styles */
        .mobile-drawer-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer-backdrop {
          position: absolute;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .mobile-drawer-content {
          position: relative;
          background-color: #ffffff;
          width: 100%;
          max-height: 88vh;
          max-height: 88dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 20px;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          animation: slideDown 0.25s ease-out;
          margin-top: 60px;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
}

const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#334155',
  fontWeight: 600,
  fontSize: '0.86rem',
  transition: 'color 0.2s',
  padding: '6px 0',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 12px',
  background: 'none',
  border: 'none',
  borderRadius: '6px',
  color: '#0f3d3e',
  fontWeight: 600,
  fontSize: '0.86rem',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.15s ease'
};

const mobileDrawerLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#0f3d3e',
  fontWeight: 600,
  fontSize: '0.94rem',
  padding: '10px 12px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#f8fafc',
  transition: 'background-color 0.15s ease'
};
