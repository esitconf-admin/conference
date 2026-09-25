/**
 * Transactional Email Dispatcher for Next.js Conference App
 * Sends emails through a Google Apps Script Web App backed by Gmail API.
 */

export interface SendEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  template: 'welcome_author' | 'reviewer_assigned' | 'password_reset' | 'manuscript_submitted' | 'admin_alert';
  data?: Record<string, string | number | boolean | undefined>;
}

export async function sendConferenceEmail(payload: SendEmailPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL;
    const secret = process.env.EMAIL_SERVICE_SECRET || 'conference_secret_2025';

    if (!webhookUrl) {
      console.info('ℹ️ [Email Dispatcher Simulation] No GOOGLE_APPS_SCRIPT_EMAIL_URL configured. Logged email preview:', {
        to: payload.to,
        subject: payload.subject,
        template: payload.template,
        data: payload.data
      });
      return { success: true, message: 'Simulated email delivery (logged to console).' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        ...payload,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Email server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return { success: result.status === 'ok', message: result.message };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email error';
    console.error('Email dispatch failed:', errorMsg);
    return { success: false, message: errorMsg };
  }
}
