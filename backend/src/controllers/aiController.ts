import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateCampusAIResponse } from "../services/aiService";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error";
}

export async function askCampusAI(req: AuthRequest, res: Response) {
  try {
    const { prompt, mode } = req.body || {};

    const result = await generateCampusAIResponse({
      prompt,
      mode,
    });

    return res.json({
      success: true,
      answer: result.answer,
      source: result.source,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("CampusAI error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}