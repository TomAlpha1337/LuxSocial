/**
 * Cloudinary unsigned upload service for profile photo uploads.
 *
 * Requires the following env vars (set in .env):
 *   VITE_CLOUDINARY_CLOUD_NAME  - Your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET - Your unsigned upload preset name
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image file to Cloudinary with face-detection cropping and optimization.
 *
 * @param {File} file - The image File object to upload
 * @returns {Promise<string>} The secure URL of the uploaded and transformed image
 * @throws {Error} If upload fails or Cloudinary is not configured
 */
export async function uploadImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  // Apply transformations: 400x400 face-crop, auto quality, auto format
  formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Could not parse error response
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }

  return data.secure_url;
}
