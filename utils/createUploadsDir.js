// src/utils/createUploadsDir.js
import fs from "fs";
import path from "path";

export const createUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), "uploads", "temp");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Uploads directory created");
  }
};
