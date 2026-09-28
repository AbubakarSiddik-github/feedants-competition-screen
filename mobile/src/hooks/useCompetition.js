import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { AppState } from "react-native";
import { fetchCompetition } from "../api/competitions";

// Clock-drift offset: server time minus local time (ms)
let clockOffset = 0;

export function getServerNow() {
  return new Date(Date.now() + clockOffset);
}

export function useCompetition(id) {
  const appState = useRef(AppState.currentState);

  const query = useQuery({
    queryKey: ["competition", id],
    queryFn: async () => {
      const data = await fetchCompetition(id);
      // Sync clock drift
      if (data.serverTime) {
        clockOffset = new Date(data.serverTime).getTime() - Date.now();
      }
      return data;
    },
    refetchInterval: 15000, // keep spots/phase fresh every 15s
    staleTime: 10000,
    retry: 2,
  });

  // Refetch when app comes back to foreground (Phase 8 edge case)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        query.refetch();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [query]);

  return query;
}
