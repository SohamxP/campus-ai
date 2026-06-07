import dotenv from "dotenv";

dotenv.config();

export const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY?.trim() || "",
  model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
};