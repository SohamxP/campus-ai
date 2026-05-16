import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type User = {
  id: string;
  email: string;
  full_name: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setAuth: (user: User, token: string) => Promise<void>;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = "campusai_token";
const USER_KEY = "campusai_user";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    set({
      user,
      token,
      isLoading: false,
    });
  },

  loadAuth: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userString = await SecureStore.getItemAsync(USER_KEY);

    if (token && userString) {
      set({
        token,
        user: JSON.parse(userString),
        isLoading: false,
      });
    } else {
      set({
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    set({
      user: null,
      token: null,
      isLoading: false,
    });
  },
}));