"use client";
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from "react-native-reanimated";

import { SPText } from "../components/ui";
import { SPButton } from "../components/ui";
import { SPBadge } from "../components/ui";
import { api, clearSessionToken } from "../lib/api";
import { useAppTheme } from "../theme/ThemeContext";
import { SPIcon } from "../components/icons/SPIcon";
import { SPSkeleton } from "../components/ui/SPSkeleton";
import { fonts } from "../theme";

import type { SPUser, UserLevel } from "../types/session";

// ─── Design Tokens ────────────────────────────────────────────────────────────

const D = {
  space: {
    micro: 4,
    tight: 8,
    std: 16,
    section: 24,
    large: 32,
    major: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  type: {
    h1: { fontSize: 30, lineHeight: 36, fontWeight: "700" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    subtext: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  button: { height: 52, borderRadius: 14 },
  input: { height: 50, borderRadius: 12 },
  row: { height: 52 },
  spring: { damping: 18, stiffness: 260, mass: 0.8 },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Identity = "REBUILD" | "OPERATOR" | "EXECUTIVE_PERFORMANCE";

interface SettingsData {
  user: SPUser;
  currentLevel: UserLevel;
  plan: string;
  identity: Identity | null;
}

// ─── Identity config ──────────────────────────────────────────────────────────

const IDENTITY_COLOR: Record<Identity, string> = {
  REBUILD: "#FF9500",
  OPERATOR: "#30D158",
  EXECUTIVE_PERFORMANCE: "#BF5AF2",
};

const IDENTITY_LABEL: Record<Identity, string> = {
  REBUILD: "Rebuild",
  OPERATOR: "Operator",
  EXECUTIVE_PERFORMANCE: "Exec Perf",
};

// ─── Training levels ──────────────────────────────────────────────────────────

const TRAINING_LEVELS: { value: UserLevel; label: string; sub: string }[] = [
  { value: "BEGINNER", label: "Beginner", sub: "0–1 yr" },
  { value: "INTERMEDIATE", label: "Intermediate", sub: "1–3 yrs" },
  { value: "ADVANCED", label: "Advanced", sub: "3–6 yrs" },
];

const CACHE_KEY = "sp_settings_cache";

// ─── PressableScale ───────────────────────────────────────────────────────────

function PressableScale({
  onPress,
  disabled,
  style,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[aStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!onPress || disabled) return;
          scale.value = withSpring(0.97, D.spring);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, D.spring);
        }}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

function SettingRow({
  label,
  value,
  danger,
  rightEl,
  onPress,
  last,
}: {
  label: string;
  value?: string;
  danger?: boolean;
  rightEl?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const labelColor = danger ? "#FF453A" : theme.text;

  return (
    <Animated.View style={aStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!onPress) return;
          scale.value = withSpring(0.98, D.spring);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, D.spring);
        }}
        disabled={!onPress}
        style={[
          rowStyles.row,
          !last && { borderBottomWidth: 1, borderBottomColor: theme.border },
        ]}
      >
        <SPText
          style={[
            D.type.subtext,
            { fontFamily: fonts.brandMedium, color: labelColor, flex: 1 },
          ]}
        >
          {label}
        </SPText>
        <View style={rowStyles.right}>
          {value && (
            <SPText style={[D.type.caption, { color: theme.muted }]}>
              {value}
            </SPText>
          )}
          {rightEl ??
            (onPress ? (
              <SPIcon name="forward" size={16} color={theme.muted} />
            ) : null)}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: D.row.height,
    paddingHorizontal: D.space.std,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: D.space.tight,
  },
});

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: D.space.tight }}>
      <SPText
        style={[
          D.type.caption,
          {
            color: theme.muted,
            fontFamily: fonts.brandMedium,
            letterSpacing: 1,
            textTransform: "uppercase",
            paddingHorizontal: D.space.micro,
          },
        ]}
      >
        {title}
      </SPText>
      <View
        style={[
          cardStyles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: D.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useAppTheme();
  const translateX = useSharedValue(isDark ? 20 : 0);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 20 : 0, D.spring);
  }, [isDark]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleTheme();
      }}
      style={[
        toggleStyles.track,
        { backgroundColor: isDark ? theme.accent : theme.surface2 },
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Toggle dark mode"
    >
      <Animated.View
        style={[
          toggleStyles.thumb,
          thumbStyle,
          { backgroundColor: isDark ? theme.bg : theme.muted },
        ]}
      />
    </Pressable>
  );
}

