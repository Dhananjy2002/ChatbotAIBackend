// src/controllers/userController.js
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { CloudinaryService } from "../services/cloudinaryService.js";

// Helper function to format user response
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Helper to clean up temp file
const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    cleanupTempFile(req.file?.path);
    throw ApiError.badRequest("User already exists with this email");
  }

  // Prepare user data
  const userData = { name, email, password };

  // Handle avatar upload if file provided
  if (req.file) {
    try {
      const uploadResult = await CloudinaryService.uploadAvatar(req.file.path);
      userData.avatar = {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      };
      cleanupTempFile(req.file.path);
    } catch (error) {
      cleanupTempFile(req.file.path);
      console.error("Avatar upload error:", error);
      // Continue without avatar if upload fails
    }
  }

  // Create user
  const user = await User.create(userData);
  const token = user.generateAuthToken();

  ApiResponse.created(
    res,
    {
      user: formatUserResponse(user),
      token,
    },
    "User registered successfully"
  );
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.unauthorized("Your account has been deactivated");
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const token = user.generateAuthToken();

  ApiResponse.success(
    res,
    {
      user: formatUserResponse(user),
      token,
    },
    "Login successful"
  );
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  ApiResponse.success(res, {
    user: formatUserResponse(user),
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updateData = {};

  if (name) updateData.name = name;

  if (email) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (existingUser) {
      throw ApiError.badRequest("Email is already taken");
    }
    updateData.email = email;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  ApiResponse.success(
    res,
    {
      user: formatUserResponse(user),
    },
    "Profile updated successfully"
  );
});

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("Please upload an image");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    cleanupTempFile(req.file.path);
    throw ApiError.notFound("User not found");
  }

  try {
    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.public_id) {
      await CloudinaryService.deleteImage(user.avatar.public_id);
    }

    // Upload new avatar
    const uploadResult = await CloudinaryService.uploadAvatar(
      req.file.path,
      user._id.toString()
    );

    // Update user avatar
    user.avatar = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };
    await user.save({ validateBeforeSave: false });

    // Delete temp file
    cleanupTempFile(req.file.path);

    ApiResponse.success(
      res,
      {
        user: formatUserResponse(user),
      },
      "Avatar updated successfully"
    );
  } catch (error) {
    cleanupTempFile(req.file.path);
    throw ApiError.internal("Failed to upload avatar");
  }
});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Delete from Cloudinary if exists
  if (user.avatar?.public_id) {
    await CloudinaryService.deleteImage(user.avatar.public_id);
  }

  // Reset to default avatar
  user.avatar = {
    url: "default-avatar.png",
    public_id: null,
  };
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(
    res,
    {
      user: formatUserResponse(user),
    },
    "Avatar deleted successfully"
  );
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, "Password changed successfully");
});
