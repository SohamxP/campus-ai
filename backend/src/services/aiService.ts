import { openAIConfig } from "../config/openai";

export type CampusAIMode =
  | "assignment_planner"
  | "note_summarizer"
  | "resume_review"
  | "schedule_optimizer"
  | "general";

export type CampusAIRequest = {
  prompt: string;
  mode?: CampusAIMode;
};

export type CampusAIResult = {
  answer: string;
  source: "openai" | "local";
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const modeInstructions: Record<CampusAIMode, string> = {
  assignment_planner:
    "Turn the student's task into a practical assignment plan with steps, priorities, and deadlines.",
  note_summarizer:
    "Summarize the student's notes into key points, exam-focused takeaways, and possible quiz questions.",
  resume_review:
    "Improve the student's resume/project explanation with stronger, honest, internship-focused wording.",
  schedule_optimizer:
    "Create a realistic study or productivity schedule around the student's constraints.",
  general:
    "Help the student clearly and practically with campus, study, project, or career questions.",
};

function cleanPrompt(prompt: unknown): string {
  if (typeof prompt !== "string") {
    return "";
  }

  return prompt.trim();
}

function normalizeMode(mode: unknown): CampusAIMode {
  const validModes: CampusAIMode[] = [
    "assignment_planner",
    "note_summarizer",
    "resume_review",
    "schedule_optimizer",
    "general",
  ];

  if (typeof mode === "string" && validModes.includes(mode as CampusAIMode)) {
    return mode as CampusAIMode;
  }

  return "general";
}

function buildLocalFallback(prompt: string, mode: CampusAIMode): string {
  const intro =
    mode === "assignment_planner"
      ? "Here is a simple assignment plan:"
      : mode === "note_summarizer"
      ? "Here is a clean summary structure:"
      : mode === "resume_review"
      ? "Here is a stronger way to improve this:"
      : mode === "schedule_optimizer"
      ? "Here is a realistic schedule plan:"
      : "Here is a practical answer:";

  return `${intro}

1. Main goal:
${prompt}

2. First step:
Break the request into the smallest clear action you can do today.

3. Next steps:
- Identify what information is missing.
- Complete the easiest high-impact part first.
- Save anything confusing for a focused follow-up.
- Review the result once before submitting or sharing it.

4. CampusAI note:
The backend is working, but OPENAI_API_KEY is not set yet. Add it to backend/.env to get a real AI-generated response.`;
}

export async function generateCampusAIResponse(
  input: CampusAIRequest
): Promise<CampusAIResult> {
  const prompt = cleanPrompt(input.prompt);
  const mode = normalizeMode(input.mode);

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (!openAIConfig.apiKey) {
    return {
      answer: buildLocalFallback(prompt, mode),
      source: "local",
    };
  }

  const response = await fetch(openAIConfig.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAIConfig.model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are CampusAI, a practical student assistant. Be direct, useful, and honest. ${modeInstructions[mode]}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const json = (await response.json()) as OpenAIChatResponse;

  if (!response.ok) {
    throw new Error(
      json.error?.message || `OpenAI request failed with ${response.status}`
    );
  }

  const answer = json.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("OpenAI returned an empty response");
  }

  return {
    answer,
    source: "openai",
  };
}