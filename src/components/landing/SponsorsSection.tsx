'use client';

import React from 'react';
import { Award, ExternalLink, Mail, Sparkles, Building2, Globe } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { formatGoogleDriveImageUrl } from '../../lib/utils/imageUtils';
import Image from 'next/image';

export default function SponsorsSection() {
  const { content } = useConferenceData();
  const sponsors = content.sponsors || [];

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  // Group sponsors by tier or preserve custom list order
  const tierOrder = [
    'Organized by',
    'Co-Organized by',
    'Technical Co-Sponsor',
    'Diamond Sponsor',
    'Platinum Sponsor',
    'Gold Sponsor',
    'Silver Sponsor',
    'Bronze Sponsor',
    'Academic Partner',
    'Supporting Partner',
    'Media Partner',
    'General Sponsor'
  ];

  return (
    <section
      id="sponsors"
      className="section"
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <Award size={14} color="#0f3d3e" />
            <span>Organizers & Strategic Partners</span>
          </div>
          <h2 className="section-title">
            Organized, Supported & Sponsored By
          </h2>
          <p className="section-description">
            We gratefully acknowledge the esteemed academic institutions, technical co-sponsors, and industry partners supporting the {content.hero.edition} conference.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
            marginBottom: '48px'
          }}
        >
          {sponsors.map((sponsor) => {
            const formattedLogo = formatGoogleDriveImageUrl(sponsor.logoUrl);
            return (
              <div
                key={sponsor.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(15, 61, 62, 0.12)';
                  e.currentTarget.style.borderColor = '#0f3d3e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Tier Badge */}
                {sponsor.tier && (
                  <div
                    style={{
                      alignSelf: 'center',
                      backgroundColor: sponsor.tier.toLowerCase().includes('organized')
                        ? '#ecfdf5'
                        : sponsor.tier.toLowerCase().includes('technical') || sponsor.tier.toLowerCase().includes('diamond') || sponsor.tier.toLowerCase().includes('gold')
                        ? '#fef3c7'
                        : '#f1f5f9',
                      color: sponsor.tier.toLowerCase().includes('organized')
                        ? '#047857'
                        : sponsor.tier.toLowerCase().includes('technical') || sponsor.tier.toLowerCase().includes('diamond') || sponsor.tier.toLowerCase().includes('gold')
                        ? '#b45309'
                        : '#475569',
                      border: '1px solid currentColor',
                      borderRadius: '9999px',
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {sponsor.tier}
                  </div>
                )}

                {/* Logo Box */}
                <div
                  style={{
                    width: '100%',
                    height: '110px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    marginBottom: '16px'
                  }}
                >
                  {formattedLogo ? (
                    <img
                      src={formattedLogo}
                      alt={sponsor.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
                        transition: 'transform 0.2s ease'
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8'
                      }}
                    >
                      <Building2 size={28} />
                    </div>
                  )}
                </div>

                {/* Sponsor Name */}
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '6px',
                    lineHeight: 1.35
                  }}
                >
                  {sponsor.name}
                </h3>

                {/* Description / Subtitle */}
                {sponsor.description && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      marginBottom: '16px',
                      flexGrow: 1,
                      lineHeight: 1.4
                    }}
                  >
                    {sponsor.description}
                  </p>
                )}

                {/* Website Link */}
                {sponsor.websiteUrl && (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#0f3d3e',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginTop: 'auto',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#f0fdf9',
                      border: '1px solid rgba(15, 61, 62, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f3d3e';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf9';
                      e.currentTarget.style.color = '#0f3d3e';
                    }}
                  >
                    <Globe size={13} />
                    <span>Official Website</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Sponsorship Inquiries Callout */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ebf6f5 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '650px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 61, 62, 0.1)',
                color: '#0f3d3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sparkles size={24} color="#0f3d3e" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Interested in Sponsoring or Exhibiting at {content.hero.edition}?
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0 }}>
                Gain global visibility among top academic researchers, engineering leaders, and industrial innovators. Custom sponsorship packages are available.
              </p>
            </div>
          </div>

          <a
            href={`mailto:${content.contactInfo?.secretariatEmail || 'esitconf@gmail.com'}?subject=Sponsorship%20Inquiry%20-%20${encodeURIComponent(content.hero.edition)}`}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Mail size={16} />
            <span>Contact Sponsorship Team</span>
          </a>
        </div>
      </div>
    </section>
  );
}
