import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CampusEvent, fetchEventById } from "@/api/events";

function formatEventDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getParamAsString(param: string | string[] | undefined) {
  if (!param) {
    return "";
  }

  if (Array.isArray(param)) {
    return param[0] || "";
  }

  return param;
}

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();

  const eventId = getParamAsString(params.id);

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvent() {
    try {
      setIsLoading(true);
      setError("");

      if (!eventId) {
        setError("Missing event id");
        return;
      }

      const data = await fetchEventById(eventId);
      setEvent(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load event";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: event?.title || "Event Details",
          headerBackTitle: "Events",
        }}
      />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" />
            <Text style={styles.stateText}>Loading event...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Could not load event</Text>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadEvent}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && !error && event ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.badge}>{event.category}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.date}>
                {formatEventDate(event.event_date)}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Organizer</Text>
                <Text style={styles.detailValue}>
                  {event.organizer || "CampusAI"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{event.category}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Save Event</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Save Event is UI only for now. Later, it will save this event to
              the logged-in user's profile.
            </Text>
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
  badge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    backgroundColor: "#EAF2FF",
    color: "#1D4ED8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 14,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
  },
  date: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
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
  helperText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: "center",
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