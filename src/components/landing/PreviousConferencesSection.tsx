'use client';

import React from 'react';
import { History, Calendar, BookOpen, Folder, ExternalLink, MapPin, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { formatGoogleDriveImageUrl } from '../../lib/utils/imageUtils';

export default function PreviousConferencesSection() {
  const { content } = useConferenceData();
  const previousConferences = content.previousConferences || [];

  if (!previousConferences || previousConferences.length === 0) {
    return null;
  }

  return (
    <section
      id="previous-conferences"
      className="section section-alt"
      style={{
        position: 'relative',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <History size={14} color="#0f3d3e" />
            <span>Conference Archives & Legacy</span>
          </div>
          <h2 className="section-title">
            Previous Conferences & Proceedings
          </h2>
          <p className="section-description">
            Explore archived technical programs, published proceedings, and photo memories from previous editions of the ESIT conference.
          </p>
        </div>

        {/* Previous Conferences Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {previousConferences.map((conf, idx) => {
            const formattedCover = formatGoogleDriveImageUrl(conf.coverImageUrl);

            return (
              <div
                key={conf.id || idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 30px -6px rgba(15, 61, 62, 0.12)';
                  e.currentTarget.style.borderColor = '#0f3d3e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Optional Cover Image Thumbnail */}
                {formattedCover && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '140px',
                      backgroundColor: '#092c2c',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={formattedCover}
                      alt={conf.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.92)'
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(9, 44, 44, 0.8) 0%, transparent 60%)'
                      }}
                    />
                    {conf.edition && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '16px',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {conf.edition}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}
                >
                  {/* Badge if no cover image */}
                  {!formattedCover && conf.edition && (
                    <div style={{ marginBottom: '10px' }}>
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          textTransform: 'uppercase'
                        }}
                      >
                        {conf.edition}
                      </span>
                    </div>
                  )}

                  {/* Conference Title */}
                  <h3
                    style={{
                      fontSize: '1.08rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '8px',
                      lineHeight: 1.35
                    }}
                  >
                    {conf.title}
                  </h3>

                  {/* Meta Matrix (Location & Date) */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      marginBottom: '14px'
                    }}
                  >
                    {conf.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#f59e0b" />
                        <span>{conf.location}</span>
                      </div>
                    )}
                    {conf.dateRange && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#0f3d3e" />
                        <span>{conf.dateRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Theme / Description */}
                  {(conf.theme || conf.description) && (
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#475569',
                        lineHeight: 1.5,
                        marginBottom: '20px',
                        flex: 1
                      }}
                    >
                      {conf.theme ? <strong>&ldquo;{conf.theme}&rdquo;</strong> : null}
                      {conf.theme && conf.description ? ' — ' : ''}
                      {conf.description}
                    </p>
                  )}

                  {/* 3 Action Buttons with Google Drive / Document Links */}
                  <div
                    style={{
                      display: 'grid',
                      gap: '8px',
                      marginTop: 'auto',
                      borderTop: '1px dashed #e2e8f0',
                      paddingTop: '14px'
                    }}
                  >
                    {/* 1. Program Schedule Link */}
                    {conf.programScheduleUrl ? (
                      <a
                        href={conf.programScheduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          color: '#166534',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dcfce7';
                          e.currentTarget.style.borderColor = '#86efac';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0fdf4';
                          e.currentTarget.style.borderColor = '#bbf7d0';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={15} color="#16a34a" />
                          <span>Program Schedule</span>
                        </div>
                        <ExternalLink size={13} color="#166534" />
                      </a>
                    ) : null}

                    {/* 2. Proceedings Link */}
                    {conf.proceedingUrl ? (
                      <a
                        href={conf.proceedingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          color: '#1e40af',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                          e.currentTarget.style.borderColor = '#93c5fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.borderColor = '#bfdbfe';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BookOpen size={15} color="#2563eb" />
                          <span>Conference Proceedings</span>
                        </div>
                        <ExternalLink size={13} color="#1e40af" />
                      </a>
                    ) : null}

                    {/* 3. Photo Gallery / Image Folder Link */}
                    {conf.imageFolderUrl ? (
                      <a
                        href={conf.imageFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '8px',
                          color: '#854d0e',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef9c3';
                          e.currentTarget.style.borderColor = '#fde047';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fefce8';
                          e.currentTarget.style.borderColor = '#fef08a';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Folder size={15} color="#ca8a04" />
                          <span>Photo Album & Gallery</span>
                        </div>
                        <ExternalLink size={13} color="#854d0e" />
                      </a>
                    ) : null}

                    {/* If none of the 3 links configured yet */}
                    {!conf.programScheduleUrl && !conf.proceedingUrl && !conf.imageFolderUrl && (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
                        Archives & links available via Secretariat.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
