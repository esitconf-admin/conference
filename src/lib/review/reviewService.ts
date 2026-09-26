import { ManuscriptSubmission, ReviewEvaluation } from '../types';
import { db, isFirebaseConfigured } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAllSubmissions } from '../submission/submissionService';
import { sendConferenceEmail } from '../email/emailService';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'esit_conference_manuscript_submissions';

/**
 * Fetch all papers assigned to a specific technical reviewer
 */
export async function getAssignedPapersForReviewer(
  reviewerUid: string,
  reviewerEmail: string
): Promise<ManuscriptSubmission[]> {
  const allSubmissions = await getAllSubmissions();
  const lowerEmail = (reviewerEmail || '').toLowerCase().trim();

  return allSubmissions.filter(paper => {
    if (!paper.assignedReviewers || paper.assignedReviewers.length === 0) return false;
    return paper.assignedReviewers.some(
      rev => rev === reviewerUid || (rev && rev.toLowerCase() === lowerEmail)
    );
  });
}

/**
 * Submit or update a peer review evaluation for a manuscript
 */
export async function submitPaperEvaluation(
  evaluation: ReviewEvaluation,
  autoUpdateStatus = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const { submissionId } = evaluation;

    // 1. Fetch current paper data
    let currentPaper: ManuscriptSubmission | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'submissions', submissionId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          currentPaper = snap.data() as ManuscriptSubmission;
        }
      } catch (err) {
        console.warn('Firestore fetch warning during evaluation submit:', err);
      }
    }

    if (!currentPaper && typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        const list: ManuscriptSubmission[] = JSON.parse(stored);
        currentPaper = list.find(s => s.id === submissionId) || null;
      }
    }

    if (!currentPaper) {
      return { success: false, error: 'Manuscript record not found.' };
    }

    // 2. Append or update evaluation
    const existingEvaluations = currentPaper.evaluations || [];
    const filteredEvaluations = existingEvaluations.filter(
      e => e.reviewerUid !== evaluation.reviewerUid && e.id !== evaluation.id
    );
    const updatedEvaluations = [...filteredEvaluations, evaluation];

    // Determine status recommendation if applicable
    let newStatus: ManuscriptSubmission['status'] = currentPaper.status;
    if (autoUpdateStatus && currentPaper.status === 'submitted') {
      newStatus = 'under_review';
    }

    const paperUpdates: Partial<ManuscriptSubmission> = {
      evaluations: updatedEvaluations,
      status: newStatus
    };

    // 3. Save updates to Firestore
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'submissions', submissionId), paperUpdates);
      } catch (err) {
        console.error('Firestore evaluation update error:', err);
      }
    }

    // 4. Save to LocalStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
        if (stored) {
          const list: ManuscriptSubmission[] = JSON.parse(stored);
          const updatedList = list.map(p => (p.id === submissionId ? { ...p, ...paperUpdates } : p));
          localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updatedList));
        }
      } catch (lsErr) {
        console.warn('LocalStorage evaluation update warning:', lsErr);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit review evaluation';
    console.error('submitPaperEvaluation error:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Assign a reviewer to a manuscript (Admin action)
 */
export async function assignReviewerToPaper(
  submissionId: string,
  reviewerIdentifier: string // uid or email
): Promise<boolean> {
  try {
    const all = await getAllSubmissions();
    const paper = all.find(p => p.id === submissionId);
    if (!paper) return false;

    const currentAssigned = paper.assignedReviewers || [];
    if (currentAssigned.includes(reviewerIdentifier)) return true;

    const updatedAssigned = [...currentAssigned, reviewerIdentifier];
    const newStatus: ManuscriptSubmission['status'] =
      paper.status === 'submitted' ? 'under_review' : paper.status;

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'submissions', submissionId), {
          assignedReviewers: updatedAssigned,
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Firestore assign reviewer error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        const list: ManuscriptSubmission[] = JSON.parse(stored);
        const updatedList = list.map(p =>
          p.id === submissionId ? { ...p, assignedReviewers: updatedAssigned, status: newStatus } : p
        );
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updatedList));
      }
    }

    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://esit-conference.vercel.app';

    // 1. Notify the Reviewer
    const reviewerEmail = reviewerIdentifier.includes('@') ? reviewerIdentifier : null;
    if (reviewerEmail) {
      sendConferenceEmail({
        to: reviewerEmail,
        recipientName: 'Technical Reviewer',
        subject: `[Action Required] New Manuscript Assigned for Review - ${paper.id}`,
        template: 'reviewer_paper_assigned',
        data: {
          submissionId: paper.id,
          paperTitle: paper.title,
          track: paper.track,
          portalUrl: portalUrl
        }
      }).catch(err => console.warn('Reviewer assignment email failed:', err));
    }

    // 2. Notify the Author (Double-Blind safe: does not disclose reviewer identity)
    if (paper.authorEmail) {
      sendConferenceEmail({
        to: paper.authorEmail,
        recipientName: paper.authorName || 'Author',
        subject: `[${paper.id}] Manuscript Status Update: Under Review - ESIT Conference`,
        template: 'paper_under_review',
        data: {
          submissionId: paper.id,
          paperTitle: paper.title,
          portalUrl: portalUrl
        }
      }).catch(err => console.warn('Author under-review email failed:', err));
    }

    return true;
  } catch (e) {
    console.error('Failed to assign reviewer:', e);
    return false;
  }
}

/**
 * Remove a reviewer from a manuscript (Admin action)
 */
export async function removeReviewerFromPaper(
  submissionId: string,
  reviewerIdentifier: string
): Promise<boolean> {
  try {
    const all = await getAllSubmissions();
    const paper = all.find(p => p.id === submissionId);
    if (!paper) return false;

    const currentAssigned = paper.assignedReviewers || [];
    const updatedAssigned = currentAssigned.filter(r => r !== reviewerIdentifier);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'submissions', submissionId), {
          assignedReviewers: updatedAssigned,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Firestore remove reviewer error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        const list: ManuscriptSubmission[] = JSON.parse(stored);
        const updatedList = list.map(p =>
          p.id === submissionId ? { ...p, assignedReviewers: updatedAssigned } : p
        );
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updatedList));
      }
    }

    return true;
  } catch (e) {
    console.error('Failed to remove reviewer:', e);
    return false;
  }
}
