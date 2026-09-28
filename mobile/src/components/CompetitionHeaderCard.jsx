import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

/**
 * CompetitionHeaderCard
 * Shows: title, category tags, type badge, certificate badge,
 * prize pool, entry fee, spots progress bar, registered badge.
 */
export default function CompetitionHeaderCard({ competition, isRegistered }) {
  const spotsLeft = competition.totalSpots - competition.spotsBooked;
  const progressPct = Math.min(
    (competition.spotsBooked / competition.totalSpots) * 100,
    100
  );

  return (
    <View style={{ backgroundColor: "#fff", padding: 16, paddingBottom: 14 }}>
      {/* Title + Registered badge row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#111", flex: 1, marginRight: 8 }}>
          {competition.title}
        </Text>
        {isRegistered && (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#e6f7f5", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Ionicons name="checkmark-circle" size={14} color={TEAL} />
            <Text style={{ color: TEAL, fontSize: 12, fontWeight: "600", marginLeft: 4 }}>Registered</Text>
          </View>
        )}
      </View>

      {/* Tags row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
        {competition.category.map((cat) => (
          <View key={cat} style={{ backgroundColor: "#e8f4fd", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, color: "#1a73e8", fontWeight: "600" }}>{cat}</Text>
          </View>
        ))}
        {competition.type === "multi-win" && (
          <View style={{ backgroundColor: "#fff3e0", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, color: "#e65100", fontWeight: "600" }}>Multi-Win</Text>
          </View>
        )}
        {competition.certificateForWinners && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="ribbon-outline" size={14} color={TEAL} />
            <Text style={{ fontSize: 12, color: TEAL, fontWeight: "500" }}>Winners get certificate</Text>
          </View>
        )}
      </View>

      {/* Prize + Entry + Spots row */}
      <View style={{ flexDirection: "row", marginTop: 14, alignItems: "flex-start" }}>
        {/* Prize pool */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#888" }}>Prize Pool</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111" }}>
            ₹ {competition.prizePool.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Entry fee */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#888" }}>Entry Fee</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111" }}>
            ₹ {competition.entryFee}
          </Text>
        </View>

        {/* Spots */}
        <View style={{ flex: 1.5, alignItems: "flex-end" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <Ionicons name="people-outline" size={14} color={TEAL} />
            <Text style={{ fontSize: 12, color: TEAL, fontWeight: "600" }}>
              Only {spotsLeft} spots left
            </Text>
          </View>
          {/* Progress bar */}
          <View style={{ width: "100%", height: 6, backgroundColor: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ width: `${progressPct}%`, height: "100%", backgroundColor: TEAL, borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
            {competition.spotsBooked} / {competition.totalSpots} Booked
          </Text>
        </View>
      </View>
    </View>
  );
}
