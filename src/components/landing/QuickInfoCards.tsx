'use client';

import React from 'react';
import { Calendar, MapPin, Users, HelpCircle, ArrowRight } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

export default function QuickInfoCards() {
  const { content } = useConferenceData();
  const { contactInfo } = content;

  const cards = [
    {
      id: 'dates',
      title: 'Important Dates - Extended !!',
      subtitle: 'List of important dates, authors should pay attention to.',
      icon: Calendar,
      iconColor: '#f59e0b',
      bgColor: '#fffbeb',
      badge: 'Extended',
      link: '#dates',
      linkLabel: 'More details'
    },
    {
      id: 'venue',
      title: 'Venue',
      subtitle: `${content.hero.venueName}, ${content.hero.venueCityCountry}`,
      icon: MapPin,
      iconColor: '#0284c7',
      bgColor: '#f0f9ff',
      link: '#venue',
      linkLabel: 'More details'
    },
    {
      id: 'committee',
      title: 'Committee',
      subtitle: 'Advisory Chairs, International Board & Scientific Committee',
      icon: Users,
      iconColor: '#059669',
      bgColor: '#ecfdf5',
      link: '#committee',
      linkLabel: 'More details'
    },
    {
      id: 'inquiries',
      title: 'General Inquiries',
      subtitle: `The ESIT Chairman: ${contactInfo.chairperson}\nE-mail: ${contactInfo.chairpersonEmail}`,
      icon: HelpCircle,
      iconColor: '#dc2626',
      bgColor: '#fef2f2',
      link: '#contact',
      linkLabel: 'More details'
    }
  ];

  return (
    <section style={{
      backgroundColor: '#e6f4f1',
      padding: '50px 0 60px 0',
      borderBottom: '1px solid rgba(15, 61, 62, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(15, 61, 62, 0.12)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div>
                  {/* Icon illustration container */}
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '16px',
                    backgroundColor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
                  }}>
                    <Icon size={34} color={card.iconColor} strokeWidth={2.2} />
                  </div>

                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#0f3d3e',
                    marginBottom: '10px'
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontSize: '0.88rem',
                    color: '#64748b',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    whiteSpace: 'pre-line'
                  }}>
                    {card.subtitle}
                  </p>
                </div>

                <a
                  href={card.link}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f3d3e',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#0f3d3e'}
                >
                  <span>{card.linkLabel}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
