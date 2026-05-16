import { Response } from "express";
import {
  createEvent,
  getEventById,
  getEvents,
} from "../services/eventService";
import { AuthRequest } from "../middleware/authMiddleware";

function getParamAsString(param: unknown): string {
  if (!param) {
    return "";
  }

  if (Array.isArray(param)) {
    return String(param[0] || "");
  }

  return String(param);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error";
}

export async function getAllEvents(req: AuthRequest, res: Response) {
  try {
    const events = await getEvents();

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Get events error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getSingleEvent(req: AuthRequest, res: Response) {
  try {
    const id = getParamAsString(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event id is required",
      });
    }

    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Get event error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function createNewEvent(req: AuthRequest, res: Response) {
  try {
    const { title, description, location, event_date, category, organizer } =
      req.body || {};

    if (!title || !description || !location || !event_date || !category) {
      return res.status(400).json({
        success: false,
        message:
          "title, description, location, event_date, and category are required",
      });
    }

    if (Number.isNaN(Date.parse(String(event_date)))) {
      return res.status(400).json({
        success: false,
        message: "event_date must be a valid date",
      });
    }

    const event = await createEvent(
      {
        title: String(title),
        description: String(description),
        location: String(location),
        event_date: String(event_date),
        category: String(category),
        organizer: organizer ? String(organizer) : undefined,
      },
      req.userId
    );

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Create event error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}