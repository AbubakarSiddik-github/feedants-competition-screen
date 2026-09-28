import React from "react";
import { View, ScrollView, Animated } from "react-native";

/**
 * Shimmer skeleton loader — shown while the API request is in-flight.
 * Matches the rough layout of CompetitionDetailsScreen.
 */
function SkeletonBox({ width, height, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: "#e0e0e0",
          borderRadius: 8,
          width: width || "100%",
          height: height || 16,
        },
        style,
      ]}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header card */}
      <View style={{ backgroundColor: "#fff", padding: 16, gap: 10 }}>
        <SkeletonBox height={22} width="70%" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SkeletonBox height={20} width={60} />
          <SkeletonBox height={20} width={70} />
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <SkeletonBox height={32} width="40%" />
          <SkeletonBox height={32} width="40%" />
        </View>
        <SkeletonBox height={8} />
      </View>

      {/* Judge card */}
      <View style={{ backgroundColor: "#fff", marginTop: 10, padding: 16, flexDirection: "row", gap: 12 }}>
        <SkeletonBox width={60} height={60} style={{ borderRadius: 30 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox height={14} width="50%" />
          <SkeletonBox height={12} width="70%" />
          <SkeletonBox height={12} width="60%" />
        </View>
      </View>

      {/* Countdown */}
      <View style={{ backgroundColor: "#f0faf9", marginTop: 10, padding: 16 }}>
        <SkeletonBox height={18} width="80%" />
      </View>

      {/* Dates */}
      <View style={{ backgroundColor: "#fff", marginTop: 10, padding: 16, gap: 12 }}>
        <SkeletonBox height={14} width="40%" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBox key={i} height={48} width="45%" />
          ))}
        </View>
      </View>

      {/* Rewards */}
      <View style={{ backgroundColor: "#fff", marginTop: 10, padding: 16, gap: 10 }}>
        <SkeletonBox height={14} width="30%" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox key={i} height={36} />
        ))}
      </View>
    </ScrollView>
  );
}
