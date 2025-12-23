// services/geminiService.js (keeping same filename to avoid import changes)

import axios from "axios";
import { ApiError } from "../utils/apiError.js";

export class GeminiService {
  constructor() {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = "https://api.perplexity.ai";

    this.model = "sonar";

    this.defaultConfig = {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1024,
    };
  }

  formatMessagesForPerplexity(messages, systemPrompt) {
    const formattedMessages = [];

    // Add system message first
    formattedMessages.push({
      role: "system",
      content: systemPrompt,
    });

    // Add conversation messages
    messages.forEach((msg) => {
      formattedMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    });

    return formattedMessages;
  }

  async generateResponse(messages, options = {}) {
    try {
      const systemPrompt =
        options.systemPrompt ||
        "You are a helpful, friendly AI assistant. Provide clear and concise responses.";

      const formattedMessages = this.formatMessagesForPerplexity(
        messages,
        systemPrompt
      );

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: formattedMessages,
          temperature: options.temperature || this.defaultConfig.temperature,
          top_p: options.top_p || this.defaultConfig.top_p,
          max_tokens: options.maxTokens || this.defaultConfig.max_tokens,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      const content = result.choices[0]?.message?.content || "";
      const usage = result.usage || {};

      return {
        content: content,
        usage: {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error(
        "❌ Perplexity API Error:",
        error.response?.data || error.message
      );

      // Handle specific Perplexity errors
      if (error.response?.status === 401) {
        throw ApiError.internal("Invalid Perplexity API key");
      }

      if (error.response?.status === 429) {
        throw ApiError.badRequest(
          "API rate limit exceeded. Please try again later."
        );
      }

      if (error.response?.status === 400) {
        throw ApiError.badRequest(
          error.response?.data?.error?.message || "Bad request to AI service"
        );
      }

      throw ApiError.internal(
        "Failed to generate AI response: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  }

  async generateSimpleResponse(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. Be concise and accurate.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: options.temperature || this.defaultConfig.temperature,
          top_p: options.top_p || this.defaultConfig.top_p,
          max_tokens: options.maxTokens || this.defaultConfig.max_tokens,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      return result.choices[0]?.message?.content || "";
    } catch (error) {
      console.error(
        "❌ Perplexity Simple Response Error:",
        error.response?.data || error.message
      );
      throw ApiError.internal("Failed to generate response");
    }
  }
}
