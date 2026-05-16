import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createMarketplaceListing } from "@/api/marketplace";
import { useAuthStore } from "@/store/authStore";

export default function CreateMarketplaceListingScreen() {
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateListing() {
    try {
      setError("");

      if (!title.trim() || !description.trim() || !price.trim() || !category) {
        setError("Please fill out all fields.");
        return;
      }

      const numericPrice = Number(price);

      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        setError("Price must be a valid number greater than 0.");
        return;
      }

      setIsSubmitting(true);

      await createMarketplaceListing({
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        category,
        seller_name: user?.full_name || "CampusAI Student",
      });

      Alert.alert("Listing created", "Your item is now listed.", [
        {
          text: "OK",
          onPress: () => router.replace("/marketplace"),
        },
      ]);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create listing";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Listing",
          headerBackTitle: "Marketplace",
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Marketplace</Text>
            <Text style={styles.title}>Create a listing</Text>
            <Text style={styles.subtitle}>
              Add an item that other students can discover in the campus
              marketplace.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Example: Database Systems Textbook"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe condition, pickup details, or anything important."
              placeholderTextColor="#9CA3AF"
              multiline
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Price</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Example: 35"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {["Books", "Dorm", "Electronics", "Clothing", "Other"].map(
                (item) => {
                  const selected = category === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.categoryButton,
                        selected && styles.categoryButtonSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setCategory(item)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selected && styles.categoryButtonTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleCreateListing}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Creating..." : "Create Listing"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    padding: 20,
    paddingTop: 24,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  label: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 120,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  categoryButtonSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});