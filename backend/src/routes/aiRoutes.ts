import express from "express";
import { askCampusAI } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, askCampusAI);

export default router;