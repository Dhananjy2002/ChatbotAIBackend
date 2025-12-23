import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
