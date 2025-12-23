import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CloudinaryService = {
  uploadImage: async (filepath, options = {}) => {
    try {
      const defaultOptions = {
        folder: "avatars",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      };
      const uploadOptions = { ...defaultOptions, ...options };
      const result = await cloudinary.uploader.upload(filepath, uploadOptions);

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw ApiError.internal("Failed to upload image to cloud storage");
    }
  },

  uploadAvatar: async (filepath, userId = null) => {
    const options = {
      folder: "avatars",
      public_id: userId
        ? `avatar_${userId}_${Date.now()}`
        : `avatar_${Date.now()}`,
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    };

    return await CloudinaryService.uploadImage(filepath, options);
  },

  deleteImage: async (publicId) => {
    try {
      if (!publicId || publicId === "default-avatar") {
        return { result: "skipped" };
      }
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw ApiError.internal("Failed to delete image from cloud storage");
    }
  },

  deleteMultipleImages: async (publicIds) => {
    try {
      if (!publicIds || publicIds.length === 0) {
        return { result: "skipped" };
      }

      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error) {
      console.error("Cloudinary bulk delete error:", error);
      throw ApiError.internal("Failed to delete images from cloud storage");
    }
  },
};
