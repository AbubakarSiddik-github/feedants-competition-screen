import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

const POSITION_LABELS = {
  1: "1st Winner",
  2: "2nd Winner",
  3: "3rd Winner",
};

function WinnerItem({ item }) {
  return (
    <TouchableOpacity
      onPress={() => item.videoUrl && Linking.openURL(item.videoUrl)}
      style={{ marginRight: 12, alignItems: "center", width: 90 }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={item.photoUrl ? { uri: item.photoUrl } : require("../../assets/icon.png")}
          style={{
            width: 80,
            height: 80,
            borderRadius: 10,
            backgroundColor: "#ccc",
          }}
        />
        {/* Play overlay */}
        <View
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: TEAL,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="play" size={12} color="#fff" />
        </View>
      </View>
      <Text
        style={{ fontSize: 12, fontWeight: "600", color: "#111", marginTop: 5, textAlign: "center" }}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text style={{ fontSize: 11, color: TEAL }}>
        {POSITION_LABELS[item.position] || `${item.position}th Winner`}
      </Text>
    </TouchableOpacity>
  );
}

export default function WinnersCarousel({ winners }) {
  if (!winners || winners.length === 0) return null;

  return (
    <View style={{ backgroundColor: "#fff", marginTop: 10, paddingVertical: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", paddingHorizontal: 16, marginBottom: 12 }}>
        Previous Winners
      </Text>
      <FlatList
        data={winners}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <WinnerItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}
