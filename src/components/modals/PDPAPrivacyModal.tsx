'use client';

import React from 'react';
import { X, ShieldCheck, Lock, FileText, UserCheck } from 'lucide-react';

interface PDPAPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PDPAPrivacyModal({ isOpen, onClose }: PDPAPrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-responsive">
      <div 
        className="modal-content-responsive"
        style={{
          maxWidth: '720px',
        }}
      >
        {/* Header */}
        <div className="modal-header-responsive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '8px' }}>
            <ShieldCheck size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', lineHeight: '1.25' }}>
                Personal Data Protection & Privacy Notice
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1' }}>
                Compliant with Thailand PDPA B.E. 2562 & International Data Privacy Standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body-responsive" style={{
          fontSize: '0.9rem',
          color: '#334155',
          lineHeight: '1.65'
        }}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf9',
              border: '1px solid rgba(15, 61, 62, 0.15)'
            }}>
              <Lock size={20} color="#0f3d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f3d3e', display: 'block', marginBottom: '3px' }}>1. Data Collection & Purpose</strong>
                We collect your personal details (Name, Surname, Email, Organization, Country) solely for academic peer-review management, conference proceedings indexing, and vital scheduling notifications.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <FileText size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '3px' }}>2. Data Encryption & Security Safeguards</strong>
                All authentication credentials and user profile data are protected using cryptographic encryption standards (scrypt/PBKDF2 in Google Firebase). No unencrypted passwords are ever transmitted or stored in raw text.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <UserCheck size={20} color="#0f3d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '3px' }}>3. Data Subject Rights & Role Governance</strong>
                You retain the right to inspect, update, or request the deletion of your personal registration record. Reviewer assignments are exclusively authorized by the Conference Secretariat and Scientific Committee.
              </div>
            </div>

            <div>
              <h4 style={{ color: '#0f3d3e', marginBottom: '6px', fontSize: '0.95rem' }}>4. Data Protection Officer (DPO) Contact</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>For data privacy inquiries, email the secretariat at <strong>esitconf@gmail.com</strong> or visit the College of Industrial Technology, King Mongkut&apos;s University of Technology North Bangkok.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-responsive">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
