'use client';

import React from 'react';
import { MapPin, Navigation, Hotel, Plane, ExternalLink } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import Image from 'next/image';

export default function VenueSection() {
  const { content } = useConferenceData();
  const { hero, venue } = content;

  const venueName = venue?.venueName || hero.venueName;
  const venueCityCountry = venue?.venueCityCountry || hero.venueCityCountry;
  const venueBadge = venue?.badge || '5-Star Beachfront Luxury & International Convention Center';
  const venueAddress = venue?.address || '240 Beach Road, Pattaya City, Bang Lamung District, Chon Buri 20150, Thailand';
  const venueImage = venue?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80';
  const airportInfo = venue?.airportInfo || 'Approximately 90 minutes direct expressway drive from international airports. Shuttle vans and airport taxis are readily available.';
  const accommodationInfo = venue?.accommodationInfo || 'Conference delegates enjoy exclusive negotiated corporate room discounts at partner hotels.';
  const mapUrl = venue?.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(venueName)}`;

  return (
    <section id="venue" className="section" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <MapPin size={14} /> Destination & Accommodation
          </div>
          <h2 className="section-title">Conference Venue</h2>
          <p className="section-description">
            Experience world-class hospitality, beachside ambiance, and state-of-the-art conference facilities at {venueName}, {venueCityCountry}.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'center'
        }} className="venue-grid">
          
          {/* Left: Venue Image with Overlays */}
          <div style={{
            position: 'relative',
            height: '380px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0'
          }}>
            <Image
              src={venueImage}
              alt={`${venueName} Conference Venue`}
              fill
              style={{
                objectFit: 'cover'
              }}
              unoptimized
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(9, 44, 44, 0.9) 0%, rgba(9, 44, 44, 0.2) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '28px',
              color: '#ffffff'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                {venueBadge}
              </span>
              <h3 style={{ margin: '4px 0 6px 0', color: '#ffffff', fontSize: '1.4rem' }}>
                {venueName}, {venueCityCountry.split(',')[0]}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                {venueAddress}
              </p>
            </div>
          </div>

          {/* Right: Venue Guide & Travel Info */}
          <div>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '18px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <Plane size={24} color="#0f3d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f3d3e' }}>
                    Airport & Transportation
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                    {airportInfo}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '18px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <Hotel size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f3d3e' }}>
                    Special Delegate Accommodation Rates
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                    {accommodationInfo}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                <Navigation size={16} />
                <span>Open in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .venue-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
