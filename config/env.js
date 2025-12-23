import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Debug
console.log("🔍 Environment Variables Check:");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing"
);
console.log("PORT:", process.env.PORT);
