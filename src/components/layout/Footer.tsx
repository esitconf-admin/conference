'use client';

import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

interface FooterProps {
  onOpenPDPA: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function Footer({ onOpenPDPA, onOpenAdmin, onOpenAuth }: FooterProps) {
  const { content } = useConferenceData();
  const { contactInfo, hero } = content;

  return (
    <footer id="contact" style={{
      backgroundColor: '#092c2c',
      color: '#cbd5e1',
      padding: '70px 0 30px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand & Organization */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#ffffff',
                color: '#0f3d3e',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                lineHeight: 1
              }}>
                <span style={{ fontSize: '0.95rem' }}>ESIT</span>
                <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>2025</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                ESIT 2025
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '16px' }}>
              Organized by College of Industrial Technology (CIT), King Mongkut&apos;s University of Technology North Bangkok (KMUTNB), Thailand.
            </p>

            <button
              onClick={onOpenPDPA}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#fef3c7',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={14} color="#f59e0b" />
              <span>PDPA & Privacy Policy</span>
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '16px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#hero" style={footerLinkStyle}>Conference Overview</a></li>
              <li><a href="#dates" style={footerLinkStyle}>Important Submission Dates</a></li>
              <li><a href="#keynotes" style={footerLinkStyle}>Keynote Speakers</a></li>
              <li><a href="#registration" style={footerLinkStyle}>Registration & Payment</a></li>
              <li><a href="#committee" style={footerLinkStyle}>Conference Committee</a></li>
              <li><a href="#venue" style={footerLinkStyle}>Venue: {hero.venueName}</a></li>
            </ul>
          </div>

          {/* Contact Inquiries */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '16px' }}>
              Secretariat & Contact
            </h4>
            <div style={{ display: 'grid', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mail size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Secretariat E-mail</div>
                  <a href={`mailto:${contactInfo.secretariatEmail}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                    {contactInfo.secretariatEmail}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Phone size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Phone / Tel</div>
                  <span style={{ color: '#94a3b8' }}>{contactInfo.phone}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Secretariat Office</div>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    {contactInfo.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin & Portal Portal Access */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '16px' }}>
              Conference Management
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '14px' }}>
              Authorized administrators can edit landing page content, posters, milestone dates, and assign reviewer credentials online.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={onOpenAdmin}
                className="btn btn-primary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <span>Access Admin CMS</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-outline-white btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <span>Author / Reviewer Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © 2025 ESIT International Conference. All rights reserved. Encrypted via Google Firebase & Firestore.
          </div>
          <div>
            Hosted in Pattaya, Thailand · King Mongkut&apos;s University of Technology North Bangkok
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLinkStyle: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.2s'
};
