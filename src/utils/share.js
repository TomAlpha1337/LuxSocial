/**
 * Share content using Web Share API with clipboard fallback.
 * Returns true if shared successfully, false otherwise.
 */
export async function shareContent({ title, text, url }) {
  const shareUrl = url || window.location.href;

  // Try native Web Share API first (mobile browsers, some desktop)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return true;
    } catch (err) {
      // User cancelled — that's fine
      if (err.name === 'AbortError') return false;
    }
  }

  // Fallback: copy link to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch {
    // Last resort: manual copy
    const ta = document.createElement('textarea');
    ta.value = shareUrl;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}
