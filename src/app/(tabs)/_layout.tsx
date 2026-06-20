import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { SPTabBar, type TabKey } from "../../components/ui/SPTabBar";
import { colors } from "../../theme";
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
    <View style={styles.root}>
      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="training" />
        <Tabs.Screen name="programs" />
        <Tabs.Screen name="progress" />
        <Tabs.Screen name="settings" />
      </Tabs>

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
    backgroundColor: colors.void,
  },
});
