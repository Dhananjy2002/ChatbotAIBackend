import { asyncHandler } from "../utils/asyncHandler.js";
import { ChatService } from "../services/chatService.js";
import { ApiResponse } from "../utils/apiResponse.js"; // Missing import!

const chatService = new ChatService();

// @route   GET /api/v1/conversations
export const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  const result = await chatService.getConversations(
    userId,
    parseInt(page),
    parseInt(limit)
  );

  ApiResponse.success(res, result);
});

// @desc    Get single conversation with messages
// @route   GET /api/v1/conversations/:conversationId
export const getConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  const conversation = await chatService.getConversationById(
    conversationId,
    userId
  );

  ApiResponse.success(res, { conversation });
});

// @desc    Get messages of a conversation
// @route   GET /api/v1/conversations/:conversationId/messages
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  const result = await chatService.getMessages(
    conversationId,
    userId,
    parseInt(page),
    parseInt(limit)
  );

  ApiResponse.success(res, result);
});

// @desc    Create new conversation
// @route   POST /api/v1/conversations
export const createConversation = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user.id;

  const conversation = await chatService.createConversation(userId, title);

  ApiResponse.created(
    res,
    { conversation },
    "Conversation created successfully"
  );
});

// @desc    Update conversation title
// @route   PUT /api/v1/conversations/:conversationId
export const updateConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { title } = req.body;
  const userId = req.user.id;

  const conversation = await chatService.updateConversationTitle(
    conversationId,
    userId,
    title
  );

  ApiResponse.success(
    res,
    { conversation },
    "Conversation updated successfully"
  );
});

// @desc    Delete conversation
// @route   DELETE /api/v1/conversations/:conversationId
export const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  await chatService.deleteConversation(conversationId, userId);

  ApiResponse.success(res, null, "Conversation deleted successfully");
});

// @desc    Clear conversation messages
// @route   DELETE /api/v1/conversations/:conversationId/messages
export const clearConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  await chatService.clearConversation(conversationId, userId);

  ApiResponse.success(res, null, "Conversation cleared successfully");
});
