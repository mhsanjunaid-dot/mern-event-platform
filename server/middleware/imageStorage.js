import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists for local storage
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const STORAGE_METHOD = process.env.IMAGE_STORAGE || 'cloudinary';

export const uploadImage = async (file) => {
  if (!file) {
    return null;
  }

  if (STORAGE_METHOD === 'local') {
    return uploadImageLocal(file);
  } else {
    return uploadImageCloudinary(file);
  }
};

const uploadImageCloudinary = async (file) => {
  try {
    const bufferStream = Readable.from(file.buffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'event-platform/events',
          resource_type: 'auto',
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      bufferStream.pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const uploadImageLocal = async (file) => {
  try {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      publicId: filename
    };
  } catch (error) {
    console.error('Error uploading to local storage:', error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  if (STORAGE_METHOD === 'local') {
    return deleteImageLocal(publicId);
  } else {
    return deleteImageCloudinary(publicId);
  }
};

const deleteImageCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

const deleteImageLocal = async (filename) => {
  try {
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting image from local storage:', error);
  }
};

export default {
  uploadImage,
  deleteImage
};
