import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Log configuration (without exposing secret)
console.log('🔧 Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET'
});

/**
 * Upload file to Cloudinary
 * @param {string} fileBuffer - Base64 encoded file data
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'emercare') => {
  try {
    // Validate that we have a base64 string
    if (!fileBuffer || typeof fileBuffer !== 'string') {
      throw new Error('Invalid file data provided');
    }

    console.log('📤 Uploading to Cloudinary...');
    console.log('Cloud name:', cloudinary.config().cloud_name);
    console.log('API key:', cloudinary.config().api_key);
    
    const result = await cloudinary.uploader.upload(fileBuffer, {
      resource_type: 'auto'
    });
    
    console.log('✅ Upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    console.error('Error details:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
};

export default cloudinary;
