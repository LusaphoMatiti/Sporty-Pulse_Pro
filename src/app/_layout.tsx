import React, { useEffect, useState } from "react";
import { View, StatusBar, Platform } from "react-native";
import { Stack, useRouter, useNavigationContainerRef } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getSessionToken, clearSessionToken } from "../lib/api";
import { ThemeProvider, useAppTheme } from "../theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

// ─── ThemedApp ────────────────────────────────────────────────────────────────
// Receives the resolved auth state so it can redirect declaratively
// *after* the Stack navigator is mounted — avoids the race condition where
// router.replace() fires before the navigator tree exists.

interface ThemedAppProps {
  hasToken: boolean;
}

function ThemedApp({ hasToken }: ThemedAppProps) {
  const { theme, isDark } = useAppTheme();
  const router = useRouter();

  // Wait one frame after mount before redirecting so the Stack is ready.
  useEffect(() => {
    const id = setTimeout(() => {
      if (hasToken) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }, 0);
    return () => clearTimeout(id);
  }, [hasToken]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.void}
          translucent={Platform.OS === "android"}
        />
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.bg },
              animation: "slide_from_right",
              animationDuration: 280,
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen
              name="onboarding"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── RootLayout ───────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Barlow-Regular": require("../assets/fonts/Barlow-Regular.ttf"),
    "Barlow-Medium": require("../assets/fonts/Barlow-Medium.ttf"),
    "Barlow-SemiBold": require("../assets/fonts/Barlow-SemiBold.ttf"),
    "Barlow-Bold": require("../assets/fonts/Barlow-Bold.ttf"),
    "Barlow-ExtraBold": require("../assets/fonts/Barlow-ExtraBold.ttf"),
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // ── Step 1: check token ────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      const token = await getSessionToken();

      if (!token) {
        setHasToken(false);
        setAuthChecked(true);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();

        if (!res.ok || !data?.id) {
          await clearSessionToken();
          setHasToken(false);
        } else {
          setHasToken(true);
        }
      } catch {
        // Network error — keep token, let them try
        setHasToken(!!token);
      }

      setAuthChecked(true);
    }

    checkAuth();
  }, []);

  // ── Step 2: hide splash when fonts + auth are both done ───────────────────
  useEffect(() => {
    if ((fontsLoaded || fontError) && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authChecked]);

  // ── Step 3: block render until ready ──────────────────────────────────────
  // NOTE: do NOT call router.replace() here — the navigator doesn't exist yet.
  // ThemedApp handles the redirect in its own useEffect (after mount).
  if (!fontsLoaded && !fontError) return null;
  if (!authChecked || hasToken === null) return null;

  return (
    <ThemeProvider>
      <ThemedApp hasToken={hasToken} />
    </ThemeProvider>
  );
}