const toggleStyles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: D.radius.full,
    justifyContent: "center",
    paddingHorizontal: D.space.micro,
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: D.radius.full,
  },
});

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 60 }: { user: SPUser; size?: number }) {
  const { theme } = useAppTheme();
  const r = size / 2;

  if (user.image) {
    return (
      <Image
        source={{ uri: user.image }}
        style={{
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: r,
        backgroundColor: theme.accentDim,
        borderWidth: 1,
        borderColor: theme.accent + "40",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SPText
        style={{
          fontFamily: fonts.brandBold,
          fontSize: size * 0.38,
          color: theme.accent,
          lineHeight: size * 0.45,
        }}
      >
        {user.name?.charAt(0).toUpperCase() ?? "?"}
      </SPText>
    </View>
  );
}

// ─── EditProfileSheet ─────────────────────────────────────────────────────────

function EditProfileSheet({
  user,
  currentLevel,
  onClose,
  onSaved,
}: {
  user: SPUser;
  currentLevel: UserLevel;
  onClose: () => void;
  onSaved: (newName: string, newImage: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const [name, setName] = useState(user.name ?? "");
  const [level, setLevel] = useState<UserLevel>(currentLevel);
  const [photoUri, setPhotoUri] = useState<string | null>(user.image);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      if (photoChanged && photoUri) {
        const filename = photoUri.split("/").pop() ?? "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("photo", {
          uri: photoUri,
          name: filename,
          type,
        } as any);
      }

      const profileRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? ""}/api/user/profile`,
        { method: "PATCH", body: formData },
      );
      const profileData = await profileRes.json();
      if (!profileRes.ok)
        throw new Error(profileData.error ?? "Failed to save profile");

      const levelRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? ""}/api/user/level`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level }),
        },
      );
      if (!levelRes.ok) {
        const d = await levelRes.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to update level");
      }

      onSaved(name.trim(), profileData.user?.image ?? null);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ justifyContent: "flex-end" }}
        >
          <Pressable
            style={[
              sheetStyles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                paddingBottom:
                  Math.max(insets.bottom, D.space.std) + D.space.std,
              },
            ]}
          >
            {/* Handle */}
            <View
              style={[
                sheetStyles.handle,
                { backgroundColor: theme.muted + "40" },
              ]}
            />

            {/* Header */}
            <View style={sheetStyles.header}>
              <View style={{ gap: D.space.micro }}>
                <SPText
                  style={[
                    D.type.caption,
                    {
                      color: theme.muted,
                      fontFamily: fonts.brandMedium,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    },
                  ]}
                >
                  Account
                </SPText>
                <SPText
                  style={[
                    D.type.h2,
                    { color: theme.text, fontFamily: fonts.brandBold },
                  ]}
                >
                  Edit Profile
                </SPText>
              </View>
              <PressableScale onPress={onClose}>
                <View
                  style={[
                    sheetStyles.closeBtn,
                    { backgroundColor: theme.surface2 },
                  ]}
                >
                  <SPIcon name="close" size={16} color={theme.muted2} />
                </View>
              </PressableScale>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 480 }}
            >
              {/* Photo picker */}
              <View style={sheetStyles.photoPicker}>
                <PressableScale onPress={pickPhoto}>
                  <View style={{ position: "relative" }}>
                    {photoUri ? (
                      <Image
                        source={{ uri: photoUri }}
                        style={[
                          sheetStyles.photoImg,
                          { borderColor: theme.border },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          sheetStyles.photoFallback,
                          {
                            backgroundColor: theme.accentDim,
                            borderColor: theme.accent + "40",
                          },
                        ]}
                      >
                        <SPText
                          style={{
                            fontFamily: fonts.brandBold,
                            fontSize: 30,
                            color: theme.accent,
                          }}
                        >
                          {name.charAt(0).toUpperCase() || "?"}
                        </SPText>
                      </View>
                    )}
                    <View
                      style={[
                        sheetStyles.cameraBadge,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <SPIcon name="camera" size={14} color={theme.bg} />
                    </View>
                  </View>
                </PressableScale>
                <SPText style={[D.type.caption, { color: theme.muted }]}>
                  Tap to change photo
                </SPText>
              </View>

              {/* Name input */}
              <View
                style={{ marginBottom: D.space.section, gap: D.space.tight }}
              >
                <SPText
                  style={[
                    D.type.caption,
                    {
                      color: theme.muted,
                      fontFamily: fonts.brandMedium,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      paddingHorizontal: D.space.micro,
                    },
                  ]}
                >
                  Display Name
                </SPText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Your name"
                  placeholderTextColor={theme.muted}
                  style={[
                    sheetStyles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surface2,
                      borderColor: nameFocused ? theme.accent : theme.border,
                      fontFamily: fonts.brandRegular,
                    },
                  ]}
                />
              </View>

              {/* Level picker */}
              <View
                style={{ marginBottom: D.space.section, gap: D.space.tight }}
              >
                <SPText
                  style={[
                    D.type.caption,
                    {
                      color: theme.muted,
                      fontFamily: fonts.brandMedium,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      paddingHorizontal: D.space.micro,
                    },
                  ]}
                >
                  Training Level
                </SPText>
                <View style={{ flexDirection: "row", gap: D.space.tight }}>
                  {TRAINING_LEVELS.map((l) => {
                    const sel = level === l.value;
                    return (
                      <PressableScale
                        key={l.value}
                        onPress={() => {
                          setLevel(l.value);
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        }}
                        style={{ flex: 1 }}
                      >
                        <View
                          style={[
                            sheetStyles.levelCard,
                            {
                              backgroundColor: sel
                                ? theme.accentDim
                                : theme.surface2,
                              borderColor: sel
                                ? theme.accent + "40"
                                : theme.border,
                            },
                          ]}
                        >
                          <SPText
                            style={[
                              D.type.subtext,
                              {
                                fontFamily: fonts.brandBold,
                                color: sel ? theme.accent : theme.muted2,
                              },
                            ]}
                          >
                            {l.label}
                          </SPText>
                          <SPText
                            style={[D.type.caption, { color: theme.muted }]}
                          >
                            {l.sub}
                          </SPText>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {error ? (
                <SPText
                  style={[
                    D.type.caption,
                    {
                      color: "#FF453A",
                      textAlign: "center",
                      marginBottom: D.space.std,
                    },
                  ]}
                >
                  {error}
                </SPText>
              ) : null}
            </ScrollView>

            <View style={{ marginTop: D.space.std }}>
              <SPButton onPress={handleSave} loading={saving} fullWidth>
                Save Changes
              </SPButton>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.60)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: D.radius.lg * 2,
    borderTopRightRadius: D.radius.lg * 2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: D.space.std,
    paddingTop: D.space.std,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: D.space.section,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: D.space.section,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPicker: {
    alignItems: "center",
    marginBottom: D.space.section,
    gap: D.space.tight,
  },
  photoImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  photoFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: D.input.height,
    borderWidth: 1,
    borderRadius: D.input.borderRadius,
    paddingHorizontal: D.space.std,
    fontSize: D.type.body.fontSize,
  },
  levelCard: {
    borderRadius: D.radius.md,
    borderWidth: 1,
    padding: D.space.std,
    gap: D.space.micro,
  },
});

// ─── SettingsSkeleton ─────────────────────────────────────────────────────────

function SettingsSkeleton() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        mainStyles.content,
        { paddingTop: insets.top + D.space.std },
      ]}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: D.space.tight }}>
        <SPSkeleton width={60} height={11} />
        <SPSkeleton width={140} height={32} radius={D.radius.sm} />
      </View>

      <View
        style={[
          mainStyles.profileCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <SPSkeleton width={60} height={60} radius={30} />
        <View style={{ flex: 1, gap: D.space.tight }}>
          <SPSkeleton width="50%" height={14} />
          <SPSkeleton width="30%" height={11} />
        </View>
        <SPSkeleton width={52} height={24} radius={D.radius.full} />
      </View>

      {[
        ["Account", 1],
        ["Training", 1],
        ["Preferences", 2],
        ["Subscription", 2],
        ["More", 3],
      ].map(([title, count]) => (
        <View key={title as string} style={{ gap: D.space.tight }}>
          <SPSkeleton width={80} height={11} />
          <View
            style={[
              cardStyles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {Array.from({ length: count as number }).map((_, i) => (
              <View
                key={i}
                style={[
                  rowStyles.row,
                  i < (count as number) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <SPSkeleton width="45%" height={13} />
                <SPSkeleton width={40} height={22} radius={D.radius.full} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── SettingsScreen ───────────────────────────────────────────────────────────

export function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();

  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setData(JSON.parse(cached));
          setLoading(false);
        }
      } catch {
        // cache miss
      }
    }
    try {
      if (isRefresh) setRefreshing(true);
      const d = await api.get<SettingsData>("/api/settings");
      setData(d);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(d));
    } catch (e) {
      console.error("[SettingsScreen] fetch failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearSessionToken();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  }

  if (loading || !data) {
    return (
      <View style={[mainStyles.fill, { backgroundColor: theme.bg }]}>
        <SettingsSkeleton />
      </View>
    );
  }

  const { user, currentLevel, plan, identity } = data;
  const isPro = plan === "PRO";

  return (
    <View style={[mainStyles.fill, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={mainStyles.fill}
        contentContainerStyle={[
          mainStyles.content,
          { paddingTop: insets.top + D.space.std },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* ── Page Header ── */}
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{ gap: D.space.micro }}
        >
          <SPText
            style={[
              D.type.caption,
              {
                color: theme.muted,
                fontFamily: fonts.brandMedium,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              },
            ]}
          >
            Account
          </SPText>
          <SPText
            style={[
              D.type.h1,
              { color: theme.text, fontFamily: fonts.brandBold },
            ]}
          >
            Settings
          </SPText>
        </Animated.View>

        {/* ── Profile Card ── */}
        <Animated.View entering={FadeIn.duration(220).delay(40)}>
          <PressableScale onPress={() => setEditSheetOpen(true)}>
            <View
              style={[
                mainStyles.profileCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Avatar user={user} size={60} />
              <View style={{ flex: 1, gap: D.space.micro }}>
                <SPText
                  style={[
                    D.type.body,
                    {
                      color: theme.text,
                      fontFamily: fonts.brandBold,
                      fontSize: 17,
                    },
                  ]}
                >
                  {user.name ?? "Athlete"}
                </SPText>
                <SPText style={[D.type.caption, { color: theme.muted }]}>
                  Tap to edit profile
                </SPText>
              </View>
              <SPBadge variant={isPro ? "acid" : "outline"}>
                {isPro ? "Pro" : "Starter"}
              </SPBadge>
            </View>
          </PressableScale>
        </Animated.View>

        {/* ── Account ── */}
        <Animated.View entering={FadeIn.duration(220).delay(80)}>
          <SectionCard title="Account">
            <SettingRow
              label="Edit Profile"
              onPress={() => setEditSheetOpen(true)}
              last
            />
          </SectionCard>
        </Animated.View>

        {/* ── Training ── */}
        <Animated.View entering={FadeIn.duration(220).delay(110)}>
          <SectionCard title="Training">
            <SettingRow
              label="Training System"
              onPress={() => router.push("/settings/identity" as any)}
              last
              rightEl={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: D.space.tight,
                  }}
                >
                  {identity && (
                    <View
                      style={[
                        mainStyles.identityDot,
                        { backgroundColor: IDENTITY_COLOR[identity] },
                      ]}
                    />
                  )}
                  <SPText style={[D.type.caption, { color: theme.muted }]}>
                    {identity ? IDENTITY_LABEL[identity] : "Not set"}
                  </SPText>
                  <SPIcon name="forward" size={16} color={theme.muted} />
                </View>
              }
            />
          </SectionCard>
        </Animated.View>

        {/* ── Preferences ── */}
        <Animated.View entering={FadeIn.duration(220).delay(120)}>
          <SectionCard title="Preferences">
            <SettingRow
              label="Push Notifications"
              rightEl={
                <Pressable
                  onPress={() => {
                    setNotifEnabled((v) => !v);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    mainStyles.pillTrack,
                    {
                      backgroundColor: notifEnabled
                        ? theme.accent
                        : theme.surface2,
                    },
                  ]}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifEnabled }}
                >
                  <Animated.View
                    style={[
                      mainStyles.pillThumb,
                      {
                        backgroundColor: theme.bg,
                        transform: [{ translateX: notifEnabled ? 20 : 0 }],
                      },
                    ]}
                  />
                </Pressable>
              }
            />
            <SettingRow
              label="Dark Mode"
              last
              rightEl={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: D.space.tight,
                  }}
                >
                  <SPIcon
                    name={isDark ? "moon" : "sun"}
                    size={14}
                    color={isDark ? theme.accent : theme.muted}
                  />
                  <ThemeToggle />
                </View>
              }
            />
          </SectionCard>
        </Animated.View>

        {/* ── Subscription ── */}
        <Animated.View entering={FadeIn.duration(220).delay(160)}>
          <SectionCard title="Subscription">
            <SettingRow
              label="Current Plan"
              value={isPro ? "Pro" : "Starter"}
              rightEl={<View />}
            />
            {isPro ? (
              <SettingRow
                label="Manage Subscription"
                onPress={() => router.push("/pricing" as any)}
                last
              />
            ) : (
              <View style={{ padding: D.space.std }}>
                <SPButton
                  onPress={() => router.push("/pricing" as any)}
                  variant="primary"
                  fullWidth
                >
                  Upgrade to Pro
                </SPButton>
              </View>
            )}
          </SectionCard>
        </Animated.View>

        {/* ── More ── */}
        <Animated.View entering={FadeIn.duration(220).delay(200)}>
          <SectionCard title="More">
            <SettingRow
              label="About Us"
              onPress={() => router.push("/about" as any)}
            />
            <SettingRow
              label="Privacy Policy"
              onPress={() => router.push("/privacy" as any)}
            />
            <SettingRow
              label="Terms & Conditions"
              onPress={() => router.push("/terms" as any)}
              last
            />
          </SectionCard>
        </Animated.View>

        {/* ── Danger Zone ── */}
        <Animated.View entering={FadeIn.duration(220).delay(240)}>
          <SectionCard title="Danger Zone">
            <SettingRow
              label="Sign Out"
              danger
              onPress={handleSignOut}
              last
              rightEl={<SPIcon name="forward" size={16} color="#FF453A" />}
            />
          </SectionCard>
        </Animated.View>

        {/* Bottom clearance for tab bar */}
        <View style={{ height: D.space.major }} />
      </ScrollView>

      {editSheetOpen && (
        <EditProfileSheet
          user={user}
          currentLevel={currentLevel}
          onClose={() => setEditSheetOpen(false)}
          onSaved={async (newName, newImage) => {
            setData((d) =>
              d
                ? {
                    ...d,
                    user: {
                      ...d.user,
                      name: newName,
                      image: newImage ?? d.user.image,
                    },
                  }
                : d,
            );
            await AsyncStorage.removeItem(CACHE_KEY);
          }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const mainStyles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: D.space.std,
    gap: D.space.section,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: D.space.std,
    borderRadius: D.radius.lg,
    borderWidth: 1,
    padding: D.space.std,
  },
  identityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillTrack: {
    width: 44,
    height: 26,
    borderRadius: D.radius.full,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pillThumb: {
    width: 18,
    height: 18,
    borderRadius: D.radius.full,
  },
});
