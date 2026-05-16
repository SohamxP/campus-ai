import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const aiTools = [
  {
    title: "Assignment Planner",
    description: "Break a project or homework into smaller steps with deadlines.",
  },
  {
    title: "Note Summarizer",
    description: "Turn long notes into key points, flashcards, and quiz questions.",
  },
  {
    title: "Resume Review",
    description: "Improve project bullets and make your experience easier to explain.",
  },
  {
    title: "Schedule Optimizer",
    description: "Plan study blocks around classes, events, and campus commitments.",
  },
];

export default function AIScreen() {
  const [prompt, setPrompt] = useState("");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>CampusAI Assistant</Text>
        <Text style={styles.title}>
          Ask for help, then connect it to campus life.
        </Text>
        <Text style={styles.subtitle}>
          This screen is the future AI layer. Next, we will connect it to your
          backend and OpenAI API.
        </Text>
      </View>

      <View style={styles.askCard}>
        <Text style={styles.cardTitle}>Ask CampusAI</Text>

        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Example: Help me plan my database project this week"
          multiline
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Generate Plan</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          For now this is UI only. In the next phase, this button will call
          /api/ai.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>AI tools</Text>

      <View style={styles.toolList}>
        {aiTools.map((tool) => (
          <View key={tool.title} style={styles.toolCard}>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
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
  askCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  toolList: {
    gap: 12,
  },
  toolCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  toolDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 6,
  },
});