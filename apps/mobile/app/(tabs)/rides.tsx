import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const rides = [
  {
    id: "1",
    from: "Centennial Court",
    to: "UTA Library",
    time: "Today, 9:30 AM",
    seats: 2,
    price: "$3",
  },
  {
    id: "2",
    from: "Engineering Hall",
    to: "Walmart Supercenter",
    time: "Today, 6:00 PM",
    seats: 3,
    price: "$5",
  },
  {
    id: "3",
    from: "Campus Edge",
    to: "DFW Airport",
    time: "Saturday, 8:00 AM",
    seats: 1,
    price: "$18",
  },
];

export default function RidesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Rides</Text>
        <Text style={styles.title}>Coordinate rides with students nearby.</Text>
        <Text style={styles.subtitle}>
          This is the ride-sharing part of CampusAI. Next, we will store ride
          posts in Supabase.
        </Text>
      </View>

      <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
        <Text style={styles.createButtonText}>Create Ride Post</Text>
      </TouchableOpacity>

      <View style={styles.list}>
        {rides.map((ride) => (
          <View key={ride.id} style={styles.card}>
            <View style={styles.routeRow}>
              <Text style={styles.routeText}>{ride.from}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.routeText}>{ride.to}</Text>
            </View>

            <Text style={styles.time}>{ride.time}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaPill}>{ride.seats} seats</Text>
              <Text style={styles.metaPill}>{ride.price}</Text>
            </View>
          </View>
        ))}
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
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  routeText: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "900",
  },
  arrow: {
    fontSize: 18,
    color: "#2563EB",
    fontWeight: "900",
  },
  time: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    overflow: "hidden",
    backgroundColor: "#EAF2FF",
    color: "#1D4ED8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "900",
  },
});