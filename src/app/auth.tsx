import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { storeSessionToken } from "../lib/api";
import { colors } from "../theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    isNew?: string;
    error?: string;
  }>();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function handleCallback() {
      if (params.error) {
        router.replace({
          pathname: "/(auth)/login",
          params: { error: params.error },
        } as any);
        return;
      }

      if (!params.token) {
        router.replace("/(auth)/login" as any);
        return;
      }

      await storeSessionToken(params.token);

      let firstName = "Athlete";
      let email = "";
      try {
        const payload = jwtDecode<{ name?: string; email?: string }>(
          params.token,
        );
        firstName = payload.name?.split(" ")[0] ?? "Athlete";
        email = payload.email ?? "";
      } catch {
        // Fall back to defaults — welcome screens still render fine.
      }

      const isNew = params.isNew === "true";
      if (isNew) {
        router.replace({
          pathname: "/welcome",
          params: { firstName },
        } as any);
      } else {
        router.replace({
          pathname: "/welcome-back",
          params: { firstName, email },
        } as any);
      }
    }

    handleCallback();
  }, []);

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
