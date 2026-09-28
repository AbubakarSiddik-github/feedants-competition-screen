import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

export default function JudgeCard({ judge }) {
  return (
    <View style={{
      backgroundColor: "#fff",
      marginTop: 10,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Image
          source={judge.photoUrl ? { uri: judge.photoUrl } : require("../../assets/icon.png")}
          style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#e0e0e0" }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#888" }}>Judge</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>{judge.name}</Text>
          <Text style={{ fontSize: 12, color: "#555", marginTop: 1 }}>{judge.title}</Text>
          <Text style={{ fontSize: 11, color: TEAL, marginTop: 1 }}>{judge.experience}</Text>
        </View>
      </View>

      {/* Intro video button */}
      <TouchableOpacity
        style={{ alignItems: "center", marginLeft: 12 }}
        onPress={() => {
          // Linking.openURL(judge.introVideoUrl) — kept simple as per plan
        }}
      >
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: "#f0f0f0",
          justifyContent: "center", alignItems: "center",
        }}>
          <Ionicons name="play" size={18} color={TEAL} />
        </View>
        <Text style={{ fontSize: 10, color: "#888", marginTop: 3 }}>Intro Video</Text>
      </TouchableOpacity>
    </View>
  );
}
