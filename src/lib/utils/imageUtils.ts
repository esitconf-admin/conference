/**
 * Utility to convert various image sharing URLs (Google Drive, Dropbox, direct CDN)
 * into direct, embeddable image URLs that work seamlessly in <img />, Next.js <Image />,
 * CSS background images, and social preview crawler meta tags (og:image).
 */

export function formatGoogleDriveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Already a Google UserContent direct CDN link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  // Handle Google Drive links
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    // 1. Format: https://drive.google.com/file/d/FILE_ID/view...
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }

    // 2. Format: https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID or &id=FILE_ID
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }

    // 3. Format: https://drive.google.com/d/FILE_ID
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
    }
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
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}
