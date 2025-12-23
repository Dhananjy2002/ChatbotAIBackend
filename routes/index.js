import express from "express";
import userRoutes from "../routes/userRoutes.js";
import chatRoutes from "../routes/chatRoutes.js";
import conversationRoutes from "../routes/conversationRoutes.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/chat", chatRoutes);
router.use("/conversations", conversationRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chatbot API with Google Gemini",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      chat: "/api/v1/chat",
      conversations: "/api/v1/conversations",
    },
  });
});

export default router;
