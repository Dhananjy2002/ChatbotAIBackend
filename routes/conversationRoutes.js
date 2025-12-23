import express from "express";

import {
  getConversations,
  getConversation,
  getMessages,
  createConversation,
  updateConversation,
  deleteConversation,
  clearConversation,
} from "../controllers/conversationController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  conversationIdValidator,
  paginationValidator,
} from "../validators/chatValidator.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversation routes
router
  .route("/")
  .get(paginationValidator, validateRequest, getConversations)
  .post(createConversation);

router
  .route("/:conversationId")
  .get(conversationIdValidator, validateRequest, getConversation)
  .put(conversationIdValidator, validateRequest, updateConversation)
  .delete(conversationIdValidator, validateRequest, deleteConversation);

// Message routes
router
  .route("/:conversationId/messages")
  .get(
    conversationIdValidator,
    paginationValidator,
    validateRequest,
    getMessages
  )
  .delete(conversationIdValidator, validateRequest, clearConversation);

export default router;
