'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight, Bell, Tag } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { NewsItem } from '../../lib/types';
import NewsDetailModal from '../modals/NewsDetailModal';

export default function ImportantNewsSection() {
  const { content } = useConferenceData();
  const { news } = content;
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <section id="news" className="section" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Bell size={14} /> Official Updates
          </div>
          <h2 className="section-title">Important News</h2>
          <p className="section-description">
            Latest announcements, program handbook updates, keynote introductions, and payment guidelines.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {news.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '30px',
                borderRadius: '16px',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedNews(item)}
            >
              <div>
                {/* Header Meta */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px'
                }}>
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: '#ebf6f5',
                    color: '#0f3d3e',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Tag size={12} /> {item.category}
                  </span>

                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: '#f59e0b',
                    fontWeight: 600
                  }}>
                    <Calendar size={13} /> {item.date}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f3d3e',
                  marginBottom: '12px',
                  lineHeight: '1.35'
                }}>
                  {item.title}
                </h3>

                <p style={{
                  fontSize: '0.9rem',
                  color: '#475569',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.summary}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#f59e0b',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '16px'
              }}>
                <span>Know More</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
    </section>
  );
}
