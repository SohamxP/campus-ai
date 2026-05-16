import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createMarketplaceListing,
  getMarketplaceListingById,
  getMarketplaceListings,
} from "../services/marketplaceService";

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

export async function getAllMarketplaceListings(
  req: AuthRequest,
  res: Response
) {
  try {
    const listings = await getMarketplaceListings();

    return res.json({
      success: true,
      listings,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Get marketplace listings error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getSingleMarketplaceListing(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getParamAsString(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Listing id is required",
      });
    }

    const listing = await getMarketplaceListingById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.json({
      success: true,
      listing,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Get marketplace listing error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function createNewMarketplaceListing(
  req: AuthRequest,
  res: Response
) {
  try {
    const { title, description, price, category, seller_name } = req.body || {};

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "title, description, price, and category are required",
      });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "price must be a valid number greater than 0",
      });
    }

    const listing = await createMarketplaceListing(
      {
        title: String(title),
        description: String(description),
        price: numericPrice,
        category: String(category),
        seller_name: seller_name ? String(seller_name) : undefined,
      },
      req.userId
    );

    return res.status(201).json({
      success: true,
      listing,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.log("Create marketplace listing error:", message);

    return res.status(500).json({
      success: false,
      message,
    });
  }
}