import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { getStoredUser, logout } from "./src/api/auth";

import CompetitionDetailsScreen from "./src/screens/CompetitionDetailsScreen";
import LoginScreen from "./src/screens/LoginScreen";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10000,
    },
  },
});

const TEAL = "#1a9e8f";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Restore session on launch
  useEffect(() => {
    getStoredUser().then((u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) return null;

  function handleLoginSuccess(u) {
    setUser(u);
    setShowLogin(false);
    // Invalidate all competition queries so they refetch with auth
    queryClient.invalidateQueries({ queryKey: ["competition"] });
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ["competition"] });
  }

  if (showLogin) {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CompetitionDetails">
              {(props) => (
                <View style={{ flex: 1 }}>
                  <CompetitionDetailsScreen {...props} user={user} />
                  {/* Floating auth toggle (top-right) — for demo only */}
                  <TouchableOpacity
                    onPress={user ? handleLogout : () => setShowLogin(true)}
                    style={{
                      position: "absolute",
                      top: 54,
                      right: 16,
                      backgroundColor: user ? "#e8f5e9" : "#fff3e0",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      zIndex: 99,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: user ? "#388e3c" : "#e65100", fontWeight: "700" }}>
                      {user ? `${user.name.split(" ")[0]} (Logout)` : "Login"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
