import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SessionScreen from "../../../../../screens/SessionScreen";
import { SPText } from "../../../../../components/ui/SPText";
import { getSessionStart, type SessionStartData } from "../../../../../lib/api";
import { useAppTheme } from "../../../../../theme/ThemeContext";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SessionStartData };

export default function SessionRoute() {
  const { instanceId, sessionNumber } = useLocalSearchParams<{
    instanceId: string;
    sessionNumber: string;
  }>();
  const router = useRouter();
  const { theme } = useAppTheme();

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!instanceId || !sessionNumber) {
      setState({ status: "error", message: "Missing route params" });
      return;
    }

    let cancelled = false;

    getSessionStart(instanceId, Number(sessionNumber))
      .then((res) => {
        if (cancelled) return;
        if (!res?.success || !res.data) {
          setState({ status: "error", message: "Session not found" });
        } else {
          setState({ status: "ready", data: res.data });
        }
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message ?? "Network error" });
      });

    return () => {
      cancelled = true;
    };
  }, [instanceId, sessionNumber]);

  if (state.status === "loading") {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.bg }]}
        edges={["top", "bottom"]}
      >
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  if (state.status === "error") {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.bg }]}
        edges={["top", "bottom"]}
      >
        <SPText style={{ color: theme.muted, marginBottom: 16 }}>
          {state.message}
        </SPText>
        <SPText
          style={{ color: theme.accent }}
          onPress={() => router.replace("/(tabs)/training")}
        >
          ← Back to training
        </SPText>
      </SafeAreaView>
    );
  }

  return <SessionScreen {...state.data} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
