import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { PlantProvider } from "@/context/PlantContext";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

// Suppress fontfaceobserver timeout errors globally on web so they never
// crash the app. Fonts will fall back to system fonts gracefully.
if (Platform.OS === "web" && typeof window !== "undefined") {
  const _origOnError = window.onerror;
  window.onerror = (msg, src, line, col, err) => {
    if (typeof msg === "string" && msg.includes("timeout exceeded")) {
      return true; // suppress
    }
    if (_origOnError) return _origOnError(msg, src, line, col, err);
    return false;
  };
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    if (
      reason &&
      typeof reason.message === "string" &&
      reason.message.includes("timeout exceeded")
    ) {
      event.preventDefault();
    }
  });
}

// Kick off Ionicons font load immediately in the background.
// This gives fontfaceobserver the best chance of succeeding before
// any icon renders. Errors are swallowed — icons fall back gracefully.
if (Platform.OS === "web") {
  Font.loadAsync(Ionicons.font).catch(() => {});
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="report" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PlantProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </PlantProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
