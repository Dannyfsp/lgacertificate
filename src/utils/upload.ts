import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/app';
import { AppError } from './appError';

// Cloudinary configuration
cloudinary.config({
    cloud_name: config.cloudinary.NAME,
    api_key: config.cloudinary.API_KEY,
    api_secret: config.cloudinary.API_SECRET,
});

export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder: string = 'tck_proj'
): Promise<string> => {
  try {
    // Validate the Base64 string and extract the format
    const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
    if (!base64Pattern.test(base64String)) {
      throw new AppError('Invalid Base64 image string. Must include a valid data URI prefix.', 400);
    }

    // Extract just the Base64 data (remove prefix)
    const base64Data = base64String.replace(base64Pattern, '');

    // Calculate the size of the Base64 string in bytes
    const sizeInBytes = (base64Data.length * 3) / 4 -
      (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);

    const maxSize = 3 * 1024 * 1024; // 3MB in bytes

    if (sizeInBytes > maxSize) {
      throw new AppError('Image size exceeds 3MB. Please upload a smaller file.', 400);
    }

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'image',
    });

    // Retrieve and return the URL
    return response.secure_url;
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary');
  }
};
