import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

/**
 * Configure Cloudinary with credentials from environment variables
 * NOTE: env vars should already be loaded by dotenv.config() in server.js
 */

// Initialize cloudinary config - will be properly configured when used
const initCloudinaryConfig = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };
  
  cloudinary.config(config);
  
  // Debug logging
  console.log('🔧 Cloudinary Configuration:');
  console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ ' + process.env.CLOUDINARY_CLOUD_NAME : '❌ undefined');
  console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✅ ' + process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : '❌ Missing');
  console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ ' + process.env.CLOUDINARY_API_SECRET.substring(0, 5) + '...' : '❌ Missing');
  
  // Verify configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('⚠️  WARNING: Cloudinary credentials are incomplete or missing!');
    console.error('   Image uploads will not work properly.');
  }
};

// Initialize on first use
let configInitialized = false;
const ensureConfigured = () => {
  if (!configInitialized) {
    initCloudinaryConfig();
    configInitialized = true;
  }
};

/**
 * Use memory storage - we'll upload directly to Cloudinary from the buffer
 * This is more reliable than CloudinaryStorage from multer-storage-cloudinary
 */
const storage = multer.memoryStorage();

console.log('✅ Multer memory storage initialized');

/**
 * Multer middleware for handling file uploads
 * Limits: 5MB file size
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

/**
 * Simple error handling wrapper for upload
 */
export const uploadWithErrorHandling = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('❌ Upload Error:', err.message);
        // Don't fail the request, just continue without the image
        req.file = null;
        console.log('⚠️  Continuing without image upload');
        next();
      } else {
        next();
      }
    });
  };
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Deleted image: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting image: ${error.message}`);
    throw error;
  }
};

/**
 * Upload stream helper
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  // Ensure configuration is initialized before uploading
  ensureConfigured();
  
  // Reconfigure cloudinary before upload to ensure fresh credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  
  console.log('🔍 Pre-upload cloudinary status:');
  console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
  console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌');
  console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌');
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'dental-clinic/doctors',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Upload stream callback error:', error);
          reject(error);
        }
        else {
          console.log('✅ Upload successful:', {
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
          resolve(result);
        }
      }
    );
    uploadStream.on('error', (err) => {
      console.error('❌ Upload stream error event:', err);
      reject(err);
    });
    uploadStream.end(buffer);
  });
};

export { cloudinary, ensureConfigured };
