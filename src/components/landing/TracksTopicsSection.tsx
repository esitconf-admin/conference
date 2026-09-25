'use client';

import React from 'react';
import { Layers, Check, FileCheck, Award } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

export default function TracksTopicsSection() {
  const { content } = useConferenceData();
  const { tracks } = content;

  return (
    <section id="author-guide" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Layers size={14} /> Call for Papers
          </div>
          <h2 className="section-title">Conference Tracks & Topics</h2>
          <p className="section-description">
            Authors are invited to submit original, unpublished research papers across our multidisciplinary engineering domains.
          </p>
        </div>

        {/* Tracks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '50px'
        }}>
          {tracks.map((track, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                backgroundColor: '#ffffff',
                borderTop: '4px solid var(--primary)',
                padding: '28px 24px'
              }}
            >
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#0f3d3e',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {track.category}
              </h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                {track.topics.map((topic, tIdx) => (
                  <li key={tIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.88rem',
                    color: '#475569',
                    lineHeight: '1.4'
                  }}>
                    <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Author & Reviewer Workflow Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }} id="reviewer-guide" className="guide-grid">
          
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#ebf6f5',
                color: '#0f3d3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCheck size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f3d3e' }}>
                  Author Submission Guidelines
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Standard IEEE Double-Column Format</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: '12px' }}>
              1. Full papers must be written in formal English and strictly formatted according to standard IEEE templates (4 to 6 pages including figures and references).
            </p>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              2. All submissions undergo double-blind peer review by at least two independent expert reviewers. Accepted papers will be submitted for inclusion into prestigious digital indexing libraries.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f3d3e' }}>
                  Reviewer Role & Evaluation Process
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Appointed by Scientific Committee</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: '12px' }}>
              1. Registered users can be assigned as <strong>Reviewers</strong> by Conference Admins. Reviewers receive email notifications and secure portal access to score manuscripts based on originality, technical soundness, and clarity.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              2. Reviewers receive an official Certificate of Reviewing Service endorsed by the KMUTNB College of Industrial Technology.
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (min-width: 800px) {
          .guide-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
