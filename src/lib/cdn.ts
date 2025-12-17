/**
 * CDN Upload Client
 * Handles file uploads to cdn.tengra.studio with authentication
 */

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.tengra.studio';

export interface UploadResult {
  id: string;
  url: string;
  width?: number;
  expires_at?: number;
}

export interface UploadOptions {
  category?: 'avatar' | 'post' | 'general' | 'projects';
  ttl?: number; // Time to live in seconds (for temporary uploads)
}

/**
 * Upload a file to the CDN
 * @param file - File to upload
 * @param userToken - User's authentication token
 * @param options - Upload options (category, ttl)
 */
export async function uploadToCDN(
  file: File,
  userToken: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { category = 'general', ttl } = options;

  // Build query params
  const params = new URLSearchParams();
  params.append('category', category);
  if (ttl) {
    params.append('ttl', ttl.toString());
  }

  const url = `${CDN_BASE_URL}/upload?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
    },
    body: file,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`CDN upload failed: ${error}`);
  }

  return response.json();
}

/**
 * Get CDN URL for a file
 * @param fileId - Hash ID from upload
 * @param resize - Optional resize parameters
 */
export function getCDNUrl(
  fileId: string,
  resize?: { width?: number; height?: number }
): string {
  let url = `${CDN_BASE_URL}/${fileId}.png`;
  
  if (resize) {
    const params = new URLSearchParams();
    if (resize.width) params.append('w', resize.width.toString());
    if (resize.height) params.append('h', resize.height.toString());
    url += `?${params.toString()}`;
  }
  
  return url;
}

/**
 * Upload avatar (convenience wrapper)
 */
export async function uploadAvatar(
  file: File,
  userToken: string
): Promise<UploadResult> {
  return uploadToCDN(file, userToken, { category: 'avatar' });
}

/**
 * Upload post image (convenience wrapper)
 */
export async function uploadPostImage(
  file: File,
  userToken: string
): Promise<UploadResult> {
  return uploadToCDN(file, userToken, { category: 'post' });
}

/**
 * Upload temporary file (convenience wrapper)
 */
export async function uploadTemp(
  file: File,
  userToken: string,
  ttl: number = 3600
): Promise<UploadResult> {
  return uploadToCDN(file, userToken, { ttl });
}
/**
 * Upload project image (convenience wrapper)
 */
export async function uploadProjectImage(
  file: File,
  userToken: string
): Promise<UploadResult> {
  return uploadToCDN(file, userToken, { category: 'projects' });
}
