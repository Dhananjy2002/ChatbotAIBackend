import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ChatService } from "../services/chatService.js";
import { GeminiService } from "../services/geminiService.js";

const chatService = new ChatService();
const geminiService = new GeminiService();

const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user.id;

  const result = await chatService.sendMessage(userId, message, conversationId);

  ApiResponse.success(res, result, "Message sent successfully");
});

const quickChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const response = await geminiService.generateSimpleResponse(message);

  ApiResponse.success(res, { response }, "Response generated");
});

export { sendMessage, quickChat };
