import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

const TEAL = "#1a9e8f";
const DARK_TEAL = "#147a6e";

/**
 * StickyCTABar
 *
 * Props:
 *   cta       — { label, enabled, action } from getCtaState()
 *   onPress   — called only when enabled
 *   loading   — show spinner while request is in-flight
 *   subLabel  — secondary text below button (e.g. "Registered")
 */
export default function StickyCTABar({ cta, onPress, loading, subLabel }) {
  const isEnabled = cta.enabled && !loading;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24, // safe area bottom
        borderTopWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 8,
      }}
    >
      <TouchableOpacity
        onPress={isEnabled ? onPress : undefined}
        activeOpacity={isEnabled ? 0.8 : 1}
        style={{
          backgroundColor: isEnabled ? TEAL : "#b0b0b0",
          borderRadius: 12,
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {cta.label}
          </Text>
        )}
      </TouchableOpacity>

      {subLabel ? (
        <Text
          style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 6 }}
        >
          {subLabel}
        </Text>
      ) : null}
    </View>
  );
}
