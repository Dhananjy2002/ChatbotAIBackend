import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/apiError.js";
import { GeminiService } from "../services/geminiService.js";

const geminiService = new GeminiService();

export class ChatService {
  // Fixed: createConverstaion → createConversation
  async createConversation(userId, title = "New Conversation") {
    const conversation = await Conversation.create({
      user: userId,
      title,
    });
    return conversation;
  }

  // Fixed: getConverstions → getConversations
  async getConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      user: userId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Conversation.countDocuments({
      user: userId,
      isActive: true,
    });

    return {
      conversations, // Fixed: converstaions → conversations
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
      isActive: true,
    });

    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    // Get messages for this conversation
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    return {
      ...conversation.toObject(),
      messages,
    };
  }

  async getMessages(conversationId, userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit; // Added missing variable

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({
      conversation: conversationId,
    });

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(userId, message, conversationId = null) {
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        isActive: true,
      });

      if (!conversation) {
        throw ApiError.notFound("Conversation not found");
      }
    } else {
      // Create new conversation with first message as title
      const title =
        message.substring(0, 50) + (message.length > 50 ? "..." : "");
      conversation = await this.createConversation(userId, title); // Fixed typo
    }

    const userMessage = await Message.create({
      conversation: conversation._id,
      role: "user",
      content: message,
    });

    const history = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const aiResponse = await geminiService.generateResponse(formattedHistory, {
      systemPrompt:
        "You are a helpful, friendly AI assistant. Provide clear, accurate, and helpful responses. Be conversational but concise.",
    });

    const assistantMessage = await Message.create({
      conversation: conversation._id,
      role: "assistant",
      content: aiResponse.content,
      tokens: {
        prompt: aiResponse.usage?.prompt_tokens || 0,
        completion: aiResponse.usage?.completion_tokens || 0,
        total: aiResponse.usage?.total_tokens || 0,
      },
    });

    // Update conversation last message time
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      conversation: conversation._id,
      userMessage: {
        _id: userMessage._id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        _id: assistantMessage._id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    };
  }

  // Fixed: deleteConcersation → deleteConversation
  async deleteConversation(conversationId, userId) {
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        user: userId,
      },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    return conversation;
  }

  async updateConversationTitle(conversationId, userId, title) {
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        user: userId,
        isActive: true,
      },
      { title },
      { new: true }
    );

    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    return conversation;
  }

  async clearConversation(conversationId, userId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
      isActive: true,
    });

    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    await Message.deleteMany({ conversation: conversationId });
    return { message: "Conversation cleared successfully" };
  }
}
