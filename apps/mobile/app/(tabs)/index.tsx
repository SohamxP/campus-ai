import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/store/authStore";

const quickActions = [
  {
    title: "Ask CampusAI",
    subtitle: "Plan assignments, summarize notes, or get campus help.",
    route: "/ai" as const,
  },
  {
    title: "Find Events",
    subtitle: "Discover workshops, club meetings, and campus activities.",
    route: "/events" as const,
  },
  {
    title: "Post a Ride",
    subtitle: "Coordinate campus rides with other students.",
    route: "/rides" as const,
  },
  {
    title: "Sell an Item",
    subtitle: "List textbooks, dorm items, electronics, and more.",
    route: "/marketplace" as const,
  },
];

const todayItems = [
  "Resume workshop at 3:00 PM",
  "AI study planner ready for your next exam",
  "2 new marketplace listings near campus",
];

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>CampusAI</Text>
        <Text style={styles.title}>Welcome back, {firstName}</Text>
        <Text style={styles.subtitle}>
          Your campus dashboard for study help, events, rides, marketplace, and
          student life.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
      </View>

      <View style={styles.grid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push(action.route)}
          >
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.managerCard}>
        <Text style={styles.cardLabel}>Today on campus</Text>

        {todayItems.map((item) => (
          <View key={item} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aiCard}>
        <Text style={styles.cardLabel}>AI suggestion</Text>
        <Text style={styles.aiText}>
          Ask CampusAI to turn your next exam, event, or project into a simple
          action plan.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/ai")}
        >
          <Text style={styles.primaryButtonText}>Open CampusAI</Text>
        </TouchableOpacity>
      </View>
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
  hero: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },
  kicker: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  grid: {
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 6,
  },
  managerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    marginBottom: 18,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 21,
  },
  aiCard: {
    backgroundColor: "#EAF2FF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  aiText: {
    fontSize: 15,
    color: "#1E3A8A",
    lineHeight: 22,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});