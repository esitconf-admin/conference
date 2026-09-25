'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles, FileText, Download, Maximize2, X } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import Image from 'next/image';

interface HeroSectionProps {
  onOpenSubmission: () => void;
}

export default function HeroSection({ onOpenSubmission }: HeroSectionProps) {
  const { content } = useConferenceData();
  const { hero } = content;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section id="hero" style={{
      background: 'var(--hero-gradient)',
      color: '#ffffff',
      padding: '70px 0 80px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background aesthetic decorative shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22, 91, 92, 0.4) 0%, rgba(15, 61, 62, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'center'
        }} className="hero-grid">
          
          {/* Left Column: Text & CTAs */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              color: '#fef3c7',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px',
              backdropFilter: 'blur(8px)'
            }}>
              <Sparkles size={16} color="#f59e0b" />
              <span>{hero.badgeText || `${hero.edition} · ${hero.venueCityCountry || 'Hybrid Event'}`}</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#ffffff',
              marginBottom: '18px',
              letterSpacing: '-0.5px'
            }}>
              {hero.title}
            </h1>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              marginBottom: '28px',
              maxWidth: '560px'
            }}>
              {hero.fullTheme}
            </p>

            {/* Event Details Matrix */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Calendar size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Event Dates</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>{hero.dateRange}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <MapPin size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Conference Venue</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>{hero.venueName}, {hero.venueCityCountry}</div>
                </div>
              </div>
            </div>

            {/* Submission Deadline Highlight */}
            {hero.submissionDeadlineBadge && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '0 8px 8px 0',
                marginBottom: '32px',
                fontSize: '0.9rem',
                color: '#fef3c7',
                fontWeight: 600
              }}>
                ⏳ {hero.submissionDeadlineBadge}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenSubmission}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 700 }}
              >
                <FileText size={18} />
                <span>Submit Your Manuscript</span>
              </button>

              <a
                href="#dates"
                className="btn btn-outline-white btn-lg"
              >
                <span>View Important Dates</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Poster Card matching reference */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Poster Header */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#092c2c'
              }}>
                <Image
                  src={hero.posterImageUrl}
                  alt="ESIT Conference Poster"
                  fill
                  style={{
                    objectFit: 'cover'
                  }}
                  priority
                  unoptimized
                />

                {/* Lightbox Trigger Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(9, 44, 44, 0.9) 0%, rgba(9, 44, 44, 0.2) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  color: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                        Official Announcement Poster
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', color: '#ffffff', fontSize: '1.1rem' }}>
                        {hero.edition} Call for Papers
                      </h4>
                    </div>
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Poster Lightbox Modal */}
      {lightboxOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={() => setLightboxOpen(false)}
        >
          <div style={{ position: 'relative', maxWidth: '850px', width: '100%', maxHeight: '92vh', textAlign: 'center' }}
               onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
            >
              <X size={24} /> Close
            </button>
            <div style={{ position: 'relative', width: '100%', height: '70vh', borderRadius: '12px', overflow: 'hidden' }}>
              <Image
                src={hero.posterImageUrl}
                alt="ESIT Poster Enlarged"
                fill
                style={{
                  objectFit: 'contain'
                }}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr !important;
          }
        }
      `}</style>
    </section>
  );
}
