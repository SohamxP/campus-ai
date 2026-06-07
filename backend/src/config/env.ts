import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5001,
  jwtSecret: process.env.JWT_SECRET?.trim() || "",
  supabaseUrl: process.env.SUPABASE_URL?.trim() || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
  openAIApiKey: process.env.OPENAI_API_KEY?.trim() || "",
  openAIModel: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
};

export function getEnvStatus() {
  return {
    jwtSecret: Boolean(env.jwtSecret),
    supabaseUrl: Boolean(env.supabaseUrl),
    supabaseServiceRoleKey: Boolean(env.supabaseServiceRoleKey),
    openAI: Boolean(env.openAIApiKey),
  };
}