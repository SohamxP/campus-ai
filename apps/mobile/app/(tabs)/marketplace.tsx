import { router } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MarketplaceListing } from "@/api/marketplace";
import { useMarketplace } from "@/hooks/useMarketplace";

function formatPrice(price: number) {
  return `$${Number(price).toFixed(2)}`;
}

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/marketplace/[id]",
          params: { id: listing.id },
        })
      }
    >
      <View style={styles.topRow}>
        <Text style={styles.badge}>{listing.category}</Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
      </View>

      <Text style={styles.cardTitle}>{listing.title}</Text>
      <Text style={styles.description}>{listing.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Seller</Text>
        <Text style={styles.metaValue}>
          {listing.seller_name || "CampusAI Student"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketplaceScreen() {
  const { listings, isLoading, error, refetch } = useMarketplace();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Marketplace</Text>
        <Text style={styles.title}>Buy and sell with students on campus.</Text>
        <Text style={styles.subtitle}>
          List textbooks, dorm items, electronics, and other student essentials.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        activeOpacity={0.85}
        onPress={() => router.push("/marketplace/create")}
      >
        <Text style={styles.createButtonText}>Create Listing</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading listings...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Could not load listings</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isLoading && !error && listings.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>No listings yet</Text>
          <Text style={styles.errorText}>
            Create the first marketplace listing.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && listings.length > 0 ? (
        <View style={styles.list}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2563EB",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },
  createButton: {
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 18,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "900",
    color: "#16A34A",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 8,
  },
  metaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  metaValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 1,
    textAlign: "right",
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