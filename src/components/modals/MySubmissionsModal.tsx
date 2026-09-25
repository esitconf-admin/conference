import React, { useState, useEffect } from 'react';
import {
  X, FileText, UploadCloud, CheckCircle2, Clock, AlertTriangle,
  ExternalLink, Sparkles, RefreshCw, Plus, ShieldCheck, Trash2,
  Lock, AlertCircle, Folder
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { ManuscriptSubmission } from '../../lib/types';
import { getAllSubmissions, withdrawSubmission } from '../../lib/submission/submissionService';

const ESIT_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1A7BPBWVm812p34MAwF06r5G-g-YRP9Od';

interface MySubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewSubmission: () => void;
  onRequireAuth: () => void;
}

export default function MySubmissionsModal({
  isOpen,
  onClose,
  onOpenNewSubmission,
  onRequireAuth
}: MySubmissionsModalProps) {
  const { currentUser } = useAuth();
  const { content } = useConferenceData();

  const [mySubmissions, setMySubmissions] = useState<ManuscriptSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchMyPapers = async () => {
    if (!currentUser) return;
    setLoading(true);
    const all = await getAllSubmissions();
    const mine = all.filter(sub => 
      sub.authorUid === currentUser.uid || 
      (sub.authorEmail && sub.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
    setMySubmissions(mine);
    setLoading(false);
  };

  const handleWithdrawPaper = async (submissionId: string) => {
    setWithdrawingId(submissionId);
    try {
      const result = await withdrawSubmission(submissionId);
      if (result.success) {
        setMySubmissions(prev => prev.filter(p => p.id !== submissionId));
        setConfirmWithdrawId(null);
        setActionSuccessMsg(`Manuscript ${submissionId} has been successfully withdrawn.`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        alert(result.error || 'Failed to withdraw submission.');
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      alert('An error occurred while withdrawing your manuscript.');
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMyPapers();
    }
  }, [isOpen, currentUser]);

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
          maxWidth: '460px',
          width: '100%',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f3d3e', marginBottom: '8px' }}>
            Author Sign-In Required
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Please sign in to view your submitted manuscripts and track their peer-review evaluation progress.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-outline-primary btn-sm">
              Close
            </button>
            <button onClick={() => { onClose(); onRequireAuth(); }} className="btn btn-primary btn-sm">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: ManuscriptSubmission['status']) => {
    switch (status) {
      case 'accepted':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#059669',
          icon: CheckCircle2,
          label: 'Accepted for Presentation',
          desc: 'Congratulations! Your manuscript has been accepted by the Scientific Committee.'
        };
      case 'under_review':
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#2563eb',
          icon: Clock,
          label: 'Under Peer Review',
          desc: 'Your manuscript is currently being evaluated by assigned technical reviewers.'
        };
      case 'revision_requested':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#d97706',
          icon: AlertTriangle,
          label: 'Revision Required',
          desc: 'The reviewers have requested revisions. Please check your email for detailed feedback.'
        };
      case 'rejected':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#dc2626',
          icon: X,
          label: 'Declined',
          desc: 'The manuscript was not accepted for the conference program.'
        };
      default:
        return {
          bg: '#f8fafc',
          border: '#e2e8f0',
          text: '#475569',
          icon: Clock,
          label: 'Manuscript Received',
          desc: 'Successfully received and logged in Google Drive. Awaiting reviewer assignment.'
        };
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
        maxWidth: '820px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#0f3d3e',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fef3c7', textTransform: 'uppercase' }}>
                {content.hero.edition} Author Portal
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
              My Manuscript Submissions
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={fetchMyPapers}
              disabled={loading}
              title="Refresh submissions"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
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
        </div>

        {/* Subheader bar with author info & Submit CTA */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#475569' }}>
            Author Profile: <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.organization})
          </div>

          <button
            onClick={() => { onClose(); onOpenNewSubmission(); }}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Submit New Manuscript</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {actionSuccessMsg && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#0f3d3e' }} />
              <p style={{ margin: 0, fontSize: '0.92rem' }}>Loading your submissions from cloud...</p>
            </div>
          ) : mySubmissions.length === 0 ? (
            /* Empty State */
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#0f3d3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}>
                <FileText size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', color: '#0f3d3e', marginBottom: '8px' }}>
                No Manuscripts Submitted Yet
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                You have not submitted any papers to {content.hero.edition} yet. Submit your original IEEE-formatted research to begin the peer-review process.
              </p>
              <button
                onClick={() => { onClose(); onOpenNewSubmission(); }}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <UploadCloud size={16} />
                <span>Submit Your First Manuscript</span>
              </button>
            </div>
          ) : (
            /* List of My Submissions */
            <div style={{ display: 'grid', gap: '16px' }}>
              {mySubmissions.map((paper) => {
                const statusInfo = getStatusDisplay(paper.status);
                const StatusIcon = statusInfo.icon;
                const canWithdraw = paper.status !== 'under_review' && paper.status !== 'accepted';
                const isConfirmingThis = confirmWithdrawId === paper.id;
                const isWithdrawingThis = withdrawingId === paper.id;
                const manuscriptUrl = paper.pdfUrl || ESIT_DRIVE_FOLDER_URL;

                return (
                  <div
                    key={paper.id}
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      padding: '20px',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          backgroundColor: '#0f3d3e',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          letterSpacing: '0.5px'
                        }}>
                          {paper.id}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          backgroundColor: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {paper.track}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        backgroundColor: statusInfo.bg,
                        border: `1px solid ${statusInfo.border}`,
                        color: statusInfo.text,
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}>
                        <StatusIcon size={14} />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    <h4 style={{
                      fontSize: '1.08rem',
                      color: '#0f3d3e',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4',
                      fontWeight: 700
                    }}>
                      {paper.title}
                    </h4>

                    {paper.abstract && (
                      <p style={{
                        fontSize: '0.88rem',
                        color: '#475569',
                        margin: '0 0 14px 0',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {paper.abstract}
                      </p>
                    )}

                    {/* Actions and Metadata Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.82rem',
                      color: '#64748b'
                    }}>
                      <div>
                        Submitted on: <strong>{new Date(paper.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                        {paper.fileName && <span style={{ marginLeft: '12px' }}>📄 {paper.fileName}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Manuscript View Button */}
                        <a
                          href={manuscriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Manuscript in Google Drive"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: '#f0fdf9',
                            color: '#0f3d3e',
                            border: '1px solid #99f6e4',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <FileText size={14} />
                          <span>Manuscript</span>
                        </a>

                        {/* Author Withdraw Submission Action */}
                        {canWithdraw ? (
                          <button
                            type="button"
                            onClick={() => setConfirmWithdrawId(isConfirmingThis ? null : paper.id)}
                            disabled={isWithdrawingThis}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Withdraw</span>
                          </button>
                        ) : (
                          <span
                            title="Manuscripts currently under active peer review or accepted cannot be withdrawn."
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 10px',
                              backgroundColor: '#f8fafc',
                              color: '#94a3b8',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              cursor: 'not-allowed'
                            }}
                          >
                            <Lock size={12} />
                            <span>In Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline Withdrawal Confirmation Dialog */}
                    {isConfirmingThis && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        backgroundColor: '#fff1f2',
                        borderRadius: '8px',
                        border: '1px solid #fca5a5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.84rem' }}>
                          <AlertTriangle size={18} color="#dc2626" />
                          <span>
                            Are you sure you want to withdraw <strong>{paper.id}</strong>? This will remove your submission from the conference.
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setConfirmWithdrawId(null)}
                            disabled={isWithdrawingThis}
                            className="btn btn-outline-primary btn-sm"
                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdrawPaper(paper.id)}
                            disabled={isWithdrawingThis}
                            style={{
                              padding: '4px 12px',
                              fontSize: '0.8rem',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isWithdrawingThis ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Withdrawing...</span>
                              </>
                            ) : (
                              <span>Yes, Withdraw Manuscript</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status Info Callout */}
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      backgroundColor: statusInfo.bg,
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      color: statusInfo.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                      <span>{statusInfo.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            🔒 All manuscript records are encrypted and secured in Google Cloud & Firebase.
          </span>
          <button onClick={onClose} className="btn btn-outline-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
