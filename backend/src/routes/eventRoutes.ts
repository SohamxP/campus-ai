import express from "express";
import {
  createNewEvent,
  getAllEvents,
  getSingleEvent,
} from "../controllers/eventController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getSingleEvent);
router.post("/", protect, createNewEvent);

export default router;