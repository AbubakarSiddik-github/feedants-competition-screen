import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getServerNow } from "../hooks/useCompetition";

const TEAL = "#1a9e8f";

function pad(n) {
  return String(n).padStart(2, "0");
}

function computeTimeLeft(targetDate) {
  const now = getServerNow();
  const diff = Math.max(0, new Date(targetDate).getTime() - now.getTime());
  const total = Math.floor(diff / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s, done: diff <= 0 };
}

/**
 * CountdownTimer
 * targetDate — ISO string / Date
 * label      — "Registration closes in" | "Submission closes in"
 * Ticks using server-corrected clock (getServerNow) so phone clock drift
 * doesn't show wrong time.
 */
export default function CountdownTimer({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState(computeTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(computeTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.done) return null;

  return (
    <View
      style={{
        backgroundColor: "#f0faf9",
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#c8ece8",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="hourglass-outline" size={16} color={TEAL} />
        <Text style={{ fontSize: 12, color: "#444" }}>{label}</Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: "700", color: TEAL, letterSpacing: 0.5 }}>
        {pad(timeLeft.d)}d : {pad(timeLeft.h)}h : {pad(timeLeft.m)}m : {pad(timeLeft.s)}s
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons name="time-outline" size={14} color="#e65100" />
        <Text style={{ fontSize: 12, color: "#e65100", fontWeight: "600" }}>Hurry up!</Text>
      </View>
    </View>
  );
}
