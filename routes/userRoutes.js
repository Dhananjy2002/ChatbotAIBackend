import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";
import {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Public routes
router.post(
  "/register",
  upload.single("avatar"),
  registerValidation,
  validateRequest,
  register
);
router.post("/login", loginValidation, validateRequest, login);

// Protected routes
router.get("/me", protect, getMe);
router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  updateProfile
);
router.put(
  "/password",
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

// Avatar routes
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.delete("/avatar", protect, deleteAvatar);

export default router;
