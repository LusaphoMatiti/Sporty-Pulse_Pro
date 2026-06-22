import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { SPTabBar, type TabKey } from "../../components/ui/SPTabBar";
import { useAppTheme } from "../../theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CACHE_KEYS } from "../../lib/cacheKeys";

function getActiveTab(segments: string[]): TabKey {
  const last = segments[segments.length - 1];
  if (last === "index" || last === "(tabs)") return "home";
  if (last === "training" || last === "programs") return "training";
  if (last === "progress") return "progress";
  if (last === "settings") return "settings";
  return "home";
}

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const activeTab = getActiveTab(segments);
  // FIX: this used to be `colors.void` from a static "../../theme" import —
  // a plain object resolved once at import time, with no connection to
  // ThemeContext. It never updated with isDark, which is why the root
  // background stayed black regardless of theme mode. useAppTheme() reads
  // the live context, so theme.void now actually switches between
  // darkTheme.void ("#0A0A0A") and lightTheme.void ("#F0F2F5").
  const { theme } = useAppTheme();

  const handleTrainingPress = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.training);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.instanceId) {
          router.navigate("/(tabs)/training" as any);
          return;
        }
      }
    } catch {
      // fall through
    }
    // No active plan in cache → go to Programs tab
    router.navigate("/(tabs)/programs" as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.void }]}>
      {/*
        This wrapper is the fix: previously <Tabs> had no explicit flex
        and SPTabBar was position:absolute, so SPTabBar floated ON TOP
        of <Tabs> content instead of taking its own row underneath it.
        Giving <Tabs> flex:1 here means it only fills the space that's
        left ABOVE the tab bar — the tab bar now occupies a real row,
        so screen content can never scroll underneath it.
      */}
      <View style={styles.screenArea}>
        <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="training" />
          <Tabs.Screen name="programs" />
          <Tabs.Screen name="progress" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>

      <SPTabBar
        activeTab={activeTab}
        onTabPress={(tab) => {
          if (tab.key === "home") router.navigate("/(tabs)" as any);
          else if (tab.key === "training") handleTrainingPress();
          else router.navigate(tab.href as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
});
