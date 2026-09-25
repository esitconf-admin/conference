'use client';

import React, { useState } from 'react';
import { Mic, Award, BookOpen, Globe } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import Image from 'next/image';

export default function KeynoteSpeakersSection() {
  const { content } = useConferenceData();
  const { keynotes } = content;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="keynotes" className="section" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Mic size={14} /> Distinguished Academic Experts
          </div>
          <h2 className="section-title">Keynote & Invited Speakers</h2>
          <p className="section-description">
            World-renowned professors and thought leaders delivering cutting-edge insights on engineering innovations.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {keynotes.map((speaker) => (
            <div
              key={speaker.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0',
                overflow: 'hidden',
                borderRadius: '16px'
              }}
            >
              {/* Speaker Top Banner & Photo */}
              <div style={{
                position: 'relative',
                height: '240px',
                width: '100%',
                backgroundColor: '#092c2c'
              }}>
                <Image
                  src={speaker.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={speaker.name}
                  fill
                  style={{
                    objectFit: 'cover'
                  }}
                  unoptimized
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 61, 62, 0.95) 0%, rgba(15, 61, 62, 0.2) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  color: '#ffffff'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Globe size={13} /> {speaker.country}
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', color: '#ffffff', fontSize: '1.25rem' }}>
                    {speaker.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {speaker.title}
                  </div>
                </div>
              </div>

              {/* Speaker Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: '#ebf6f5',
                    color: '#0f3d3e',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '14px'
                  }}>
                    <Award size={14} color="#0f3d3e" />
                    <span>{speaker.affiliation}</span>
                  </div>

                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                    lineHeight: '1.4'
                  }}>
                    &ldquo;{speaker.topic}&rdquo;
                  </h4>

                  {speaker.abstract && (
                    <p style={{
                      fontSize: '0.88rem',
                      color: '#64748b',
                      lineHeight: '1.6',
                      display: expandedId === speaker.id ? 'block' : '-webkit-box',
                      WebkitLineClamp: expandedId === speaker.id ? 'unset' : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {speaker.abstract}
                    </p>
                  )}
                </div>

                {speaker.abstract && (
                  <button
                    onClick={() => setExpandedId(expandedId === speaker.id ? null : speaker.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f59e0b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: '8px 0 0 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{expandedId === speaker.id ? 'Show Less' : 'Read Abstract'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
