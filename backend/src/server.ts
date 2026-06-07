import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import marketplaceRoutes from "./routes/marketplaceRoutes";
import aiRoutes from "./routes/aiRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CampusAI backend is running",
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/ai", aiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CampusAI backend running on http://0.0.0.0:${PORT}`);
});