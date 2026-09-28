import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { useCompetition } from "../hooks/useCompetition";
import { getCtaState, getPhaseInfo } from "../utils/competitionPhase";
import { registerForCompetition, submitEntry } from "../api/competitions";

import CompetitionHeaderCard from "../components/CompetitionHeaderCard";
import JudgeCard from "../components/JudgeCard";
import CountdownTimer from "../components/CountdownTimer";
import ImportantDatesGrid from "../components/ImportantDatesGrid";
import WinnersCarousel from "../components/WinnersCarousel";
import InfoTabs from "../components/InfoTabs";
import RewardsTable from "../components/RewardsTable";
import ReferralCard from "../components/ReferralCard";
import StickyCTABar from "../components/StickyCTABar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

const TEAL = "#1a9e8f";
const COMPETITION_ID = process.env.EXPO_PUBLIC_COMPETITION_ID;

export default function CompetitionDetailsScreen({ navigation, route, user }) {
  const competitionId = route?.params?.competitionId || COMPETITION_ID;
  const queryClient = useQueryClient();
  const [ctaLoading, setCtaLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: competition, isLoading, isError, error, refetch } = useCompetition(competitionId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ─── Error and loading states ──────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;
  if (isError) {
    const msg =
      error?.response?.status === 404
        ? "Competition not found."
        : "Could not load competition. Check your connection.";
    return <ErrorState message={msg} onRetry={refetch} />;
  }

  // ─── Derived state ─────────────────────────────────────────────────────────
  const isRegistered = competition.isRegistered ?? false;
  const hasSubmitted = competition.hasSubmitted ?? false;
  const phaseInfo = getPhaseInfo(competition);
  const cta = getCtaState(competition, { isRegistered, hasSubmitted });

  // Which countdown to show
  let countdownTarget = null;
  let countdownLabel = "";
  if (phaseInfo.registrationOpen) {
    countdownTarget = competition.registrationDeadline;
    countdownLabel = "Registration closes in";
  } else if (phaseInfo.submissionOpen) {
    countdownTarget = competition.submissionEnd;
    countdownLabel = "Submission closes in";
  }

  // ─── CTA handler ───────────────────────────────────────────────────────────
  async function handleCta() {
    if (!user) {
      Alert.alert("Login required", "Please log in to participate.", [{ text: "OK" }]);
      return;
    }

    if (cta.action === "register") {
      Alert.prompt
        ? Alert.prompt(
            "Referral Code (optional)",
            "Enter a referral code if you have one:",
            async (code) => {
              await doRegister(code?.trim() || undefined);
            },
            "plain-text"
          )
        : Alert.alert(
            "Register",
            `Entry fee: ₹${competition.entryFee}\nProceed?`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Register", onPress: () => doRegister() },
            ]
          );
    } else if (cta.action === "upload") {
      Alert.alert(
        "Upload Submission",
        "Submit your performance link or description:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: () => doSubmit("https://youtube.com/watch?v=my_dance_video"),
          },
        ]
      );
    } else if (cta.action === "view_results") {
      Alert.alert("Results", "Results will be displayed here.");
    }
  }

  async function doRegister(referralCode) {
    setCtaLoading(true);
    try {
      await registerForCompetition(competitionId, referralCode);
      // Invalidate so useCompetition refetches fresh isRegistered state
      await queryClient.invalidateQueries({ queryKey: ["competition", competitionId] });
      Alert.alert("🎉 Registered!", "You have successfully registered for this competition.");
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed. Please try again.";
      // Edge-case specific messages
      if (err?.response?.status === 409 && msg.includes("spots")) {
        Alert.alert("No Spots Left", "Sorry, all spots were just filled. You can try again if a spot opens up.");
      } else if (err?.response?.status === 409 && msg.includes("registered")) {
        Alert.alert("Already Registered", "You are already registered for this competition.");
      } else if (err?.response?.status === 400 && msg.includes("closed")) {
        Alert.alert("Registration Closed", "The registration window has ended.");
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setCtaLoading(false);
    }
  }

  async function doSubmit(content) {
    setCtaLoading(true);
    try {
      await submitEntry(competitionId, content);
      await queryClient.invalidateQueries({ queryKey: ["competition", competitionId] });
      Alert.alert("✅ Submitted!", "Your submission has been recorded.");
    } catch (err) {
      const msg = err?.response?.data?.error || "Submission failed.";
      if (err?.response?.status === 403) {
        Alert.alert("Not Registered", "You must register before submitting.");
      } else if (err?.response?.status === 400) {
        Alert.alert("Window Error", msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setCtaLoading(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }} edges={["top"]}>
      {/* Nav bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="arrow-back" size={20} color="#111" />
          <Text style={{ fontSize: 14, color: "#111" }}>Go back</Text>
        </TouchableOpacity>

        {/* Language toggle */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <View
            style={{
              backgroundColor: TEAL,
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>ENG</Text>
          </View>
          <View
            style={{
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#888", fontSize: 12 }}>हिंदी</Text>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
      >
        {/* 1 — Header card */}
        <CompetitionHeaderCard competition={competition} isRegistered={isRegistered} />

        {/* 2 — Judge */}
        {competition.judge?.name && <JudgeCard judge={competition.judge} />}

        {/* 3 — Countdown (registration or submission window, whichever is active) */}
        {countdownTarget && (
          <CountdownTimer targetDate={countdownTarget} label={countdownLabel} />
        )}

        {/* 4 — Important dates */}
        <ImportantDatesGrid competition={competition} />

        {/* 5 — Previous winners */}
        {competition.previousWinners?.length > 0 && (
          <WinnersCarousel winners={competition.previousWinners} />
        )}

        {/* 6 — Info tabs */}
        <InfoTabs competition={competition} />

        {/* 7 — Rewards */}
        {competition.rewards?.length > 0 && (
          <RewardsTable
            rewards={competition.rewards}
            disclaimers={competition.disclaimers}
          />
        )}

        {/* 8 — Prize money explainer card */}
        <View
          style={{
            backgroundColor: "#fff",
            marginTop: 10,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: TEAL,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() =>
              Linking.openURL("https://feedants.com/how-prize-works")
            }
          >
            <Ionicons name="play" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111" }}>
              How will you receive prize money?
            </Text>
            <Text style={{ fontSize: 11, color: TEAL, marginTop: 2 }}>
              Watch video to know more
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#4caf50" />
              <Text style={{ fontSize: 11, color: "#555" }}>Refund policy</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="shield-outline" size={14} color="#4caf50" />
              <Text style={{ fontSize: 11, color: "#555" }}>
                Secure payments powered by{" "}
                <Text style={{ fontWeight: "700", color: "#072654" }}>Razorpay</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 9 — Referral card (only when logged in) */}
        {user && <ReferralCard user={user} />}

        {/* 10 — Hear from users placeholder */}
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            marginTop: 10,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={TEAL} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#111" }}>
                Hear From Our Users
              </Text>
              <Text style={{ fontSize: 11, color: "#888" }}>
                See what participants say about Feedants
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#bbb" />
        </TouchableOpacity>

        {/* 11 — Ad placeholder */}
        <View
          style={{
            margin: 16,
            backgroundColor: "#f0f0f0",
            borderRadius: 10,
            height: 56,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Ionicons name="megaphone-outline" size={18} color="#bbb" />
          <Text style={{ color: "#bbb", fontSize: 13 }}>Ad Here</Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <StickyCTABar
        cta={cta}
        onPress={handleCta}
        loading={ctaLoading}
        subLabel={isRegistered ? "Registered" : null}
      />
    </SafeAreaView>
  );
}
