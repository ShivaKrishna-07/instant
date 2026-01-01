import cloudinary from '../config/cloudinaryConfig.js';
import streamifier from 'streamifier';

/**
 * Upload a local file by path to Cloudinary
 * @param {string} filePath
 * @param {object} options - upload options (folder, public_id, transformation...)
 */
export async function uploadFromPath(filePath, options = {}) {
  return cloudinary.uploader.upload(filePath, options);
}

/**
 * Upload a Buffer (for example from multer memory storage) to Cloudinary
 * @param {Buffer} buffer
 * @param {object} options
 */
export function uploadFromBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Delete a resource by public_id
 * @param {string} publicId
 * @param {object} options
 */
export async function deleteResource(publicId, options = {}) {
  return cloudinary.uploader.destroy(publicId, options);
}

/**
 * Generate a Cloudinary URL with optional transformation options
 * @param {string} publicId
 * @param {object} options
 */
export function generateUrl(publicId, options = {}) {
  return cloudinary.url(publicId, options);
}

export default {
  uploadFromPath,
  uploadFromBuffer,
  deleteResource,
  generateUrl
};
