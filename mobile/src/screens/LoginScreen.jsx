import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../api/auth";

const TEAL = "#1a9e8f";

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(email.trim().toLowerCase());
      onLoginSuccess(user);
    } catch (err) {
      const msg = err?.response?.data?.error || "Login failed. Try user1@test.com";
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, padding: 28, justifyContent: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: TEAL, marginBottom: 8 }}>
            Feedants
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111", marginBottom: 4 }}>
            Sign in
          </Text>
          <Text style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
            Use a seeded email: user1@test.com – user20@test.com
          </Text>

          <Text style={{ fontSize: 13, color: "#555", marginBottom: 6, fontWeight: "600" }}>
            Email
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: "#111",
              marginBottom: 20,
            }}
            placeholder="user2@test.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: loading ? "#aaa" : TEAL,
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
