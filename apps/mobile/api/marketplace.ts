import { API } from "./client";

export type MarketplaceListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller_name: string | null;
  created_by: string | null;
  status: string;
  created_at: string;
};

export type CreateMarketplaceListingData = {
  title: string;
  description: string;
  price: number;
  category: string;
  seller_name?: string;
};

export async function fetchMarketplaceListings(): Promise<
  MarketplaceListing[]
> {
  const response = await API.get("/marketplace");
  return response.data.listings;
}

export async function fetchMarketplaceListingById(
  id: string
): Promise<MarketplaceListing> {
  const response = await API.get(`/marketplace/${id}`);
  return response.data.listing;
}

export async function createMarketplaceListing(
  data: CreateMarketplaceListingData
): Promise<MarketplaceListing> {
  const response = await API.post("/marketplace", data);
  return response.data.listing;
}