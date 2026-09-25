'use client';

import React from 'react';
import { CreditCard, Check, Building2, Copy, CheckCheck } from 'lucide-react';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';

export default function RegistrationPricingSection() {
  const { content } = useConferenceData();
  const { pricing, bankInfo } = content;
  const [copiedAccount, setCopiedAccount] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <section id="registration" className="section" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <CreditCard size={14} /> Registration & Fees
          </div>
          <h2 className="section-title">Registration Fees & Payment</h2>
          <p className="section-description">
            Transparent pricing categories for authors, students, and attendees with flexible payment options.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '50px'
        }}>
          {pricing.map((tier) => (
            <div
              key={tier.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '30px 24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f3d3e',
                  marginBottom: '16px',
                  minHeight: '44px'
                }}>
                  {tier.category}
                </h3>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Early-Bird Rate
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                    {tier.earlyBirdFee}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Regular: {tier.regularFee}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.85rem',
                      color: '#475569',
                      lineHeight: '1.4'
                    }}>
                      <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bank Payment Information Box matching Reference */}
        <div style={{
          backgroundColor: '#f0fdf9',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(15, 61, 62, 0.2)',
          boxShadow: '0 4px 20px rgba(15, 61, 62, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#0f3d3e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={24} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f3d3e' }}>
                Bank Transfer & Payment Details
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                Official account for international & domestic registration fees
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Bank Name
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
                {bankInfo.bankName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Branch: {bankInfo.branch}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Account Name
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
                {bankInfo.accountNameEn}
              </div>
              {bankInfo.accountNameTh && (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  ({bankInfo.accountNameTh})
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Account Number & SWIFT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f3d3e',
                  letterSpacing: '1px'
                }}>
                  {bankInfo.accountNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(bankInfo.accountNumber)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedAccount ? '#10b981' : '#0f3d3e',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Copy Account Number"
                >
                  {copiedAccount ? <CheckCheck size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                SWIFT Code: <strong>{bankInfo.swiftCode}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
