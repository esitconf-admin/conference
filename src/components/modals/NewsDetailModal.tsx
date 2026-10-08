'use client';

import React from 'react';
import { X, Calendar, Download, Tag, Bell } from 'lucide-react';
import { NewsItem } from '../../lib/types';

interface NewsDetailModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

export default function NewsDetailModal({ news, onClose }: NewsDetailModalProps) {
  if (!news) return null;

  return (
    <div className="modal-overlay-responsive">
      <div 
        className="modal-content-responsive"
        style={{
          maxWidth: '650px',
        }}
      >
        {/* Header */}
        <div className="modal-header-responsive">
          <div style={{ paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 8px',
                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                color: '#fef3c7',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Tag size={12} /> {news.category}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {news.date}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#ffffff', lineHeight: '1.3' }}>
              {news.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body-responsive" style={{ fontSize: '0.94rem', color: '#334155', lineHeight: '1.7' }}>
          {news.badge && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '6px',
              marginBottom: '14px'
            }}>
              <Bell size={14} /> {news.badge}
            </div>
          )}

          <div style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>
            {news.fullContent || news.summary}
          </div>

          {news.downloadUrl && (
            <div style={{
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.88rem' }}>Official Document Attached</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF document provided by ESIT Conference Committee</span>
              </div>
              <a
                href={news.downloadUrl}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noreferrer"
                style={{ flexShrink: 0 }}
              >
                <Download size={15} /> {news.downloadLabel || 'Download PDF'}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer-responsive">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
