/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - Conference Email & Google Drive Manuscript Storage
 * =========================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets -> Extensions -> Apps Script (or script.google.com)
 * 2. Paste this entire code into `Code.gs` and click Save (💾).
 * 3. IMPORTANT (Authorize Permissions):
 *    - In the toolbar dropdown at the top, select function: `testAuthorizationAndCreateFolder`
 *    - Click 'Run' (▶️)
 *    - A popup "Authorization required" will appear -> Click 'Review Permissions' -> Select your Google Account -> Click 'Advanced' -> Click 'Go to Conference (unsafe)' -> Click 'Allow'.
 *    - This grants Google Drive & Gmail permissions to the script.
 * 4. Deploy as Web App:
 *    - Click 'Deploy' -> 'Manage Deployments'
 *    - Click the Pencil icon (Edit)
 *    - Under 'Version', select 'New version' (CRITICAL: Every code update must be deployed as a New Version!)
 *    - Set 'Execute as': 'Me'
 *    - Set 'Who has access': 'Anyone'
 *    - Click 'Deploy'
 */

const SHARED_SECRET = "conference_secret";
const SENDER_NAME = "ESIT Conference Secretariat";
const FOLDER_NAME = "ESIT_Manuscript_Submissions";

// Target Google Drive Folder ID for ESIT Manuscript Submissions
const TARGET_FOLDER_ID = "1A7BPBWVm812p34MAwF06r5G-g-YRP9Od"; 

/**
 * Run this function once in the Apps Script editor to authorize DriveApp and GmailApp permissions!
 */
