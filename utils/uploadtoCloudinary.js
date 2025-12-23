import fs from "fs";
import { CloudinaryService } from "../services/cloudinaryService.js";

export const uploadToCloudinary = async (localFilePath, userId = null) => {
  try {
    if (!localFilePath) return null;

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadAvatar(localFilePath, userId);

    // Delete temp file after upload
    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    // Delete temp file if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

export const uploadBufferToCloudinary = async (buffer, userId = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: userId
          ? `avatar_${userId}_${Date.now()}`
          : `avatar_${Date.now()}`,
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};
