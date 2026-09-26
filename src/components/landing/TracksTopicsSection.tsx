'use client';

import React from 'react';
import { Layers, Check, FileCheck, Award, ExternalLink } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { GuidelineItem } from '../../lib/types';

export default function TracksTopicsSection() {
  const { content } = useConferenceData();
  const { tracks } = content;

  return (
    <section id="tracks" className="section section-alt" style={{ scrollMarginTop: '80px' }}>
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
        }} className="guide-grid">
          
          {/* Author Submission Guidelines Card */}
          <div
            id="author-guide"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              scrollMarginTop: '100px'
            }}
          >
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
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {(content.authorGuidelines && content.authorGuidelines.length > 0 ? content.authorGuidelines : [
                'Full papers must be written in formal English and strictly formatted according to standard IEEE templates (4 to 6 pages including figures and references).',
                'All submissions undergo double-blind peer review by at least two independent expert reviewers. Accepted papers will be submitted for inclusion into prestigious digital indexing libraries.'
              ]).map((guide: string | GuidelineItem, gIdx: number) => {
                const text = typeof guide === 'string' ? guide : guide.text;
                const linkUrl = typeof guide === 'string' ? undefined : guide.linkUrl;
                const linkLabel = typeof guide === 'string' ? undefined : guide.linkLabel;

                return (
                  <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                      <strong style={{ color: '#0f3d3e' }}>{gIdx + 1}.</strong> {text}
                    </p>
                    {linkUrl && linkUrl.trim() !== '' && (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          alignSelf: 'flex-start',
                          marginTop: '2px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#0f3d3e',
                          backgroundColor: '#ebf6f5',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          border: '1px solid rgba(15, 61, 62, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{linkLabel || 'View Reference / Download'}</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviewer Role & Evaluation Card */}
          <div
            id="reviewer-guide"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              scrollMarginTop: '100px'
            }}
          >
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

            <div style={{ display: 'grid', gap: '16px' }}>
              {(content.reviewerGuidelines && content.reviewerGuidelines.length > 0 ? content.reviewerGuidelines : [
                'Registered users can be assigned as Reviewers by Conference Admins. Reviewers receive email notifications and secure portal access to score manuscripts based on originality, technical soundness, methodology, clarity, and relevance.',
                'Reviewers receive an official Certificate of Reviewing Service endorsed by the KMUTNB College of Industrial Technology.'
              ]).map((guide: string | GuidelineItem, rIdx: number) => {
                const text = typeof guide === 'string' ? guide : guide.text;
                const linkUrl = typeof guide === 'string' ? undefined : guide.linkUrl;
                const linkLabel = typeof guide === 'string' ? undefined : guide.linkLabel;

                return (
                  <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                      <strong style={{ color: '#0f3d3e' }}>{rIdx + 1}.</strong> {text}
                    </p>
                    {linkUrl && linkUrl.trim() !== '' && (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          alignSelf: 'flex-start',
                          marginTop: '2px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#92400e',
                          backgroundColor: '#fef3c7',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          border: '1px solid rgba(217, 119, 6, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{linkLabel || 'View Reference / Download'}</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
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
