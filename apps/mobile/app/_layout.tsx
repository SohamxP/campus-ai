import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loadAuth = useAuthStore((state) => state.loadAuth);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="events/[id]"
          options={{
            headerShown: true,
            title: "Event Details",
          }}
        />

        <Stack.Screen
          name="marketplace/[id]"
          options={{
            headerShown: true,
            title: "Listing Details",
          }}
        />

        <Stack.Screen
          name="marketplace/create"
          options={{
            headerShown: true,
            title: "Create Listing",
          }}
        />

        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: true,
            title: "Chat",
          }}
        />

        <Stack.Screen
          name="settings/index"
          options={{
            headerShown: true,
            title: "Settings",
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}