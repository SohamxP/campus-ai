import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { askCampusAI, CampusAIMode } from "@/api/ai";

const aiTools: Array<{
  title: string;
  description: string;
  mode: CampusAIMode;
}> = [
  {
    title: "Assignment Planner",
    description: "Break a project or homework into smaller steps with deadlines.",
    mode: "assignment_planner",
  },
  {
    title: "Note Summarizer",
    description: "Turn notes into key points, flashcards, and quiz questions.",
    mode: "note_summarizer",
  },
  {
    title: "Resume Review",
    description: "Improve project bullets and make your experience clearer.",
    mode: "resume_review",
  },
  {
    title: "Schedule Optimizer",
    description: "Plan study blocks around classes, events, and deadlines.",
    mode: "schedule_optimizer",
  },
];

export default function AIScreen() {
  const [prompt, setPrompt] = useState("");
  const [selectedMode, setSelectedMode] =
    useState<CampusAIMode>("assignment_planner");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState<"openai" | "local" | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    try {
      setError("");
      setAnswer("");
      setSource("");

      if (!prompt.trim()) {
        setError("Type a question first.");
        return;
      }

      setIsLoading(true);

      const data = await askCampusAI({
        prompt: prompt.trim(),
        mode: selectedMode,
      });

      setAnswer(data.answer);
      setSource(data.source);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate response";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTool =
    aiTools.find((tool) => tool.mode === selectedMode) || aiTools[0];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>CampusAI Assistant</Text>
          <Text style={styles.title}>Ask for help and get a usable plan.</Text>
          <Text style={styles.subtitle}>
            Choose the type of help you need, enter your prompt, and CampusAI
            will call your backend AI route.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose a tool</Text>

        <View style={styles.toolList}>
          {aiTools.map((tool) => {
            const selected = selectedMode === tool.mode;

            return (
              <TouchableOpacity
                key={tool.mode}
                style={[styles.toolCard, selected && styles.toolCardSelected]}
                activeOpacity={0.85}
                onPress={() => setSelectedMode(tool.mode)}
              >
                <Text
                  style={[
                    styles.toolTitle,
                    selected && styles.toolTitleSelected,
                  ]}
                >
                  {tool.title}
                </Text>
                <Text
                  style={[
                    styles.toolDescription,
                    selected && styles.toolDescriptionSelected,
                  ]}
                >
                  {tool.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.askCard}>
          <Text style={styles.cardTitle}>{selectedTool.title}</Text>

          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Example: Help me plan my database project this week"
            multiline
            style={styles.input}
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Generate Response</Text>
            )}
          </TouchableOpacity>

          {source ? (
            <Text style={styles.sourceText}>
              Source: {source === "openai" ? "OpenAI API" : "Local fallback"}
            </Text>
          ) : null}
        </View>

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.answerTitle}>CampusAI Response</Text>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  toolList: {
    gap: 12,
    marginBottom: 20,
  },
  toolCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  toolCardSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  toolTitleSelected: {
    color: "#FFFFFF",
  },
  toolDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 6,
  },
  toolDescriptionSelected: {
    color: "#D1D5DB",
  },
  askCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  input: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  sourceText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "700",
  },
  answerCard: {
    backgroundColor: "#EAF2FF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  answerTitle: {
    color: "#1E3A8A",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
  answerText: {
    color: "#1E3A8A",
    fontSize: 15,
    lineHeight: 23,
  },
});