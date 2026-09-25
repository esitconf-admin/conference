'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import Image from 'next/image';

export default function ImportantDatesSection() {
  const { content } = useConferenceData();
  const { dates } = content;

  const sortedDates = [...dates].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="dates" className="section section-alt">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '50px',
          alignItems: 'center'
        }} className="dates-grid">
          
          {/* Left Column: Schedule Visual Image matching Reference 4 */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -10px rgba(15, 61, 62, 0.15)',
              border: '4px solid #ffffff',
              position: 'relative',
              height: '420px'
            }}>
              <Image
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80"
                alt="Conference Schedule and Calendar Planning"
                fill
                style={{
                  objectFit: 'cover'
                }}
                unoptimized
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 61, 62, 0.85) 0%, rgba(15, 61, 62, 0.1) 60%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px',
                color: '#ffffff'
              }}>
                <div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    marginBottom: '6px'
                  }}>
                    SUBMISSION MILESTONES
                  </div>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem' }}>
                    Mark Your Academic Calendar
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Important Dates List matching Reference 4 */}
          <div>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              marginBottom: '12px'
            }}>
              Important dates
            </div>

            <h2 style={{
              fontSize: 'clamp(2rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#0f3d3e',
              marginBottom: '28px',
              letterSpacing: '-0.5px'
            }}>
              Important Dates :
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {sortedDates.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={20} color="#f59e0b" strokeWidth={2.5} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}>
                        {item.title}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.isExtended && item.extendedDate ? (
                          <>
                            <span style={{
                              textDecoration: 'line-through',
                              color: '#94a3b8',
                              fontSize: '0.9rem'
                            }}>
                              {item.originalDate}
                            </span>
                            <span style={{
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                            }}>
                              {item.extendedDate}
                            </span>
                          </>
                        ) : (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#0f3d3e',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.92rem'
                          }}>
                            {item.originalDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.note && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '28px',
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: '#ebf6f5',
              border: '1px solid rgba(15, 61, 62, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.88rem',
              color: '#0f3d3e'
            }}>
              <Clock size={20} color="#0f3d3e" style={{ flexShrink: 0 }} />
              <span>All deadlines are strictly set to <strong>23:59 (GMT+7, Bangkok Time)</strong>. Early submissions receive expedited peer-review feedback.</span>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .dates-grid {
            grid-template-columns: 0.9fr 1.1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
