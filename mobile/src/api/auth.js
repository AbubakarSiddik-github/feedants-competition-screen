import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

export async function login(email) {
  const res = await client.post("/api/auth/login", { email });
  await AsyncStorage.setItem("token", res.data.token);
  await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
}

export async function logout() {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
