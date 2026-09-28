import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const TEAL = "#1a9e8f";
const TABS = ["About Competition", "Judging Parameters", "Rules & Eligibility"];

export default function InfoTabs({ competition }) {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const contents = [
    {
      short: competition.description?.short || "",
      full: competition.description?.full || "",
    },
    { full: competition.judgingParameters || "Not specified." },
    { full: competition.rulesAndEligibility || "Not specified." },
  ];

  const content = contents[activeTab];
  const displayText = activeTab === 0 && !expanded ? content.short : content.full;
  const canExpand = activeTab === 0 && content.full && content.full !== content.short;

  return (
    <View style={{ backgroundColor: "#fff", marginTop: 10 }}>
      {/* Tab bar */}
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" }}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { setActiveTab(i); setExpanded(false); }}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === i ? TEAL : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: activeTab === i ? "700" : "400",
                color: activeTab === i ? TEAL : "#888",
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 13, color: "#444", lineHeight: 20 }}>
          {displayText}
        </Text>
        {canExpand && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={{ color: TEAL, fontSize: 13, fontWeight: "600" }}>
              {expanded ? "View less" : "View more"}
            </Text>
            <Text style={{ color: TEAL, fontSize: 13 }}>{expanded ? "∧" : "∨"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
