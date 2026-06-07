import { API } from "./client";

export type CampusAIMode =
  | "assignment_planner"
  | "note_summarizer"
  | "resume_review"
  | "schedule_optimizer"
  | "general";

export type AskCampusAIData = {
  prompt: string;
  mode?: CampusAIMode;
};

export type AskCampusAIResponse = {
  success: boolean;
  answer: string;
  source: "openai" | "local";
};

export async function askCampusAI(
  data: AskCampusAIData
): Promise<AskCampusAIResponse> {
  const response = await API.post("/ai", data);
  return response.data;
}