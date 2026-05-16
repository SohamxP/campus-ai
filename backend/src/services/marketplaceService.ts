import { supabase } from "../config/supabase";

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

export type CreateMarketplaceListingInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  seller_name?: string;
};

const LISTING_SELECT =
  "id,title,description,price,category,seller_name,created_by,status,created_at";

function normalizeListing(row: any): MarketplaceListing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    seller_name: row.seller_name,
    created_by: row.created_by,
    status: row.status,
    created_at: row.created_at,
  };
}

function throwSupabaseError(action: string, error: any): never {
  console.log(`Supabase ${action} error:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  });

  const message = error?.message || `Supabase failed during ${action}`;
  const code = error?.code ? ` Code: ${error.code}` : "";
  const details = error?.details ? ` Details: ${error.details}` : "";
  const hint = error?.hint ? ` Hint: ${error.hint}` : "";

  throw new Error(`${message}.${code}${details}${hint}`);
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throwSupabaseError("getMarketplaceListings", error);
  }

  return (data || []).map(normalizeListing);
}

export async function getMarketplaceListingById(
  id: string
): Promise<MarketplaceListing | null> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwSupabaseError("getMarketplaceListingById", error);
  }

  if (!data) {
    return null;
  }

  return normalizeListing(data);
}

export async function createMarketplaceListing(
  input: CreateMarketplaceListingInput,
  userId?: string
): Promise<MarketplaceListing> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert([
      {
        title: input.title,
        description: input.description,
        price: input.price,
        category: input.category,
        seller_name: input.seller_name || "CampusAI Student",
        created_by: userId || null,
        status: "available",
      },
    ])
    .select(LISTING_SELECT)
    .single();

  if (error) {
    throwSupabaseError("createMarketplaceListing", error);
  }

  return normalizeListing(data);
}