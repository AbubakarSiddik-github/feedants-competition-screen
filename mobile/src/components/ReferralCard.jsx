import React from "react";
import { View, Text, TouchableOpacity, Clipboard, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

export default function ReferralCard({ user }) {
  if (!user) return null;

  const referralLink = `https://feedants.com/r/${user.referralCode}`;

  function copyLink() {
    Clipboard.setString(referralLink);
    Alert.alert("Copied!", "Referral link copied to clipboard.");
  }

  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginTop: 10,
        padding: 16,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#f0faf9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="megaphone-outline" size={18} color={TEAL} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
            Refer & Earn more discount
          </Text>
        </View>
        <TouchableOpacity
          onPress={copyLink}
          style={{
            backgroundColor: TEAL,
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Refer Now</Text>
        </TouchableOpacity>
      </View>

      {/* Link + Copy row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "#555" }} numberOfLines={1}>
            {referralLink}
          </Text>
        </View>
        <TouchableOpacity
          onPress={copyLink}
          style={{
            borderWidth: 1,
            borderColor: TEAL,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: TEAL, fontWeight: "600" }}>Copy Link</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
        You earn ₹10 for every signup
      </Text>
    </View>
  );
}
