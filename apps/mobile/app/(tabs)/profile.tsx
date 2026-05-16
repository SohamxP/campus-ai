import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/store/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0).toUpperCase() || "S"}
          </Text>
        </View>

        <Text style={styles.name}>{user?.full_name || "Student"}</Text>
        <Text style={styles.email}>{user?.email || "student@campus.edu"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CampusAI account</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Role</Text>
          <Text style={styles.rowValue}>Student</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Campus</Text>
          <Text style={styles.rowValue}>UTA Demo</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={styles.rowValue}>Logged in</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What this profile will do later</Text>
        <Text style={styles.description}>
          Profile will hold saved events, your marketplace posts, ride history,
          AI history, and account settings.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.85}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  email: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
  },
  rowValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },
  description: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});