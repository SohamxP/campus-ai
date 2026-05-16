import { API } from "./client";

export type SignupData = {
  full_name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export async function signup(data: SignupData) {
  const response = await API.post("/auth/signup", data);
  return response.data;
}

export async function login(data: LoginData) {
  const response = await API.post("/auth/login", data);
  return response.data;
}