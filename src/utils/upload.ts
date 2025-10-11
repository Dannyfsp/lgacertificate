import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/app';

// Cloudinary configuration
cloudinary.config({
    cloud_name: config.cloudinary.NAME,
    api_key: config.cloudinary.API_KEY,
    api_secret: config.cloudinary.API_SECRET,
});

export const uploadBase64ToCloudinary = async (base64String: string, folder: string = 'tck_proj'): Promise<string> => {
    try {
        // Validate the Base64 string and extract the format
        if (!/^data:image\/(png|jpeg|jpg);base64,/.test(base64String)) {
            throw new Error('Invalid Base64 image string. Must include a valid data URI prefix.');
        }

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(base64String, {
            folder: folder,
            resource_type: 'image',
        });

        // Retrieve and return the URL
        return response.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};