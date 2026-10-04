/**
 * Utilities for parsing and formatting YouTube URLs
 */

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Various YouTube URL regex patterns
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=ID or with extra parameters
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?/i,
    // Shortened URL: youtu.be/ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Embed URL: youtube.com/embed/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Shorts URL: youtube.com/shorts/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
    // Live URL: youtube.com/live/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback generic parameter check
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (url.searchParams.has('v')) {
      const v = url.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.length === 11) {
      return lastPart;
    }
  } catch {
    // ignore URL parsing error
  }

  return null;
}

export function buildYouTubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  const autoParam = autoplay ? '1' : '0';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoParam}&rel=0&modestbranding=1&enablejsapi=1`;
}
