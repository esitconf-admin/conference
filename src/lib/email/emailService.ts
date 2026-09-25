/**
 * Transactional Email Dispatcher for Next.js Conference App
 * Sends emails through a Google Apps Script Web App backed by Gmail API.
 */

export interface SendEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  template: 'welcome_author' | 'reviewer_assigned' | 'password_reset' | 'manuscript_submitted' | 'admin_alert' | 'custom_message';
  data?: Record<string, string | number | boolean | undefined>;
}

export async function sendConferenceEmail(payload: SendEmailPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const webhookUrl = 
      process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL || 
      process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      'https://script.google.com/macros/s/AKfycbwa0aSvk0VBHls6RSAJ-G1aZfykaBDU8TzFDfnDo9A42Kk5nepBTjZ9GpdOvPGWxQ1P/exec';
      
    const secret = 
      process.env.EMAIL_SERVICE_SECRET || 
      process.env.NEXT_PUBLIC_EMAIL_SERVICE_SECRET || 
      'conference_secret';

    if (!webhookUrl) {
      console.info('ℹ️ [Email Dispatcher Simulation] Logged email preview:', {
        to: payload.to,
        subject: payload.subject,
        template: payload.template,
        data: payload.data
      });
      return { success: true, message: 'Simulated email delivery (logged to console).' };
    }

    const postPayload = JSON.stringify({
      secret,
      to: payload.to,
      recipientName: payload.recipientName,
      subject: payload.subject,
      template: payload.template,
      data: payload.data,
      timestamp: new Date().toISOString()
    });

    // Google Apps Script Web Apps handle text/plain without triggering CORS OPTIONS preflight failures
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: postPayload
    });

    return { 
      success: true, 
      message: `Email notification dispatched to ${payload.to} via Gmail API!` 
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email error';
    console.error('Email dispatch failed:', errorMsg);
    return { success: false, message: errorMsg };
  }
}
