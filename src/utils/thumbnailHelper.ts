/**
 * Thumbnail Helper Utilities
 * Provides functions to get thumbnails from various video platforms
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // youtu.be format: https://youtu.be/VIDEO_ID or https://youtu.be/VIDEO_ID?si=xxx
  const youtuBeMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (youtuBeMatch) {
    return youtuBeMatch[1];
  }

  // youtube.com/watch format: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeMatch = url.match(/[?&]v=([^&]+)/);
  if (youtubeMatch) {
    return youtubeMatch[1];
  }

  // youtube.com/embed format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

/**
 * Get YouTube thumbnail URL from video URL
 * @param url - YouTube video URL
 * @param quality - Thumbnail quality ('max', 'sd', 'hq', 'mq', 'default')
 */
export function getYouTubeThumbnail(
  url: string,
  quality: 'max' | 'sd' | 'hq' | 'mq' | 'default' = 'max'
): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const qualityMap = {
    max: 'maxresdefault.jpg',     // 1280x720 (best quality)
    sd: 'sddefault.jpg',           // 640x480
    hq: 'hqdefault.jpg',           // 480x360
    mq: 'mqdefault.jpg',           // 320x180
    default: 'default.jpg',        // 120x90
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

/**
 * Get Vimeo thumbnail (requires API call - this is a placeholder)
 */
export async function getVimeoThumbnail(url: string): Promise<string | null> {
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (!vimeoMatch) return null;

  const videoId = vimeoMatch[1];
  
  try {
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
    const data = await response.json();
    return data[0]?.thumbnail_large || null;
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error);
    return null;
  }
}

/**
 * Get thumbnail from video URL - automatically detects platform
 * @param videoUrl - Video URL
 * @param customThumbnail - Custom thumbnail URL (takes priority)
 */
export function getVideoThumbnail(
  videoUrl: string,
  customThumbnail?: string | null
): string {
  // If custom thumbnail is provided, use it
  if (customThumbnail) {
    return customThumbnail;
  }

  // Try to get YouTube thumbnail
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const thumbnail = getYouTubeThumbnail(videoUrl);
    if (thumbnail) return thumbnail;
  }

  // Fallback to placeholder
  return 'https://via.placeholder.com/400x300?text=Video+Thumbnail';
}

/**
 * Check if thumbnail URL is valid (loads successfully)
 */
export async function isThumbnailValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Get best available thumbnail with fallback
 * Tries multiple qualities for YouTube if maxresdefault doesn't exist
 */
export async function getBestYouTubeThumbnail(url: string): Promise<string> {
  const qualities: Array<'max' | 'sd' | 'hq' | 'mq' | 'default'> = ['max', 'sd', 'hq', 'mq'];
  
  for (const quality of qualities) {
    const thumbnail = getYouTubeThumbnail(url, quality);
    if (thumbnail && await isThumbnailValid(thumbnail)) {
      return thumbnail;
    }
  }

  return 'https://via.placeholder.com/400x300?text=Video+Thumbnail';
}






