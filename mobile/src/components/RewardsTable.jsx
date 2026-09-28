import React from "react";
import { View, Text } from "react-native";

const TEAL = "#1a9e8f";

// Trophy / medal icons by position
const POSITION_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function RewardsTable({ rewards, disclaimers }) {
  return (
    <View style={{ backgroundColor: "#fff", marginTop: 10, padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>Rewards</Text>
        <Text style={{ fontSize: 12, color: "#888" }}>(All Positions)</Text>
      </View>

      {rewards.map((reward) => (
        <View
          key={reward.position}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: "#f0f0f0",
          }}
        >
          <Text style={{ fontSize: 20, width: 32 }}>
            {POSITION_ICONS[reward.position] || "⭐"}
          </Text>
          <Text style={{ flex: 1, fontSize: 14, color: "#222", marginLeft: 8 }}>
            {reward.label}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: TEAL }}>
            ₹ {reward.amount.toLocaleString("en-IN")}
          </Text>
        </View>
      ))}

      {/* Disclaimer */}
      {disclaimers && disclaimers.length > 0 && (
        <View
          style={{
            marginTop: 14,
            backgroundColor: "#fff8e1",
            borderRadius: 8,
            padding: 10,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 14, marginTop: 1 }}>ℹ️</Text>
          <Text style={{ fontSize: 12, color: "#555", flex: 1, lineHeight: 18 }}>
            <Text style={{ fontWeight: "700", color: "#e65100" }}>Disclaimer: </Text>
            {disclaimers.join(" ")}
          </Text>
        </View>
      )}
    </View>
  );
}
