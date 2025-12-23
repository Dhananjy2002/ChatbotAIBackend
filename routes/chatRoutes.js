import express from "express";
import { sendMessageValidator } from "../validators/chatValidator.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { quickChat, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/send",
  protect,
  sendMessageValidator,
  // validateRequest,
  sendMessage
);
router.post(
  "/quick",
  protect,
  sendMessageValidator,
  validateRequest,
  quickChat
);

export default router;
