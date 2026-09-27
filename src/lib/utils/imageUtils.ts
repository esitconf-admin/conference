/**
 * Extracts Google Drive file ID from all sharing and multi-account URL variations:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/u/0/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */
export function extractGoogleDriveFileId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already a direct usercontent link: https://lh3.googleusercontent.com/d/FILE_ID
  const lhMatch = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lhMatch && lhMatch[1]) return lhMatch[1];

  if (!trimmed.includes('google.com')) return null;

  // 1. Matches: /d/FILE_ID (covers /file/d/..., /file/u/0/d/..., /drive/folders/..., /d/...)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  // 2. Matches: ?id=FILE_ID or &id=FILE_ID (covers open?id=..., uc?id=..., thumbnail?id=...)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // 3. Matches: /file/d/FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  return null;
}

/**
 * Utility to convert various image sharing URLs (Google Drive, Dropbox, direct CDN)
 * into direct, embeddable image URLs that work seamlessly in <img />, Next.js <Image />,
 * CSS background images, and social preview crawler meta tags (og:image).
 */
export function formatGoogleDriveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Handle Dropbox sharing links (converting dl=0 to raw=1 for direct streaming)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  return trimmed;
}

/**
 * Checks if a string is a Google Drive link that needs/can be converted
 */
export function isGoogleDriveUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return extractGoogleDriveFileId(url) !== null || url.includes('drive.google.com') || url.includes('docs.google.com');
}
