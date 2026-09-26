'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { submitManuscript } from '../../lib/submission/submissionService';
import confetti from 'canvas-confetti';

interface SubmitManuscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

export default function SubmitManuscriptModal({ isOpen, onClose, onRequireAuth }: SubmitManuscriptModalProps) {
  const { currentUser } = useAuth();
  const { content } = useConferenceData();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [track, setTrack] = useState(content.tracks[0]?.category || '');
  const [coAuthors, setCoAuthors] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>('');
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync selected track with active conference tracks
  useEffect(() => {
    if (content.tracks && content.tracks.length > 0) {
      const match = content.tracks.some(t => t.category === track);
      if (!match || !track) {
        setTrack(content.tracks[0].category);
      }
    }
  }, [content.tracks, isOpen, track]);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <FileText size={30} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#0f3d3e', marginBottom: '10px' }}>
            Author Sign-In Required
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
            Please sign in to your registered Author account to submit your manuscript for peer review.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-outline-primary btn-sm">
              Cancel
            </button>
            <button onClick={() => { onClose(); onRequireAuth(); }} className="btn btn-primary btn-sm">
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF manuscript file (IEEE format).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError('File exceeds maximum size of 25MB.');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !abstract.trim()) {
      setError('Please provide paper title and abstract.');
      return;
    }

    if (!selectedFile) {
      setError('Please select and attach your manuscript PDF file.');
      return;
    }

    setLoading(true);

    const res = await submitManuscript({
      file: selectedFile,
      title: title.trim(),
      abstract: abstract.trim(),
      track,
      coAuthors: coAuthors.trim(),
      authorUid: currentUser.uid,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      authorEmail: currentUser.email,
      authorOrganization: currentUser.organization
    });

    setLoading(false);

    if (res.success && res.submissionId) {
      setSubmittedId(res.submissionId);
      setDriveUrl(res.driveUrl || '');
      setSubmitted(true);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    } else {
      setError(res.error || 'Failed to submit manuscript. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#0f3d3e',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fef3c7' }}>
                {content.hero.edition} CALL FOR PAPERS
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
              Submit Your Manuscript
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
        <div style={{ padding: '24px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#0f3d3e', marginBottom: '8px' }}>
                Manuscript Received Successfully!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 16px auto', lineHeight: '1.6' }}>
                Your paper <strong>&ldquo;{title}&rdquo;</strong> has been uploaded to Google Drive and logged into Firebase Firestore for the Scientific Peer-Review Committee.
              </p>

              {/* Submission Details Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0f3d3e',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
                margin: '0 auto 20px auto',
                maxWidth: '520px',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Submission Tracking ID:</span>
                  <strong style={{ color: '#0f3d3e', fontSize: '1rem' }}>{submittedId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Conference Track:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{track}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Author / Submitter:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{currentUser.firstName} {currentUser.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Cloud Storage:</span>
                  <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={16} /> Saved to Google Drive & Firestore
                  </span>
                </div>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                fontSize: '0.85rem',
                color: '#047857',
                marginBottom: '24px',
                maxWidth: '520px',
                margin: '0 auto 20px auto'
              }}>
                ✉️ A confirmation receipt has been sent to <strong>{currentUser.email}</strong>.
              </div>

              <button onClick={onClose} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                Return to Conference Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '0.88rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Author info pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#f0fdf9',
                borderRadius: '8px',
                border: '1px solid rgba(15, 61, 62, 0.15)',
                fontSize: '0.88rem',
                color: '#0f3d3e'
              }}>
                <div>
                  <strong>Primary Submitter:</strong> {currentUser.firstName} {currentUser.lastName} ({currentUser.email})
                </div>
                <span style={{ fontSize: '0.78rem', padding: '2px 8px', backgroundColor: '#0f3d3e', color: '#fff', borderRadius: '4px' }}>
                  {currentUser.organization}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Conference Track *
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                    color: '#0f3d3e'
                  }}
                >
                  {content.tracks.map((t, idx) => (
                    <option key={idx} value={t.category}>
                      Track {idx + 1}: {t.category}
                    </option>
                  ))}
                </select>

                {/* Sub-topics helper preview */}
                {(() => {
                  const currentTrackObj = content.tracks.find(t => t.category === track) || content.tracks[0];
                  if (!currentTrackObj || !currentTrackObj.topics || currentTrackObj.topics.length === 0) return null;
                  return (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      color: '#475569',
                      lineHeight: '1.5'
                    }}>
                      <span style={{ fontWeight: 700, color: '#0f3d3e', display: 'block', marginBottom: '4px' }}>
                        Research Topic Areas for this Track:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {currentTrackObj.topics.map((tp, tpIdx) => (
                          <span
                            key={tpIdx}
                            style={{
                              backgroundColor: '#e6f4f1',
                              color: '#0f3d3e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.76rem',
                              fontWeight: 500
                            }}
                          >
                            • {tp}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Manuscript Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Robust Machine Learning Optimization for Solar Microgrid Load Distribution"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Abstract (150 - 300 words) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Enter paper abstract summarizing background, methodology, experimental findings and conclusion..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Co-Authors (Optional)
                </label>
                <input
                  type="text"
                  value={coAuthors}
                  onChange={(e) => setCoAuthors(e.target.value)}
                  placeholder="e.g. Dr. John Doe (MIT), Prof. Sarah Lee (Cambridge)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              {/* PDF Upload Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Manuscript PDF File (IEEE Standard format) *
                </label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <UploadCloud size={32} color="#0f3d3e" style={{ marginBottom: '8px' }} />
                  {fileName ? (
                    <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>
                      📄 Selected File: {fileName}
                    </span>
                  ) : (
                    <>
                      <span style={{ fontWeight: 600, color: '#0f3d3e', fontSize: '0.9rem' }}>
                        Click to browse or drop IEEE format PDF here
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                        Max file size: 25MB (.pdf only) • Automatically uploaded to Google Drive
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={onClose} className="btn btn-outline-primary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Uploading to Google Drive & Firestore...' : 'Submit Manuscript for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
