import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

export default function ErrorState({ message, onRetry }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Ionicons name="alert-circle-outline" size={56} color="#e57373" />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#222",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        {message || "Something went wrong"}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: 20,
            backgroundColor: TEAL,
            borderRadius: 10,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
