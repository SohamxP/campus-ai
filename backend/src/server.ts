import express, { Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import marketplaceRoutes from "./routes/marketplaceRoutes";
import aiRoutes from "./routes/aiRoutes";
import { env, getEnvStatus } from "./config/env";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CampusAI backend is running",
    docs: "/api/health",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    env: getEnvStatus(),
    timestamp: new Date().toISOString(),
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

app.listen(env.port, "0.0.0.0", () => {
  console.log(`CampusAI backend running on http://0.0.0.0:${env.port}`);
});