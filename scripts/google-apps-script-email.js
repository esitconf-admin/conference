/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - Conference Email Dispatcher (Deploy as Web App)
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this entire code into `Code.gs`
 * 3. Set the SHARED_SECRET constant below to match EMAIL_SERVICE_SECRET in your .env
 * 4. Click 'Deploy' -> 'New Deployment' -> Select 'Web app'
 * 5. Set 'Execute as': 'Me'
 * 6. Set 'Who has access': 'Anyone'
 * 7. Copy the Web App URL and paste into your .env as GOOGLE_APPS_SCRIPT_EMAIL_URL
 */

const SHARED_SECRET = "conference_secret";
const SENDER_NAME = "ESIT Conference Secretariat";

function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);

    if (body.secret !== SHARED_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid Secret Key"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const { to, recipientName, subject, template, data } = body;
    let htmlBody = "";

    if (template === "welcome_author") {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0;">ESIT 2025 International Conference</h2>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>Thank you for registering an account on the <strong>ESIT 2025 Conference Portal</strong>.</p>
            <p>Your Author account is now active. You may log in to submit manuscripts, track paper review status, and view the conference program.</p>
            <div style="margin: 20px 0; text-align: center;">
              <a href="${data && data.portalUrl ? data.portalUrl : '#'}" style="background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Go to Conference Portal</a>
            </div>
            <p>If you have any questions, feel free to contact the Secretariat at <a href="mailto:esit@cit.kmutnb.ac.th">esit@cit.kmutnb.ac.th</a>.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">ESIT 2025 Secretariat, KMUTNB & Amari Pattaya, Thailand.</p>
        </div>
      `;
    } else if (template === "reviewer_assigned") {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0;">Reviewer Appointment Notice</h2>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>You have been officially assigned as a <strong>Technical Reviewer</strong> for the <strong>ESIT 2025 Conference</strong> by the Scientific Committee.</p>
            <p>You can now log in with your account to access the Reviewer Workspace, review assigned manuscripts, and submit feedback scores.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">ESIT 2025 Scientific Committee</p>
        </div>
      `;
    } else {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>${subject}</h3>
          <p>Dear ${recipientName},</p>
          <p>${data && data.message ? data.message : "Notification from ESIT 2025 Conference"}</p>
        </div>
      `;
    }

    GmailApp.sendEmail(to, subject, "", {
      name: SENDER_NAME,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Email successfully dispatched via Gmail API"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
