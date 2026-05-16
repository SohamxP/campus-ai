import express from "express";
import {
  createNewMarketplaceListing,
  getAllMarketplaceListings,
  getSingleMarketplaceListing,
} from "../controllers/marketController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllMarketplaceListings);
router.get("/:id", getSingleMarketplaceListing);
router.post("/", protect, createNewMarketplaceListing);

export default router;