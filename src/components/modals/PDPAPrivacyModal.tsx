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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f3d3e',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={26} color="#f59e0b" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>Personal Data Protection & Privacy Notice</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>Compliant with Thailand PDPA B.E. 2562 & International Data Privacy Standards</p>
            </div>
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

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          fontSize: '0.92rem',
          color: '#334155',
          lineHeight: '1.7'
        }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf9',
              border: '1px solid rgba(15, 61, 62, 0.15)'
            }}>
              <Lock size={22} color="#0f3d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f3d3e', display: 'block', marginBottom: '4px' }}>1. Data Collection & Purpose</strong>
                We collect your personal details (Name, Surname, Email, Organization, Country) solely for academic peer-review management, conference proceedings indexing, and vital scheduling notifications.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <FileText size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>2. Data Encryption & Security Safeguards</strong>
                All authentication credentials and user profile data are protected using cryptographic encryption standards (scrypt/PBKDF2 in Google Firebase). No unencrypted passwords are ever transmitted or stored in raw text.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <UserCheck size={22} color="#0f3d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>3. Data Subject Rights & Role Governance</strong>
                You retain the right to inspect, update, or request the deletion of your personal registration record. Reviewer assignments are exclusively authorized by the Conference Secretariat and Scientific Committee.
              </div>
            </div>

            <div>
              <h4 style={{ color: '#0f3d3e', marginBottom: '8px' }}>4. Data Protection Officer (DPO) Contact</h4>
              <p>For data privacy inquiries, email the secretariat at <strong>esitconf@gmail.com</strong> or visit the College of Industrial Technology, King Mongkut&apos;s University of Technology North Bangkok.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
