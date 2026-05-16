import { useCallback, useEffect, useState } from "react";
import {
  fetchMarketplaceListings,
  MarketplaceListing,
} from "@/api/marketplace";

export function useMarketplace() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchMarketplaceListings();
      setListings(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load marketplace listings";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return {
    listings,
    isLoading,
    error,
    refetch: loadListings,
  };
}