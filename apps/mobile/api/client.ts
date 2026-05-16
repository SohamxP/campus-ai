import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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