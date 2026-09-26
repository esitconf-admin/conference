'use client';

import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, Clock, Star, FileText, Send, RefreshCw,
  Sparkles, ExternalLink, ShieldCheck, AlertCircle, Award, ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { ManuscriptSubmission, ReviewEvaluation } from '../../lib/types';
import { getAssignedPapersForReviewer, submitPaperEvaluation } from '../../lib/review/reviewService';

interface ReviewerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

const CRITERIA_DEFINITIONS = [
  { key: 'originality', label: '1. Originality & Novelty', desc: 'Is the research approach or contribution sufficiently novel and innovative?' },
  { key: 'technical', label: '2. Technical Rigor & Correctness', desc: 'Are theoretical concepts, simulations, or mathematical models valid?' },
  { key: 'methodology', label: '3. Methodology & Results', desc: 'Are experimental methods sound and data interpretation clear?' },
  { key: 'clarity', label: '4. Clarity & Formatting', desc: 'Is the manuscript well-structured following IEEE formatting guidelines?' },
  { key: 'relevance', label: '5. Relevance to Conference Track', desc: 'Does the subject fit within the designated track scope?' }
] as const;

export default function ReviewerPortalModal({
  isOpen,
  onClose,
  onRequireAuth
}: ReviewerPortalModalProps) {
  const { currentUser, isReviewer, isAdmin } = useAuth();
  const { content } = useConferenceData();

  const [assignedPapers, setAssignedPapers] = useState<ManuscriptSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Active form state
  const [originalityScore, setOriginalityScore] = useState<number>(4);
  const [technicalScore, setTechnicalScore] = useState<number>(4);
  const [methodologyScore, setMethodologyScore] = useState<number>(4);
  const [clarityScore, setClarityScore] = useState<number>(4);
  const [relevanceScore, setRelevanceScore] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<ReviewEvaluation['recommendation']>('accept');
  const [commentsForAuthor, setCommentsForAuthor] = useState<string>('');
  const [confidentialComments, setConfidentialComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchAssigned = async () => {
    if (!currentUser) return;
    setLoading(true);
    const papers = await getAssignedPapersForReviewer(currentUser.uid, currentUser.email);
    setAssignedPapers(papers);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchAssigned();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div style={overlayStyle}>
        <div style={authPromptModalStyle}>
          <div style={authIconStyle}>
            <Award size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f3d3e', marginBottom: '8px' }}>
            Reviewer Sign-In Required
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Please sign in with your appointed Technical Reviewer account to evaluate assigned papers.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-outline-primary btn-sm">Close</button>
            <button onClick={() => { onClose(); onRequireAuth(); }} className="btn btn-primary btn-sm">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isReviewer && !isAdmin) {
    return (
      <div style={overlayStyle}>
        <div style={authPromptModalStyle}>
          <div style={{ ...authIconStyle, backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f3d3e', marginBottom: '8px' }}>
            Technical Reviewer Access Only
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Your account (<strong>{currentUser.email}</strong>) does not have Reviewer privileges yet.
            Please contact the ESIT Scientific Committee Secretariat to receive reviewer appointment.
          </p>
          <button onClick={onClose} className="btn btn-outline-primary btn-sm">Close</button>
        </div>
      </div>
    );
  }

  const openEvaluationForm = (paper: ManuscriptSubmission) => {
    if (activeSubmissionId === paper.id) {
      setActiveSubmissionId(null);
      return;
    }

    const myExistingEval = (paper.evaluations || []).find(
      e => e.reviewerUid === currentUser.uid || e.reviewerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );

    if (myExistingEval) {
      setOriginalityScore(myExistingEval.originalityScore || 4);
      setTechnicalScore(myExistingEval.technicalScore || 4);
      setMethodologyScore(myExistingEval.methodologyScore || 4);
      setClarityScore(myExistingEval.clarityScore || 4);
      setRelevanceScore(myExistingEval.relevanceScore || 4);
      setRecommendation(myExistingEval.recommendation || 'accept');
      setCommentsForAuthor(myExistingEval.commentsForAuthor || '');
      setConfidentialComments(myExistingEval.confidentialCommentsForAdmin || '');
    } else {
      setOriginalityScore(4);
      setTechnicalScore(4);
      setMethodologyScore(4);
      setClarityScore(4);
      setRelevanceScore(4);
      setRecommendation('accept');
      setCommentsForAuthor('');
      setConfidentialComments('');
    }

    setActiveSubmissionId(paper.id);
  };

  const calculatedAverage = Number(
    ((originalityScore + technicalScore + methodologyScore + clarityScore + relevanceScore) / 5).toFixed(1)
  );

  const handleSubmitReview = async (e: React.FormEvent, paper: ManuscriptSubmission) => {
    e.preventDefault();
    if (!commentsForAuthor.trim()) {
      alert('Please provide feedback comments for the authors.');
      return;
    }

    setSubmitting(true);
    const evalData: ReviewEvaluation = {
      id: `rev_${paper.id}_${currentUser.uid}`,
      submissionId: paper.id,
      reviewerUid: currentUser.uid,
      reviewerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Peer Reviewer',
      reviewerEmail: currentUser.email,
      originalityScore,
      technicalScore,
      methodologyScore,
      clarityScore,
      relevanceScore,
      overallScore: calculatedAverage,
      recommendation,
      commentsForAuthor: commentsForAuthor.trim(),
      confidentialCommentsForAdmin: confidentialComments.trim(),
      submittedAt: new Date().toISOString()
    };

    const res = await submitPaperEvaluation(evalData, true);
    setSubmitting(false);

    if (res.success) {
      setSuccessBanner(`Evaluation for paper ${paper.id} submitted successfully! Score: ${calculatedAverage}/5.0`);
      setActiveSubmissionId(null);
      fetchAssigned();
      setTimeout(() => setSuccessBanner(null), 5000);
    } else {
      alert(res.error || 'Failed to submit evaluation.');
    }
  };

  const filteredPapers = assignedPapers.filter(p => {
    const hasMyEval = (p.evaluations || []).some(
      e => e.reviewerUid === currentUser.uid || e.reviewerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (filterStatus === 'pending') return !hasMyEval;
    if (filterStatus === 'completed') return hasMyEval;
    return true;
  });

  const completedCount = assignedPapers.filter(p =>
    (p.evaluations || []).some(
      e => e.reviewerUid === currentUser.uid || e.reviewerEmail.toLowerCase() === currentUser.email.toLowerCase()
    )
  ).length;

  return (
    <div style={overlayStyle}>
      <div style={modalContainerStyle}>
        
        {/* Header Banner */}
        <div style={headerBannerStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fef3c7', textTransform: 'uppercase' }}>
                {content.hero.edition} Technical Committee
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
              Peer-Review Evaluation Portal
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchAssigned}
              disabled={loading}
              title="Refresh assigned papers"
              style={iconButtonStyle}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} style={iconButtonStyle}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Subheader bar with Reviewer Info & Stats */}
        <div style={subheaderStyle}>
          <div style={{ fontSize: '0.88rem', color: '#334155' }}>
            Reviewer: <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.organization})
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Progress: <strong>{completedCount}/{assignedPapers.length}</strong> Completed
            </span>
            <div style={{
              display: 'flex',
              backgroundColor: '#e2e8f0',
              borderRadius: '6px',
              padding: '2px'
            }}>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                style={getFilterBtnStyle(filterStatus === 'all')}
              >
                All ({assignedPapers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                style={getFilterBtnStyle(filterStatus === 'pending')}
              >
                Pending ({assignedPapers.length - completedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('completed')}
                style={getFilterBtnStyle(filterStatus === 'completed')}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {successBanner && (
            <div style={successBannerStyle}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successBanner}</span>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#0f3d3e' }} />
              <p style={{ margin: 0, fontSize: '0.92rem' }}>Loading assigned manuscripts...</p>
            </div>
          ) : assignedPapers.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconCircleStyle}>
                <Award size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', color: '#0f3d3e', marginBottom: '8px' }}>
                No Manuscripts Assigned Yet
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                You have not been assigned any papers to review for {content.hero.edition} at this time. The Scientific Committee will assign papers based on your technical track expertise.
              </p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No papers found matching the selected filter ({filterStatus}).
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredPapers.map((paper) => {
                const myEval = (paper.evaluations || []).find(
                  e => e.reviewerUid === currentUser.uid || e.reviewerEmail.toLowerCase() === currentUser.email.toLowerCase()
                );
                const isExpanded = activeSubmissionId === paper.id;
                const manuscriptUrl = paper.pdfUrl || 'https://drive.google.com/drive/folders/1A7BPBWVm812p34MAwF06r5G-g-YRP9Od';

                return (
                  <div
                    key={paper.id}
                    style={{
                      borderRadius: '12px',
                      border: myEval ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Paper Summary Bar */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={trackingIdBadgeStyle}>{paper.id}</span>
                          <span style={trackBadgeStyle}>{paper.track}</span>
                        </div>

                        {/* Review Evaluation Status Badge */}
                        {myEval ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            <CheckCircle2 size={14} />
                            <span>Evaluated: {myEval.overallScore}/5.0 ⭐ ({myEval.recommendation.replace('_', ' ')})</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#d97706',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            <Clock size={14} />
                            <span>Evaluation Pending</span>
                          </div>
                        )}
                      </div>

                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f3d3e', fontWeight: 700, lineHeight: '1.4' }}>
                        {paper.title}
                      </h4>

                      {paper.abstract && (
                        <p style={{
                          fontSize: '0.88rem',
                          color: '#475569',
                          margin: '0 0 14px 0',
                          lineHeight: '1.6',
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: isExpanded ? undefined : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {paper.abstract}
                        </p>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Double-Blind Peer Review • {paper.fileName && <span>📄 {paper.fileName}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <a
                            href={manuscriptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={manuscriptLinkStyle}
                            title="Read Manuscript PDF"
                          >
                            <FileText size={14} />
                            <span>Manuscript</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => openEvaluationForm(paper)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor: isExpanded ? '#0f3d3e' : myEval ? '#eff6ff' : '#f59e0b',
                              color: isExpanded ? '#ffffff' : myEval ? '#1d4ed8' : '#ffffff',
                              border: isExpanded ? '1px solid #0f3d3e' : myEval ? '1px solid #bfdbfe' : 'none'
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <span>Close Form</span>
                                <ChevronUp size={14} />
                              </>
                            ) : myEval ? (
                              <>
                                <span>Edit Evaluation</span>
                                <ChevronDown size={14} />
                              </>
                            ) : (
                              <>
                                <Star size={14} />
                                <span>Score & Evaluate</span>
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDABLE EVALUATION FORM */}
                    {isExpanded && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '24px',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h5 style={{ margin: 0, fontSize: '1rem', color: '#0f3d3e', fontWeight: 700 }}>
                            Technical Evaluation & Scoring Sheet
                          </h5>
                          <div style={{
                            padding: '6px 14px',
                            backgroundColor: '#0f3d3e',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem'
                          }}>
                            Live Average Score: <span style={{ color: '#f59e0b', fontSize: '1rem' }}>{calculatedAverage}</span> / 5.0
                          </div>
                        </div>

                        <form onSubmit={(e) => handleSubmitReview(e, paper)} style={{ display: 'grid', gap: '18px' }}>
                          {/* 5 Evaluation Criteria */}
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {CRITERIA_DEFINITIONS.map(crit => {
                              const scoreVal =
                                crit.key === 'originality' ? originalityScore :
                                crit.key === 'technical' ? technicalScore :
                                crit.key === 'methodology' ? methodologyScore :
                                crit.key === 'clarity' ? clarityScore : relevanceScore;

                              const setScoreFn =
                                crit.key === 'originality' ? setOriginalityScore :
                                crit.key === 'technical' ? setTechnicalScore :
                                crit.key === 'methodology' ? setMethodologyScore :
                                crit.key === 'clarity' ? setClarityScore : setRelevanceScore;

                              return (
                                <div
                                  key={crit.key}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    padding: '14px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                                      {crit.label}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                      {crit.desc}
                                    </div>
                                  </div>

                                  {/* 1 - 5 Rating Radios */}
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setScoreFn(rating)}
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '8px',
                                          border: scoreVal === rating ? '2px solid #0f3d3e' : '1px solid #cbd5e1',
                                          backgroundColor: scoreVal === rating ? '#0f3d3e' : '#ffffff',
                                          color: scoreVal === rating ? '#ffffff' : '#475569',
                                          fontWeight: 700,
                                          fontSize: '0.88rem',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        {rating}
                                      </button>
                                    ))}
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>
                                      ({scoreVal === 5 ? 'Excellent' : scoreVal === 4 ? 'Very Good' : scoreVal === 3 ? 'Good' : scoreVal === 2 ? 'Fair' : 'Poor'})
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Recommendation Selector */}
                          <div>
                            <label style={formLabelStyle}>
                              Final Peer Review Recommendation *
                            </label>
                            <select
                              value={recommendation}
                              onChange={(e) => setRecommendation(e.target.value as ReviewEvaluation['recommendation'])}
                              style={formSelectStyle}
                            >
                              <option value="accept">✅ Accept for Oral Presentation</option>
                              <option value="minor_revision">📝 Accept with Minor Revisions</option>
                              <option value="major_revision">⚠️ Major Revisions Required</option>
                              <option value="reject">❌ Decline / Reject</option>
                            </select>
                          </div>

                          {/* Comments for Authors */}
                          <div>
                            <label style={formLabelStyle}>
                              Comments & Constructive Feedback for Authors *
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={commentsForAuthor}
                              onChange={(e) => setCommentsForAuthor(e.target.value)}
                              placeholder="Detail strengths, technical suggestions, or required revisions for the authors..."
                              style={formTextareaStyle}
                            />
                            <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                              This feedback will be shared with the authors upon decision notification.
                            </span>
                          </div>

                          {/* Confidential Comments for Admin */}
                          <div>
                            <label style={formLabelStyle}>
                              Confidential Comments for Scientific Committee / Secretariat (Optional)
                            </label>
                            <textarea
                              rows={3}
                              value={confidentialComments}
                              onChange={(e) => setConfidentialComments(e.target.value)}
                              placeholder="Any private notes for the conference chairs or track directors only..."
                              style={formTextareaStyle}
                            />
                          </div>

                          {/* Form Submit & Cancel */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setActiveSubmissionId(null)}
                              className="btn btn-outline-primary btn-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px' }}
                            >
                              <Send size={15} />
                              <span>{submitting ? 'Submitting Evaluation...' : 'Submit Evaluation Score'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={footerBarStyle}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            🔒 All peer-review evaluations are stored securely and encrypted in Google Cloud & Firebase.
          </span>
          <button onClick={onClose} className="btn btn-outline-primary btn-sm">
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}

// Styles
const overlayStyle: React.CSSProperties = {
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
};

const modalContainerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  maxWidth: '880px',
  width: '100%',
  maxHeight: '92vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const headerBannerStyle: React.CSSProperties = {
  padding: '20px 24px',
  backgroundColor: '#0f3d3e',
  color: '#ffffff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0
};

const iconButtonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center'
};

const subheaderStyle: React.CSSProperties = {
  padding: '12px 24px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px'
};

const trackingIdBadgeStyle: React.CSSProperties = {
  backgroundColor: '#0f3d3e',
  color: '#ffffff',
  padding: '4px 10px',
  borderRadius: '6px',
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.5px'
};

const trackBadgeStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748b',
  backgroundColor: '#f1f5f9',
  padding: '3px 8px',
  borderRadius: '4px',
  fontWeight: 600
};

const manuscriptLinkStyle: React.CSSProperties = {
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
};

const formLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.84rem',
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: '4px'
};

const formSelectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  backgroundColor: '#ffffff'
};

const formTextareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  lineHeight: '1.5'
};

const footerBarStyle: React.CSSProperties = {
  padding: '16px 24px',
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '2px dashed #cbd5e1'
};

const emptyIconCircleStyle: React.CSSProperties = {
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
};

const successBannerStyle: React.CSSProperties = {
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
};

const authPromptModalStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  maxWidth: '460px',
  width: '100%',
  padding: '30px',
  textAlign: 'center',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

const authIconStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#ecfdf5',
  color: '#059669',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px auto'
};

const getFilterBtnStyle = (active: boolean): React.CSSProperties => ({
  border: 'none',
  backgroundColor: active ? '#0f3d3e' : 'transparent',
  color: active ? '#ffffff' : '#64748b',
  padding: '4px 10px',
  borderRadius: '5px',
  fontSize: '0.78rem',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer'
});
