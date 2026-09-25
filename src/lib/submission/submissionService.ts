import { ManuscriptSubmission } from '../types';
import { db, isFirebaseConfigured } from '../firebase/config';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'esit_conference_manuscript_submissions';

export interface UploadManuscriptParams {
  file: File;
  title: string;
  abstract: string;
  track: string;
  coAuthors?: string;
  authorUid: string;
  authorName: string;
  authorEmail: string;
  authorOrganization: string;
}

/**
 * Uploads manuscript PDF file to Google Drive via Google Apps Script Web App
 * and logs the full structured submission record into Firebase Firestore.
 */
export async function submitManuscript(
  params: UploadManuscriptParams
): Promise<{ success: boolean; submissionId?: string; driveUrl?: string; error?: string }> {
  try {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `ESIT-${year}-${randomSuffix}`;

    const webhookUrl = 
      process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL || 
      process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      'https://script.google.com/macros/s/AKfycbwa0aSvk0VBHls6RSAJ-G1aZfykaBDU8TzFDfnDo9A42Kk5nepBTjZ9GpdOvPGWxQ1P/exec';

    const secret = 
      process.env.EMAIL_SERVICE_SECRET || 
      process.env.NEXT_PUBLIC_EMAIL_SERVICE_SECRET || 
      'conference_secret';

    // 1. Convert File to Base64
    const base64Data = await fileToBase64(params.file);

    // 2. Post file to API route which uploads to Google Drive & triggers confirmation email
    let driveUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(submissionId)}`;
    let driveFileId: string | undefined = undefined;

    try {
      const response = await fetch('/api/submit-manuscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId,
          paperTitle: params.title,
          authorName: params.authorName,
          authorEmail: params.authorEmail,
          track: params.track,
          fileName: params.file.name,
          mimeType: params.file.type || 'application/pdf',
          fileData: base64Data
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.driveUrl) {
          driveUrl = json.driveUrl;
        }
        if (json.fileId) {
          driveFileId = json.fileId;
        }
      }
    } catch (apiErr) {
      console.warn('API route upload warning, proceeding with Firestore save:', apiErr);
    }

    // 3. Prepare complete submission document
    const submissionDoc: ManuscriptSubmission = {
      id: submissionId,
      title: params.title.trim(),
      abstract: params.abstract.trim(),
      track: params.track,
      coAuthors: params.coAuthors ? params.coAuthors.trim() : '',
      authorUid: params.authorUid,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
      organization: params.authorOrganization,
      fileName: params.file.name,
      pdfUrl: driveUrl,
      status: 'submitted',
      submittedAt: timestamp.toISOString(),
      assignedReviewers: []
    };

    // 4. Save to Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'submissions', submissionId), submissionDoc);
      } catch (firestoreErr) {
        console.error('Firestore submission write error:', firestoreErr);
      }
    }

    // 5. Save to LocalStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
        const list: ManuscriptSubmission[] = stored ? JSON.parse(stored) : [];
        list.unshift(submissionDoc);
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(list));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }
    }

    return {
      success: true,
      submissionId,
      driveUrl
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit manuscript';
    console.error('Submission error:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Helper to fetch all submissions from Firestore or LocalStorage
 */
export async function getAllSubmissions(): Promise<ManuscriptSubmission[]> {
  let submissions: ManuscriptSubmission[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'submissions'));
      submissions = snap.docs.map(d => d.data() as ManuscriptSubmission);
    } catch (err) {
      console.warn('Firestore getDocs failed for submissions, checking local storage:', err);
    }
  }

  if (submissions.length === 0 && typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    if (stored) {
      try {
        submissions = JSON.parse(stored);
      } catch {
        submissions = [];
      }
    }
  }

  // Sort by submission date newest first
  return submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

/**
 * Updates submission status (e.g. accepted, under_review, rejected) in Firestore & LocalStorage
 */
export async function updateSubmissionStatus(
  submissionId: string,
  updates: Partial<ManuscriptSubmission>
): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update submission in Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        const list: ManuscriptSubmission[] = JSON.parse(stored);
        const updatedList = list.map(sub => sub.id === submissionId ? { ...sub, ...updates } : sub);
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updatedList));
      }
    } catch (e) {
      console.warn('LocalStorage update failed:', e);
    }
  }

  return true;
}

/**
 * Converts File object to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
