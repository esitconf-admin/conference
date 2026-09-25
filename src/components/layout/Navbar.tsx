'use client';

import React, { useState } from 'react';
import { MapPin, User, LogOut, Shield, ChevronDown, Menu, X, FileUp } from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSubmission: () => void;
  onOpenAdmin: () => void;
}

export default function Navbar({ onOpenAuth, onOpenSubmission, onOpenAdmin }: NavbarProps) {
  const { currentUser, logout, isAdmin, isReviewer, isAuthor } = useAuth();
  const { content } = useConferenceData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      {/* 1. Top Bar matching Reference Header */}
      <div style={{
        backgroundColor: '#092c2c',
        color: '#e2e8f0',
        padding: '6px 0',
        fontSize: '0.82rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: 'rgba(245, 158, 11, 0.25)',
              color: '#fef3c7',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {content.hero.edition}
            </span>
            <span style={{ color: '#cbd5e1' }}>
              International Conference on Engineering Science & Innovative Technology
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fef3c7', fontWeight: 600 }}>
              <MapPin size={14} color="#f59e0b" />
              <span>{content.hero.venueName}, {content.hero.venueCityCountry}</span>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>📅 {content.hero.dateRange}</span>
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
          height: '76px'
        }}>
          {/* Brand Logo & Title */}
          <a
            href="#hero"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#0f3d3e',
              color: '#ffffff',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              lineHeight: 1,
              boxShadow: '0 4px 10px rgba(15, 61, 62, 0.25)'
            }}>
              <span style={{ fontSize: '0.95rem', letterSpacing: '-0.5px' }}>ESIT</span>
              <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>2025</span>
            </div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f3d3e',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                ESIT 2025
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                Pattaya, Thailand
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '24px'
          }} className="desktop-menu">
            <a href="#author-guide" style={navLinkStyle}>For Author</a>
            <a href="#reviewer-guide" style={navLinkStyle}>For Reviewer</a>
            <a href="#dates" style={navLinkStyle}>Important Dates</a>
            <a href="#committee" style={navLinkStyle}>Committee</a>
            <a href="#venue" style={navLinkStyle}>Venue</a>
            <a href="#news" style={navLinkStyle}>News</a>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Submit Manuscript CTA (Prominent Gold Button matching ref) */}
            <button
              onClick={onOpenSubmission}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, borderRadius: '8px' }}
            >
              <FileUp size={16} />
              <span>Submit Your Manuscript</span>
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf9',
                    border: '1px solid rgba(15, 61, 62, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#0f3d3e',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <User size={16} color="#0f3d3e" />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onOpenAdmin(); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#0f3d3e',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Shield size={16} color="#f59e0b" />
                        <span>Admin CMS Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left'
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-outline-primary btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                background: 'none',
                border: 'none',
                color: '#0f3d3e',
                cursor: 'pointer',
                padding: '6px'
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="#author-guide" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>For Author</a>
            <a href="#reviewer-guide" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>For Reviewer</a>
            <a href="#dates" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Important Dates</a>
            <a href="#committee" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Committee</a>
            <a href="#venue" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Venue</a>
            <a href="#news" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>News</a>
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
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
  fontSize: '0.92rem',
  transition: 'color 0.2s',
  padding: '6px 0'
};

const mobileNavLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#0f3d3e',
  fontWeight: 600,
  fontSize: '1rem',
  padding: '8px 0'
};
