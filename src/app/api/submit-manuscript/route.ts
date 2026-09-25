import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const webhookUrl =
      process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      'https://script.google.com/macros/s/AKfycbwa0aSvk0VBHls6RSAJ-G1aZfykaBDU8TzFDfnDo9A42Kk5nepBTjZ9GpdOvPGWxQ1P/exec';

    const secret =
      process.env.EMAIL_SERVICE_SECRET ||
      process.env.NEXT_PUBLIC_EMAIL_SERVICE_SECRET ||
      'conference_secret';

    const payload = {
      action: 'upload_manuscript',
      secret,
      submissionId: body.submissionId,
      paperTitle: body.paperTitle || body.title,
      authorName: body.authorName,
      authorEmail: body.authorEmail,
      track: body.track,
      fileName: body.fileName,
      mimeType: body.mimeType || 'application/pdf',
      fileData: body.fileData
    };

    let driveUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(body.submissionId || '')}`;
    let fileId = '';

    if (webhookUrl) {
      try {
        const gasResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });

        const gasText = await gasResponse.text();
        try {
          const gasJson = JSON.parse(gasText);
          if (gasJson && gasJson.driveUrl) {
            driveUrl = gasJson.driveUrl;
            fileId = gasJson.fileId || '';
          }
        } catch {
          // If response was not JSON, driveUrl remains fallback
        }
      } catch (err) {
        console.error('Error forwarding manuscript to Google Apps Script:', err);
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: body.submissionId,
      driveUrl,
      fileId
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process manuscript upload';
    console.error('API submit-manuscript error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
