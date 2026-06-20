/**
 * src/app/auth.tsx
 *
 * Deep-link handler for sporty-pulse-pro://auth?token=...&isNew=...
 *
 * This screen is never seen by the user — it just catches the OAuth
 * callback, stores the token, and immediately routes to the right screen.
 *
 * New user     → /welcome      (onboarding flow)
 * Returning    → /welcome-back (straight to tabs)
 * Error        → /(auth)/login (back to login with error)
 */

import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { storeSessionToken } from "../lib/api";
import { colors } from "../theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    isNew?: string;
    error?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      // Handle error from server
      if (params.error) {
        router.replace({
          pathname: "/(auth)/login",
          params: { error: params.error },
        } as any);
        return;
      }

      // No token — something went wrong
      if (!params.token) {
        router.replace("/(auth)/login" as any);
        return;
      }

      // Store the JWT
      await storeSessionToken(params.token);

      // Route based on whether this is a new user
      const isNew = params.isNew === "true";
      if (isNew) {
        router.replace("/welcome" as any);
      } else {
        router.replace("/welcome-back" as any);
      }
    }

    handleCallback();
  }, []);

  // Blank loading screen — user should never see this for more than a frame
  return (
    <View style={styles.fill}>
      <ActivityIndicator color={colors.acid} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.void,
    alignItems: "center",
    justifyContent: "center",
  },
});
