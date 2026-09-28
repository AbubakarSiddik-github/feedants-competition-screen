import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#1a9e8f";

function fmt(dateStr) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

function DateCell({ icon, label, dateStr }) {
  const { date, time } = fmt(dateStr);
  return (
    <View style={{ flex: 1, padding: 10, minWidth: "45%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Ionicons name={icon} size={16} color={TEAL} />
        <Text style={{ fontSize: 11, color: "#888" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>{date}</Text>
      <Text style={{ fontSize: 12, color: "#555" }}>{time}</Text>
    </View>
  );
}

export default function ImportantDatesGrid({ competition }) {
  return (
    <View style={{ backgroundColor: "#fff", marginTop: 10, padding: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 10 }}>
        Important Dates
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 0 }}>
        <DateCell icon="calendar-outline" label="Register Before" dateStr={competition.registrationDeadline} />
        <DateCell icon="send-outline" label="Submission Starts" dateStr={competition.submissionStart} />
        <DateCell icon="arrow-up-outline" label="Submission Ends" dateStr={competition.submissionEnd} />
        <DateCell icon="trophy-outline" label="Result Date" dateStr={competition.resultDate} />
      </View>
    </View>
  );
}
