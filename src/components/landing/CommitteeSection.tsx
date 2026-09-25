'use client';

import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

export default function CommitteeSection() {
  const { content } = useConferenceData();
  const { committees } = content;

  return (
    <section id="committee" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Users size={14} /> Organization Leadership
          </div>
          <h2 className="section-title" style={{ letterSpacing: '1px' }}>
            COMMITTEE
          </h2>
          <p className="section-description">
            Distinguished faculty members, international advisory boards, and scientific committee chairs guiding ESIT.
          </p>
        </div>

        {/* 4 Columns matching Reference 5 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {committees.map((group) => (
            <div
              key={group.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '30px 24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(15, 61, 62, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(15, 61, 62, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ borderBottom: '2px solid #0f3d3e', paddingBottom: '12px', marginBottom: '18px' }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f3d3e',
                  lineHeight: '1.3'
                }}>
                  {group.title}
                </h3>
                {group.subtitle && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                    {group.subtitle}
                  </div>
                )}
              </div>

              <ul style={{
                listStyle: 'disc',
                paddingLeft: '20px',
                margin: 0,
                display: 'grid',
                gap: '12px'
              }}>
                {group.members.map((member, mIdx) => (
                  <li key={mIdx} style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.45' }}>
                    <strong style={{ color: '#0f172a' }}>{member.name}</strong>
                    {member.affiliation && (
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem' }}>
                        {member.affiliation}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