function testAuthorizationAndCreateFolder() {
  const folder = getOrCreateFolder(FOLDER_NAME);
  Logger.log("✅ Google Drive Folder Ready: " + folder.getName() + " (ID: " + folder.getId() + ")");
  
  const userEmail = Session.getActiveUser().getEmail();
  if (userEmail) {
    GmailApp.sendEmail(userEmail, "ESIT Google Drive & Gmail Service Test", "Google Drive & Gmail API permissions have been authorized successfully for ESIT Conference!");
    Logger.log("✅ Test email sent to: " + userEmail);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "ESIT Conference Google Apps Script Service",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Empty payload received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const body = JSON.parse(e.postData.contents);

    // Verify Shared Secret Key
    if (body.secret && body.secret !== SHARED_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid Secret Key"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 1: Upload Manuscript to Google Drive
    // =========================================================================
    if (body.action === "upload_manuscript" || body.fileData) {
      const { 
        fileData, 
        fileName = "Manuscript.pdf", 
        mimeType = "application/pdf",
        submissionId = "ESIT-" + Date.now(),
        paperTitle = "Untitled Manuscript",
        authorName = "Author",
        authorEmail = "",
        track = "General Track"
      } = body;

      if (!fileData) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Missing fileData (base64 string)"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Remove base64 data URL prefix if present
      let cleanBase64 = fileData;
      if (cleanBase64.indexOf("base64,") > -1) {
        cleanBase64 = cleanBase64.split("base64,")[1];
      }

      // Find or create Drive Folder
      let folder;
      if (TARGET_FOLDER_ID && TARGET_FOLDER_ID.trim() !== "") {
        try {
          folder = DriveApp.getFolderById(TARGET_FOLDER_ID.trim());
        } catch (fErr) {
          folder = getOrCreateFolder(FOLDER_NAME);
        }
      } else {
        folder = getOrCreateFolder(FOLDER_NAME);
      }

      // Decode and create file in Drive
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const safeFileName = "[" + submissionId + "] " + fileName.replace(/[/\\?%*:|"<>]/g, "-");
      const blob = Utilities.newBlob(decodedBytes, mimeType, safeFileName);
      const driveFile = folder.createFile(blob);

      // Make file accessible via link for reviewers/admin
      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        // Sharing permission fallback
      }

      const driveUrl = driveFile.getUrl();
      const fileId = driveFile.getId();

      // Log submission into Google Sheet if script is bound to a spreadsheet
      try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        if (ss) {
          let sheet = ss.getSheetByName("Submissions");
          if (!sheet) {
            sheet = ss.insertSheet("Submissions");
            sheet.appendRow(["Timestamp", "Submission ID", "Paper Title", "Track", "Author Name", "Author Email", "Drive URL", "File Name"]);
            sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#0f3d3e").setFontColor("#ffffff");
          }
          sheet.appendRow([new Date(), submissionId, paperTitle, track, authorName, authorEmail, driveUrl, safeFileName]);
        }
      } catch (sheetErr) {
        // Not bound to spreadsheet or sheet logging skipped
      }

      // Automatically send confirmation email to author if email is provided
      if (authorEmail && authorEmail.includes("@")) {
        try {
          const emailSubject = `[${submissionId}] Manuscript Submission Confirmation - ESIT Conference`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
                <h2 style="margin: 0; color: #ffffff;">ESIT Conference Secretariat</h2>
                <span style="font-size: 13px; color: #fef3c7;">Manuscript Submission Receipt</span>
              </div>
              <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>We are pleased to confirm that your manuscript has been successfully received by the <strong>ESIT Conference Scientific Committee</strong>.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f3d3e; border-radius: 6px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>Submission ID:</strong> <span style="color: #0f3d3e; font-weight: bold;">${submissionId}</span></p>
                  <p style="margin: 4px 0;"><strong>Paper Title:</strong> ${paperTitle}</p>
                  <p style="margin: 4px 0;"><strong>Track:</strong> ${track}</p>
                  <p style="margin: 4px 0;"><strong>Uploaded File:</strong> ${fileName}</p>
                </div>

                <p>Your paper will undergo double-blind peer review by our technical committee. You can monitor your paper's status on the conference portal.</p>
                
                <p>If you need to make any inquiries regarding this paper, please cite your Submission ID <strong>${submissionId}</strong>.</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">King Mongkut's University of Technology North Bangkok & ESIT Secretariat</p>
            </div>
          `;

          GmailApp.sendEmail(authorEmail, emailSubject, "", {
            name: SENDER_NAME,
            htmlBody: emailHtml
          });
        } catch (mailErr) {
          // Email dispatch log
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        message: "Manuscript successfully uploaded to Google Drive",
        submissionId: submissionId,
        driveUrl: driveUrl,
        fileId: fileId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 2: General Transactional Email Dispatcher
    // =========================================================================
    const { to, recipientName = "Valued Participant", subject = "ESIT Conference Notice", template, data } = body;

    if (!to || !to.includes("@")) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing or invalid recipient email ('to')"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    let htmlBody = "";

    if (template === "welcome_author") {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff;">ESIT International Conference</h2>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>Thank you for registering on the <strong>ESIT Conference Portal</strong>.</p>
            <p>Your Author account is now active. You may log in to submit manuscripts, track paper review status, and view the conference program.</p>
            <div style="margin: 20px 0; text-align: center;">
              <a href="${data && data.portalUrl ? data.portalUrl : '#'}" style="background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Go to Conference Portal</a>
            </div>
            <p>If you have any questions, feel free to contact the Secretariat.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">ESIT Conference Secretariat, KMUTNB</p>
        </div>
      `;
    } else if (template === "reviewer_assigned") {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff;">Reviewer Appointment Notice</h2>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>You have been officially appointed as a <strong>Technical Reviewer</strong> for the <strong>ESIT Conference</strong> by the Scientific Committee.</p>
            <p>You can now log in to the portal with your registered email to access manuscripts and submit review scores.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">ESIT Scientific Committee</p>
        </div>
      `;
    } else {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f3d3e; color: #ffffff; padding: 18px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff;">${subject}</h2>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>${data && data.message ? data.message.replace(/\n/g, '<br/>') : "Notification from ESIT Conference"}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">ESIT Conference Secretariat</p>
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

/**
 * Helper to get existing Google Drive folder or create a new one
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}
