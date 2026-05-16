import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  fetchMarketplaceListingById,
  MarketplaceListing,
} from "@/api/marketplace";

function getParamAsString(param: string | string[] | undefined) {
  if (!param) {
    return "";
  }

  if (Array.isArray(param)) {
    return param[0] || "";
  }

  return param;
}

function formatPrice(price: number) {
  return `$${Number(price).toFixed(2)}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MarketplaceDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const listingId = getParamAsString(params.id);

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadListing() {
    try {
      setIsLoading(true);
      setError("");

      if (!listingId) {
        setError("Missing listing id");
        return;
      }

      const data = await fetchMarketplaceListingById(listingId);
      setListing(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load listing";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadListing();
  }, [listingId]);

  function handleContactSeller() {
    Alert.alert(
      "Contact seller",
      "Chat is not connected yet. Later, this button will open a buyer-seller chat."
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: listing?.title || "Listing Details",
          headerBackTitle: "Marketplace",
        }}
      />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" />
            <Text style={styles.stateText}>Loading listing...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Could not load listing</Text>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadListing}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && !error && listing ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroTopRow}>
                <Text style={styles.badge}>{listing.category}</Text>
                <Text style={styles.price}>{formatPrice(listing.price)}</Text>
              </View>

              <Text style={styles.title}>{listing.title}</Text>
              <Text style={styles.status}>{listing.status}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Listing details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seller</Text>
                <Text style={styles.detailValue}>
                  {listing.seller_name || "CampusAI Student"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{listing.category}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {formatDate(listing.created_at)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleContactSeller}
            >
              <Text style={styles.primaryButtonText}>Contact Seller</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  badge: {
    overflow: "hidden",
    backgroundColor: "#EAF2FF",
    color: "#1D4ED8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
  },
  price: {
    color: "#86EFAC",
    fontSize: 22,
    fontWeight: "900",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
  },
  status: {
    color: "#D1D5DB",
    fontSize: 15,
    marginTop: 10,
    textTransform: "capitalize",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    marginBottom: 18,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
  description: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
  },
  detailRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    alignItems: "center",
  },
  stateText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
  },
  errorTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
  },
  errorText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});