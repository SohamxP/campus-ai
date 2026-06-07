import axios from "axios";
import * as SecureStore from "expo-secure-store";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const API_BASE_URL =
  configuredBaseUrl && !configuredBaseUrl.includes("YOUR_MAC_IP")
    ? configuredBaseUrl
    : "http://localhost:5001/api";

if (__DEV__ && (!configuredBaseUrl || configuredBaseUrl.includes("YOUR_MAC_IP"))) {
  console.warn(
    "EXPO_PUBLIC_API_URL is missing or still uses YOUR_MAC_IP. Real phone needs your Mac IP address."
  );
}

export const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("campusai_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});