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

import { CampusEvent } from "@/api/events";
import { useEvents } from "@/hooks/useEvents";

function formatEventDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EventCard({ event }: { event: CampusEvent }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/events/[id]",
          params: { id: event.id },
        })
      }
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.badge}>{event.category}</Text>
        <Text style={styles.time}>{formatEventDate(event.event_date)}</Text>
      </View>

      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.organizerRow}>
        <Text style={styles.organizerLabel}>Organizer</Text>
        <Text style={styles.organizerValue}>
          {event.organizer || "CampusAI"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const { events, isLoading, error, refetch } = useEvents();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Events</Text>
        <Text style={styles.title}>Find what is happening on campus.</Text>
        <Text style={styles.subtitle}>
          Discover workshops, study sessions, club meetings, and student events.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading events...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>Could not load events</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isLoading && !error && events.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorTitle}>No events yet</Text>
          <Text style={styles.errorText}>
            Once events are added in Supabase, they will show up here.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && events.length > 0 ? (
        <View style={styles.list}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
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
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
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
  time: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
  },
  location: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  description: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  organizerRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  organizerLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  organizerValue: {
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