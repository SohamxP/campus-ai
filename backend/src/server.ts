import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import marketplaceRoutes from "./routes/marketplaceRoutes";

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

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CampusAI backend running on port ${PORT}`);
});