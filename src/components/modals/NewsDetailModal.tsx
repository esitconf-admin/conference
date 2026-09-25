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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#0f3d3e',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                color: '#fef3c7',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Tag size={12} /> {news.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {news.date}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', lineHeight: '1.3' }}>
              {news.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', fontSize: '0.95rem', color: '#334155', lineHeight: '1.7' }}>
          {news.badge && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <Bell size={14} /> {news.badge}
            </div>
          )}

          <div style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>
            {news.fullContent || news.summary}
          </div>

          {news.downloadUrl && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>Official Document Attached</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>PDF document provided by ESIT Conference Committee</span>
              </div>
              <a
                href={news.downloadUrl}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={15} /> {news.downloadLabel || 'Download PDF'}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
