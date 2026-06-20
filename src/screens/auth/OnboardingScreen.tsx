import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SPText } from "../../components/ui/SPText";
import { SPButton } from "../../components/ui/SPButton";
import { SPIcon, IconName } from "../../components/icons/SPIcon";
import { api, getEquipment } from "../../lib/api";
import { spring } from "../../theme";
import {
  Dumbbell,
  Flame,
  Activity,
  Shield,
  HeartPulse,
  Building2,
  PersonStanding,
  Sprout,
  TrendingUp,
  Crown,
} from "lucide-react-native";

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: "#0C0E10",
  surface: "#13171A",
  surface2: "#1A1F23",
  border: "rgba(255,255,255,0.07)",
  text: "#F0EDE4",
  muted: "#6B6B62",
  muted2: "#9A9A90",
  accent: "#C8F135",
  accentDim: "rgba(200,241,53,0.10)",
  accentBorder: "rgba(200,241,53,0.30)",
  void: "#0A0A0A",
  raised: "#1E1E1E",
  danger: "#FF4D4D",
  dangerDim: "rgba(255,77,77,0.08)",
  dangerBorder: "rgba(255,77,77,0.20)",

  // Identity colours
  rebuild: "#60A5FA", // blue
  rebuildDim: "rgba(96,165,250,0.12)",
  rebuildBorder: "rgba(96,165,250,0.30)",
  operator: "#C8F135", // accent green (existing)
  operatorDim: "rgba(200,241,53,0.10)",
  operatorBorder: "rgba(200,241,53,0.30)",
  execPerf: "#F59E0B", // amber
  execPerfDim: "rgba(245,158,11,0.12)",
  execPerfBorder: "rgba(245,158,11,0.30)",

  // 8pt grid
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s24: 24,
  s32: 32,
  s48: 48,

  // Radii
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
};

// ─── Identity config ──────────────────────────────────────────────────────────

type Identity = "REBUILD" | "OPERATOR" | "EXECUTIVE_PERFORMANCE";

const IDENTITY_CONFIG: Record<
  Identity,
  {
    label: string;
    tagline: string;
    description: string;
    icon: string;
    color: string;
    dimColor: string;
    borderColor: string;
  }
> = {
  REBUILD: {
    label: "Rebuild",
    tagline: "Start strong. Build smart.",
    description:
      "Your plan is designed to rebuild your foundation safely — lower impact, progressive loading, and full-body movements that restore strength without burning you out.",
    icon: "🔄",
    color: T.rebuild,
    dimColor: T.rebuildDim,
    borderColor: T.rebuildBorder,
  },
  OPERATOR: {
    label: "Operator",
    tagline: "Consistent. Structured. Results.",
    description:
      "You're ready for structured programming. Your plan builds strength and conditioning week over week with a clear progression path and measurable milestones.",
    icon: "⚙️",
    color: T.operator,
    dimColor: T.operatorDim,
    borderColor: T.operatorBorder,
  },
  EXECUTIVE_PERFORMANCE: {
    label: "Executive Performance",
    tagline: "High performance. No ceiling.",
    description:
      "Advanced programming built for athletes who live by structure. Expect intensity, compound movements, and a progression model that pushes your limits week after week.",
    icon: "🏆",
    color: T.execPerf,
    dimColor: T.execPerfDim,
    borderColor: T.execPerfBorder,
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answers {
  primaryGoal: string;
  trainingLocation: string;
  biologicalSex: string;
  experienceLevel: string;
  equipmentId: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
}

type StepName =
  | "goal"
  | "location"
  | "sex"
  | "hasEquipment"
  | "pickEquipment"
  | "experience"
  | "identity" // NEW
  | "confirm";

// ─── Step ordering ────────────────────────────────────────────────────────────

function buildStepList(
  trainingLocation: string,
  hasEquipment: boolean | null,
): StepName[] {
  const steps: StepName[] = ["goal", "location", "sex"];
  if (trainingLocation === "HOME") {
    steps.push("hasEquipment");
    if (hasEquipment === true) steps.push("pickEquipment");
  }
  steps.push("experience", "identity", "confirm");
  return steps;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const GOAL_LABEL: Record<string, string> = {
  LOSE_WEIGHT: "Lose Weight",
  BUILD_MUSCLE: "Build Muscle",
  GET_FIT: "Get Fit",
};
const LOCATION_LABEL: Record<string, string> = { HOME: "Home", GYM: "Gym" };
const SEX_LABEL: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  NOT_SPECIFIED: "Prefer not to say",
};
const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// ─── Header bar (back + progress) ─────────────────────────────────────────────

function HeaderBar({
  currentIndex,
  total,
  onBack,
}: {
  currentIndex: number;
  total: number;
  onBack: () => void;
}) {
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withSpring(
      ((currentIndex + 1) / total) * 100,
      spring.smooth,
    );
  }, [currentIndex, total]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%` as any,
  }));

  return (
    <View style={headerStyles.wrap}>
      <Pressable
        onPress={onBack}
        style={headerStyles.backBtn}
        hitSlop={12}
        disabled={currentIndex === 0}
      >
        {currentIndex > 0 ? (
          <SPIcon name="back" size={20} color={T.text} />
        ) : (
          <View style={{ width: 20 }} />
        )}
      </Pressable>

      <View style={headerStyles.centerCol}>
        <SPText style={headerStyles.label}>
          {currentIndex + 1} / {total}
        </SPText>
        <View style={headerStyles.track}>
          <Animated.View style={[headerStyles.fill, fillStyle]} />
        </View>
      </View>

      {/* spacer to mirror back button width */}
      <View style={{ width: 32 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: T.s16,
    paddingBottom: T.s16,
    gap: T.s12,
  },
  backBtn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCol: {
    flex: 1,
    alignItems: "center",
    gap: T.s8,
  },
  label: {
    fontFamily: "Barlow-Medium",
    fontSize: 13,
    color: T.muted2,
  },
  track: {
    width: "100%",
    height: 3,
    backgroundColor: T.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: T.accent,
    borderRadius: 2,
  },
});

// ─── Standard option card (icon + radio) ──────────────────────────────────────

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  iconName: IconName;
  lucideIcon?: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
}

function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: Option;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={aStyle}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.97, spring.snappy);
          setTimeout(() => {
            scale.value = withSpring(1, spring.snappy);
          }, 100);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[optionStyles.card, selected && optionStyles.cardSelected]}
      >
        <View
          style={[
            optionStyles.iconWrap,
            selected && optionStyles.iconWrapSelected,
          ]}
        >
          {option.lucideIcon ? (
            <option.lucideIcon
              size={20}
              color={selected ? T.accent : T.muted2}
              strokeWidth={2}
            />
          ) : (
            <SPIcon
              name={option.iconName}
              size={20}
              color={selected ? T.accent : T.muted2}
            />
          )}
        </View>
        <View style={optionStyles.textWrap}>
          <SPText style={[optionStyles.label, selected && { color: T.accent }]}>
            {option.label}
          </SPText>
          {option.sublabel ? (
            <SPText style={optionStyles.sublabel}>{option.sublabel}</SPText>
          ) : null}
        </View>
        <View
          style={[optionStyles.radio, selected && optionStyles.radioSelected]}
        >
          {selected && <View style={optionStyles.radioDot} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const optionStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.s16,
    backgroundColor: T.surface,
    borderRadius: T.r16,
    borderWidth: 1,
    borderColor: T.border,
    padding: T.s16,
  },
  cardSelected: {
    backgroundColor: T.accentDim,
    borderColor: T.accentBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: T.r12,
    backgroundColor: T.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: {
    backgroundColor: "rgba(200,241,53,0.15)",
  },
  textWrap: {
    flex: 1,
    gap: T.s4,
  },
  label: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 16,
    color: T.text,
  },
  sublabel: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: T.muted2,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: T.accent,
    backgroundColor: T.accent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.void,
  },
});

// ─── Image option card (location step) ───────────────────────────────────────

interface ImageOption {
  value: string;
  label: string;
  sublabel: string;
  iconName: IconName;
  image: ReturnType<typeof require>;
  lucideIcon?: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
}

function ImageOptionCard({
  option,
  selected,
  onPress,
}: {
  option: ImageOption;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[aStyle, imageCardStyles.outerWrap]}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.98, spring.snappy);
          setTimeout(() => {
            scale.value = withSpring(1, spring.snappy);
          }, 100);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[imageCardStyles.card, selected && imageCardStyles.cardSelected]}
      >
        <ImageBackground
          source={option.image}
          style={imageCardStyles.imageBg}
          imageStyle={imageCardStyles.imageStyle}
          resizeMode="cover"
        >
          <View style={imageCardStyles.overlay} />
          <View style={imageCardStyles.content}>
            <View
              style={[
                imageCardStyles.iconWrap,
                selected && imageCardStyles.iconWrapSelected,
              ]}
            >
              {option.lucideIcon ? (
                <option.lucideIcon
                  size={20}
                  color={selected ? T.accent : T.text}
                  strokeWidth={2}
                />
              ) : (
                <SPIcon
                  name={option.iconName}
                  size={20}
                  color={selected ? T.accent : T.text}
                />
              )}
            </View>
            <View style={imageCardStyles.textCol}>
              <SPText
                style={[imageCardStyles.label, selected && { color: T.accent }]}
              >
                {option.label}
              </SPText>
              <SPText style={imageCardStyles.sublabel}>
                {option.sublabel}
              </SPText>
            </View>
            <View
              style={[
                imageCardStyles.radio,
                selected && imageCardStyles.radioSelected,
              ]}
            >
              {selected && <View style={imageCardStyles.radioDot} />}
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
}

const imageCardStyles = StyleSheet.create({
  outerWrap: {
    borderRadius: T.r20,
    overflow: "hidden",
  },
  card: {
    borderRadius: T.r20,
    borderWidth: 1.5,
    borderColor: T.border,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: T.accentBorder,
  },
  imageBg: {
    height: 150,
  },
  imageStyle: {
    borderRadius: T.r20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,14,16,0.52)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: T.s16,
    gap: T.s12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: T.r8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: {
    backgroundColor: "rgba(200,241,53,0.22)",
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 17,
    color: T.text,
  },
  sublabel: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: "rgba(240,237,228,0.60)",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: T.accent,
    backgroundColor: T.accent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.void,
  },
});

// ─── Equipment row ────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, IconName> = {
  fullbody: "dumbbell",
  upper: "fitness",
  lower: "fitness",
  core: "target",
};

function EquipmentRow({
  item,
  selected,
  onPress,
}: {
  item: EquipmentItem;
  selected: boolean;
  onPress: () => void;
}) {
  const iconName = CATEGORY_ICON[item.category.toLowerCase()] ?? "dumbbell";
  return (
    <OptionCard
      option={{
        value: item.id,
        label: item.name,
        sublabel: `${item.category.charAt(0).toUpperCase() + item.category.slice(1)} focus`,
        iconName,
      }}
      selected={selected}
      onPress={onPress}
    />
  );
}

// ─── Summary row (confirm step) ───────────────────────────────────────────────

function SummaryRow({
  iconName,
  label,
  value,
  onEdit,
  isLast,
}: {
  iconName: IconName;
  label: string;
  value: string;
  onEdit?: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[confirmStyles.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={confirmStyles.left}>
        <View style={confirmStyles.iconWrap}>
          <SPIcon name={iconName} size={16} color={T.accent} />
        </View>
        <View style={confirmStyles.textCol}>
          <SPText style={confirmStyles.rowLabel}>{label}</SPText>
          <SPText style={confirmStyles.rowValue}>{value}</SPText>
        </View>
      </View>
      {onEdit && (
        <Pressable onPress={onEdit} hitSlop={8}>
          <SPText style={confirmStyles.editBtn}>Edit</SPText>
        </Pressable>
      )}
    </View>
  );
}

const confirmStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: T.s16,
    paddingHorizontal: T.s16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.s12,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: T.r8,
    backgroundColor: T.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 2 },
  rowLabel: {
    fontFamily: "Barlow-Regular",
    fontSize: 12,
    color: T.muted2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rowValue: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 15,
    color: T.text,
  },
  editBtn: {
    fontFamily: "Barlow-Medium",
    fontSize: 13,
    color: T.accent,
  },
});

// ─── Trial notice ─────────────────────────────────────────────────────────────

function TrialNotice({ equipmentName }: { equipmentName: string }) {
  return (
    <View style={trialStyles.wrap}>
      <View style={trialStyles.iconWrap}>
        <SPIcon name="star" size={16} color={T.accent} />
      </View>
      <View style={{ flex: 1, gap: T.s4 }}>
        <SPText style={trialStyles.heading}>14-day free trial activated</SPText>
        <SPText style={trialStyles.body}>
          You'll get full access to {equipmentName} programs for 14 days. Cancel
          or upgrade anytime.
        </SPText>
      </View>
    </View>
  );
}

const trialStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: T.s16,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: T.accentBorder,
    borderRadius: T.r16,
    padding: T.s16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: T.r8,
    backgroundColor: "rgba(200,241,53,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 14,
    color: T.accent,
  },
  body: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: T.muted2,
    lineHeight: 18,
  },
});

// ─── Step header ──────────────────────────────────────────────────────────────

function StepHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <View style={stepHeaderStyles.wrap}>
      {eyebrow ? (
        <SPText style={stepHeaderStyles.eyebrow}>{eyebrow}</SPText>
      ) : null}
      <SPText style={stepHeaderStyles.h1}>{title}</SPText>
      {subtitle ? (
        <SPText style={stepHeaderStyles.subtitle}>{subtitle}</SPText>
      ) : null}
    </View>
  );
}

const stepHeaderStyles = StyleSheet.create({
  wrap: { gap: T.s8 },
  eyebrow: {
    fontFamily: "Barlow-Medium",
    fontSize: 12,
    color: T.muted2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h1: {
    fontFamily: "Barlow-Bold",
    fontSize: 32,
    lineHeight: 38,
    color: T.text,
  },
  subtitle: {
    fontFamily: "Barlow-Regular",
    fontSize: 14,
    color: T.muted2,
    lineHeight: 20,
    marginTop: T.s4,
  },
});

// ─── Hero image block ─────────────────────────────────────────────────────────

function HeroImage({ source }: { source: ReturnType<typeof require> }) {
  return (
    <View style={heroStyles.wrap}>
      <Image source={source} style={heroStyles.image} resizeMode="cover" />
      <LinearGradient
        colors={["transparent", T.bg]}
        style={heroStyles.fade}
        pointerEvents="none"
      />
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: -T.s16,
    height: 220,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    top: "45%",
  },
});

// ─── NEW: Identity Reveal Step ────────────────────────────────────────────────
// Shown after experience level is selected and the identity API call completes.

function IdentityRevealStep({
  identity,
  loading,
  error,
  onRetry,
}: {
  identity: Identity | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const badgeScale = useSharedValue(0.7);
  const badgeOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (identity) {
      // Badge pops in first
      badgeScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      badgeOpacity.value = withTiming(1, { duration: 300 });
      // Description fades in after
      textOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [identity]);

  const badgeAnim = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));
  const textAnim = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (loading) {
    return (
      <View style={identityStyles.loadingWrap}>
        <ActivityIndicator color={T.accent} size="large" />
        <SPText style={identityStyles.loadingText}>
          Building your profile…
        </SPText>
      </View>
    );
  }

  if (error || !identity) {
    return (
      <View style={identityStyles.errorWrap}>
        <SPIcon name="warning" size={24} color={T.danger} />
        <SPText style={identityStyles.errorTitle}>Couldn't load profile</SPText>
        <SPText style={identityStyles.errorSub}>
          Check your connection and try again.
        </SPText>
        <Pressable onPress={onRetry} hitSlop={8}>
          <SPText style={identityStyles.retryText}>Retry</SPText>
        </Pressable>
      </View>
    );
  }

  const cfg = IDENTITY_CONFIG[identity];

  return (
    <View style={identityStyles.wrap}>
      <StepHeader
        eyebrow="Your training identity"
        title={"You've been\nassigned."}
      />

      {/* Animated badge */}
      <Animated.View style={[identityStyles.badgeWrap, badgeAnim]}>
        <View
          style={[
            identityStyles.badge,
            {
              backgroundColor: cfg.dimColor,
              borderColor: cfg.borderColor,
            },
          ]}
        >
          <SPText style={identityStyles.badgeIcon}>{cfg.icon}</SPText>
          <View style={identityStyles.badgeTextCol}>
            <SPText style={[identityStyles.badgeLabel, { color: cfg.color }]}>
              {cfg.label.toUpperCase()}
            </SPText>
            <SPText style={identityStyles.badgeTagline}>{cfg.tagline}</SPText>
          </View>
        </View>
      </Animated.View>

      {/* Description */}
      <Animated.View style={[identityStyles.descCard, textAnim]}>
        <SPText style={identityStyles.descText}>{cfg.description}</SPText>
      </Animated.View>

      {/* What this means bullets */}
      <Animated.View style={[{ gap: T.s12 }, textAnim]}>
        <IdentityBullet
          color={cfg.color}
          text="Programs are pre-filtered to match your identity"
        />
        <IdentityBullet
          color={cfg.color}
          text="Sets, reps and rest progress automatically each week"
        />
        <IdentityBullet
          color={cfg.color}
          text="Your identity evolves as you progress — you can always check it in Settings"
        />
      </Animated.View>
    </View>
  );
}

function IdentityBullet({ color, text }: { color: string; text: string }) {
  return (
    <View style={identityStyles.bulletRow}>
      <View style={[identityStyles.bulletDot, { backgroundColor: color }]} />
      <SPText style={identityStyles.bulletText}>{text}</SPText>
    </View>
  );
}

const identityStyles = StyleSheet.create({
  wrap: { gap: T.s24 },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: T.s48,
    gap: T.s16,
  },
  loadingText: {
    fontFamily: "Barlow-Regular",
    fontSize: 14,
    color: T.muted2,
  },
  errorWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: T.s48,
    gap: T.s12,
  },
  errorTitle: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 16,
    color: T.text,
  },
  errorSub: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: T.muted2,
    textAlign: "center",
  },
  retryText: {
    fontFamily: "Barlow-Medium",
    fontSize: 14,
    color: T.accent,
  },

  badgeWrap: { alignItems: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.s16,
    borderWidth: 1.5,
    borderRadius: T.r20,
    paddingHorizontal: T.s24,
    paddingVertical: T.s16,
    width: "100%",
  },
  badgeIcon: { fontSize: 36 },
  badgeTextCol: { flex: 1, gap: T.s4 },
  badgeLabel: {
    fontFamily: "BarlowCondensed-Bold",
    fontSize: 22,
    letterSpacing: 1.5,
  },
  badgeTagline: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: T.muted2,
  },

  descCard: {
    backgroundColor: T.surface,
    borderRadius: T.r16,
    borderWidth: 1,
    borderColor: T.border,
    padding: T.s16,
  },
  descText: {
    fontFamily: "Barlow-Regular",
    fontSize: 14,
    color: T.muted2,
    lineHeight: 22,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: T.s12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Barlow-Regular",
    fontSize: 14,
    color: T.muted2,
    lineHeight: 20,
  },
});

// ─── Main OnboardingScreen ────────────────────────────────────────────────────

export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [answers, setAnswers] = useState<Answers>({
    primaryGoal: "",
    trainingLocation: "",
    biologicalSex: "",
    experienceLevel: "",
    equipmentId: "",
  });

  const [hasEquipment, setHasEquipment] = useState<boolean | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentError, setEquipmentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Identity state (Phase 4)
  const [assignedIdentity, setAssignedIdentity] = useState<Identity | null>(
    null,
  );
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState(false);

  const stepList = buildStepList(answers.trainingLocation, hasEquipment);
  const [currentStep, setCurrentStep] = useState<StepName>("goal");

  const currentIndex = stepList.indexOf(currentStep);
  const totalSteps = stepList.length;

  const slideX = useSharedValue(0);
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  function animateToStep(direction: 1 | -1) {
    slideX.value = direction * -400;
    slideX.value = withSpring(0, spring.smooth);
  }

  function goForward() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < stepList.length) {
      animateToStep(1);
      setCurrentStep(stepList[nextIndex]);
    }
  }

  function goBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      animateToStep(-1);
      setCurrentStep(stepList[prevIndex]);
    }
  }

  function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const fetchEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    setEquipmentError(false);
    try {
      const res = await getEquipment();
      setEquipmentList(res?.equipment ?? []);
    } catch {
      setEquipmentError(true);
    } finally {
      setEquipmentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === "pickEquipment" && equipmentList.length === 0) {
      fetchEquipment();
    }
  }, [currentStep]);

  // ── Identity assignment (Phase 4) ────────────────────────────────────────────
  // Triggered when the user arrives at the identity step (i.e. just completed
  // the experience step). If assignment already succeeded, skip the API call.

  const assignIdentity = useCallback(async () => {
    if (assignedIdentity) return; // already have it
    setIdentityLoading(true);
    setIdentityError(false);
    try {
      const res = await api.post<{
        ok: boolean;
        identity: Identity;
        error?: string;
      }>("/api/training/assign-identity", {
        primaryGoal: answers.primaryGoal,
        trainingLocation: answers.trainingLocation,
        biologicalSex: answers.biologicalSex,
        experienceLevel: answers.experienceLevel,
        equipmentId: answers.equipmentId || undefined,
      });

      if (!res?.ok || !res?.identity) {
        throw new Error(res?.error ?? "Assignment failed");
      }

      setAssignedIdentity(res.identity);
      // Persist for downstream screens (Programs, Progress, etc.)
      await AsyncStorage.setItem("user_identity", res.identity);
    } catch {
      setIdentityError(true);
    } finally {
      setIdentityLoading(false);
    }
  }, [answers, assignedIdentity]);

  useEffect(() => {
    if (currentStep === "identity") {
      assignIdentity();
    }
  }, [currentStep]);

  // ── Can-advance logic ────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    switch (currentStep) {
      case "goal":
        return !!answers.primaryGoal;
      case "location":
        return !!answers.trainingLocation;
      case "sex":
        return !!answers.biologicalSex;
      case "hasEquipment":
        return hasEquipment !== null;
      case "pickEquipment":
        return !!answers.equipmentId;
      case "experience":
        return !!answers.experienceLevel;
      case "identity":
        // Must have a successful identity assignment to proceed
        return !!assignedIdentity && !identityLoading;
      case "confirm":
        return true;
      default:
        return false;
    }
  }

  function handleLocationSelect(value: string) {
    setAnswer("trainingLocation", value);
    if (value === "GYM") {
      setHasEquipment(null);
      setAnswer("equipmentId", "");
    }
  }

  function handleHasEquipmentSelect(value: boolean) {
    setHasEquipment(value);
    if (!value) setAnswer("equipmentId", "");
  }

  async function handleComplete() {
    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        primaryGoal: answers.primaryGoal,
        trainingLocation: answers.trainingLocation,
        biologicalSex: answers.biologicalSex,
        experienceLevel: answers.experienceLevel,
      };
      if (answers.equipmentId) payload.equipmentId = answers.equipmentId;

      const res = await api.post<{ ok?: boolean; error?: string }>(
        "/api/onboarding/complete",
        payload,
      );
      if (!res?.ok) throw new Error(res?.error ?? "Something went wrong");
      router.replace("/(tabs)" as any);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEquipment = equipmentList.find(
    (e) => e.id === answers.equipmentId,
  );

  // ── Confirm screen — full-bleed background image ─────────────────────────────
  if (currentStep === "confirm") {
    const identityCfg = assignedIdentity
      ? IDENTITY_CONFIG[assignedIdentity]
      : null;

    return (
      <View style={styles.fill}>
        <ImageBackground
          source={require("../../../assets/images/all_set.png")}
          style={styles.fill}
          resizeMode="cover"
        >
          <View style={styles.confirmOverlay} />
          <View
            style={[
              styles.confirmInner,
              {
                paddingTop: insets.top + T.s8,
                paddingBottom: insets.bottom + T.s24,
              },
            ]}
          >
            <HeaderBar
              currentIndex={currentIndex}
              total={totalSteps}
              onBack={goBack}
            />

            <ScrollView
              style={styles.fill}
              contentContainerStyle={styles.confirmScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.confirmTitleWrap}>
                <SPText style={confirmScreenStyles.allSet}>
                  You're all set.
                </SPText>
                <SPText style={confirmScreenStyles.profileLabel}>
                  Here's your profile.
                </SPText>
              </View>

              {/* Identity summary badge */}
              {identityCfg && (
                <View
                  style={[
                    styles.identityBadgeSummary,
                    {
                      backgroundColor: identityCfg.dimColor,
                      borderColor: identityCfg.borderColor,
                    },
                  ]}
                >
                  <SPText style={styles.identityBadgeIcon}>
                    {identityCfg.icon}
                  </SPText>
                  <View style={{ flex: 1 }}>
                    <SPText
                      style={[
                        styles.identityBadgeLabel,
                        { color: identityCfg.color },
                      ]}
                    >
                      {identityCfg.label}
                    </SPText>
                    <SPText style={styles.identityBadgeTagline}>
                      {identityCfg.tagline}
                    </SPText>
                  </View>
                </View>
              )}

              <View style={styles.summaryCard}>
                <SummaryRow
                  iconName="target"
                  label="Goal"
                  value={GOAL_LABEL[answers.primaryGoal] ?? "—"}
                  onEdit={() => {
                    animateToStep(-1);
                    setCurrentStep("goal");
                  }}
                />
                <SummaryRow
                  iconName="home"
                  label="Where you train"
                  value={LOCATION_LABEL[answers.trainingLocation] ?? "—"}
                  onEdit={() => {
                    animateToStep(-1);
                    setCurrentStep("location");
                  }}
                />
                <SummaryRow
                  iconName="person"
                  label="Biological sex"
                  value={SEX_LABEL[answers.biologicalSex] ?? "—"}
                  onEdit={() => {
                    animateToStep(-1);
                    setCurrentStep("sex");
                  }}
                />
                {answers.trainingLocation === "HOME" && (
                  <SummaryRow
                    iconName="dumbbell"
                    label="Equipment"
                    value={selectedEquipment?.name ?? "Bodyweight only"}
                    onEdit={() => {
                      animateToStep(-1);
                      setCurrentStep("hasEquipment");
                    }}
                  />
                )}
                <SummaryRow
                  iconName="chart"
                  label="Experience level"
                  value={LEVEL_LABEL[answers.experienceLevel] ?? "—"}
                  onEdit={() => {
                    animateToStep(-1);
                    setCurrentStep("experience");
                  }}
                  isLast
                />
              </View>

              {selectedEquipment && (
                <TrialNotice equipmentName={selectedEquipment.name} />
              )}

              {error ? (
                <View style={[styles.errorBox, { marginTop: T.s8 }]}>
                  <SPIcon name="warning" size={14} color={T.danger} />
                  <SPText style={styles.errorText}>{error}</SPText>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.confirmActions}>
              <SPButton
                onPress={handleComplete}
                loading={submitting}
                containerStyle={{ width: "100%" }}
              >
                Start My Plan
              </SPButton>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // ── All other steps ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.fill, { paddingTop: insets.top }]}>
      <HeaderBar
        currentIndex={currentIndex}
        total={totalSteps}
        onBack={goBack}
      />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + T.s32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[{ gap: T.s24 }, slideStyle]}>
          {/* ── STEP: Goal ──────────────────────────────────────────── */}
          {currentStep === "goal" && (
            <View style={styles.stepContent}>
              <HeroImage source={require("../../../assets/images/goal.png")} />
              <StepHeader
                title={"What's your\nmain goal?"}
                subtitle="This helps us build the right programs for you."
              />
              <View style={styles.options}>
                {(
                  [
                    {
                      value: "LOSE_WEIGHT",
                      label: "Lose Weight",
                      sublabel: "Burn fat and improve body composition",
                      iconName: "flame",
                      lucideIcon: Flame,
                    },
                    {
                      value: "BUILD_MUSCLE",
                      label: "Build Muscle",
                      sublabel: "Increase strength and muscle mass",
                      iconName: "dumbbell",
                      lucideIcon: Shield,
                    },
                    {
                      value: "GET_FIT",
                      label: "Get Fit",
                      sublabel: "Improve overall fitness and endurance",
                      iconName: "heart",
                      lucideIcon: HeartPulse,
                    },
                  ] as Option[]
                ).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={answers.primaryGoal === opt.value}
                    onPress={() => setAnswer("primaryGoal", opt.value)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── STEP: Location ──────────────────────────────────────── */}
          {currentStep === "location" && (
            <View style={styles.stepContent}>
              <StepHeader
                title={"Where do\nyou train?"}
                subtitle="We'll match plans to your setup."
              />
              <View style={styles.options}>
                <ImageOptionCard
                  option={{
                    value: "HOME",
                    label: "Home",
                    sublabel: "Bodyweight and home equipment",
                    iconName: "home",
                    image: require("../../../assets/images/home.png"),
                  }}
                  selected={answers.trainingLocation === "HOME"}
                  onPress={() => handleLocationSelect("HOME")}
                />
                <ImageOptionCard
                  option={{
                    value: "GYM",
                    label: "Gym",
                    sublabel: "Full equipment access",
                    iconName: "dumbbell",
                    lucideIcon: Building2,
                    image: require("../../../assets/images/gym.png"),
                  }}
                  selected={answers.trainingLocation === "GYM"}
                  onPress={() => handleLocationSelect("GYM")}
                />
              </View>
            </View>
          )}

          {/* ── STEP: Biological Sex ────────────────────────────────── */}
          {currentStep === "sex" && (
            <View style={styles.stepContent}>
              <StepHeader
                eyebrow="Used for training recommendations"
                title="Gender?"
              />
              <View style={styles.options}>
                {(
                  [
                    { value: "MALE", label: "Male", iconName: "person" },
                    { value: "FEMALE", label: "Female", iconName: "person" },
                    {
                      value: "NOT_SPECIFIED",
                      label: "Prefer not to say",
                      iconName: "ellipsis",
                    },
                  ] as Option[]
                ).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={answers.biologicalSex === opt.value}
                    onPress={() => setAnswer("biologicalSex", opt.value)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── STEP: Has Equipment? (HOME only) ────────────────────── */}
          {currentStep === "hasEquipment" && (
            <View style={styles.stepContent}>
              <StepHeader
                title={"Do you have\nequipment?"}
                subtitle="If you own home gym equipment you'll get a 14-day free trial to access matching programs."
              />
              <View style={styles.options}>
                <OptionCard
                  option={{
                    value: "yes",
                    label: "Yes, I have equipment",
                    sublabel: "Get a 14-day trial for equipment programs.",
                    iconName: "dumbbell",
                    lucideIcon: Dumbbell,
                  }}
                  selected={hasEquipment === true}
                  onPress={() => handleHasEquipmentSelect(true)}
                />
                <OptionCard
                  option={{
                    value: "no",
                    label: "Bodyweight only",
                    sublabel: "Free forever — no equipment needed.",
                    iconName: "fitness",
                    lucideIcon: PersonStanding,
                  }}
                  selected={hasEquipment === false}
                  onPress={() => handleHasEquipmentSelect(false)}
                />
              </View>
            </View>
          )}

          {/* ── STEP: Pick Equipment (HOME + yes) ───────────────────── */}
          {currentStep === "pickEquipment" && (
            <View style={styles.stepContent}>
              <StepHeader
                eyebrow="Select your primary equipment"
                title={"What do you\ntrain with?"}
                subtitle="Choose the main piece of equipment you use at home. You'll get a 14-day trial to unlock matching programs."
              />

              {equipmentLoading && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={T.accent} size="small" />
                  <SPText style={styles.loadingText}>Loading equipment…</SPText>
                </View>
              )}

              {equipmentError && !equipmentLoading && (
                <View style={styles.errorBox}>
                  <SPIcon name="warning" size={14} color={T.danger} />
                  <SPText style={styles.errorText}>
                    Could not load equipment.
                  </SPText>
                  <Pressable onPress={fetchEquipment} hitSlop={8}>
                    <SPText style={styles.retryText}>Retry</SPText>
                  </Pressable>
                </View>
              )}

              {!equipmentLoading && !equipmentError && (
                <View style={styles.options}>
                  {equipmentList.map((item) => (
                    <EquipmentRow
                      key={item.id}
                      item={item}
                      selected={answers.equipmentId === item.id}
                      onPress={() => setAnswer("equipmentId", item.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── STEP: Experience Level ───────────────────────────────── */}
          {currentStep === "experience" && (
            <View style={styles.stepContent}>
              <StepHeader
                eyebrow="We'll set the right intensity"
                title={"Your experience\nlevel?"}
              />
              <View style={styles.options}>
                {(
                  [
                    {
                      value: "BEGINNER",
                      label: "Beginner",
                      sublabel: "Less than 1 year of consistent training",
                      iconName: "seedling",
                      lucideIcon: Sprout,
                    },
                    {
                      value: "INTERMEDIATE",
                      label: "Intermediate",
                      sublabel: "1–3 years, comfortable with the basics",
                      iconName: "chart",
                      lucideIcon: TrendingUp,
                    },
                    {
                      value: "ADVANCED",
                      label: "Advanced",
                      sublabel: "3+ years, training is a lifestyle",
                      iconName: "trophy",
                      lucideIcon: Crown,
                    },
                  ] as Option[]
                ).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={answers.experienceLevel === opt.value}
                    onPress={() => setAnswer("experienceLevel", opt.value)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── STEP: Identity Reveal (NEW — Phase 4) ───────────────── */}
          {currentStep === "identity" && (
            <View style={styles.stepContent}>
              <IdentityRevealStep
                identity={assignedIdentity}
                loading={identityLoading}
                error={identityError}
                onRetry={assignIdentity}
              />
            </View>
          )}
        </Animated.View>

        {/* ── Continue button ───────────────────────────────────────── */}
        {currentStep !== "identity" || !identityLoading ? (
          <SPButton
            onPress={() => {
              if (canAdvance()) goForward();
            }}
            disabled={!canAdvance()}
            containerStyle={{ marginTop: T.s8 }}
          >
            {currentStep === "identity" ? "Let's go →" : "Continue"}
          </SPButton>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Confirm screen specific styles ──────────────────────────────────────────

const confirmScreenStyles = StyleSheet.create({
  allSet: {
    fontFamily: "BarlowCondensed-Bold",
    fontSize: 44,
    lineHeight: 48,
    color: T.text,
  },
  profileLabel: {
    fontFamily: "Barlow-Regular",
    fontSize: 18,
    color: T.muted2,
  },
  dashboardLink: {
    fontFamily: "Barlow-Medium",
    fontSize: 14,
    color: T.accent,
  },
});

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: T.bg,
  },

  content: {
    paddingHorizontal: T.s16,
    paddingTop: T.s8,
    gap: T.s24,
  },

  stepContent: {
    gap: T.s24,
  },

  options: {
    gap: T.s8,
  },

  // Identity badge on confirm screen
  identityBadgeSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.s12,
    borderWidth: 1,
    borderRadius: T.r16,
    padding: T.s16,
  },
  identityBadgeIcon: { fontSize: 28 },
  identityBadgeLabel: {
    fontFamily: "BarlowCondensed-Bold",
    fontSize: 18,
    letterSpacing: 1,
  },
  identityBadgeTagline: {
    fontFamily: "Barlow-Regular",
    fontSize: 12,
    color: T.muted2,
    marginTop: 2,
  },

  // Confirm
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,14,16,0.78)",
  },
  confirmInner: {
    flex: 1,
  },
  confirmScrollContent: {
    paddingHorizontal: T.s16,
    gap: T.s16,
    paddingBottom: T.s24,
  },
  confirmTitleWrap: {
    gap: T.s4,
    paddingTop: T.s8,
  },
  confirmActions: {
    paddingHorizontal: T.s16,
    paddingTop: T.s16,
    gap: T.s4,
  },
  dashboardLinkBtn: {
    alignItems: "center",
    paddingVertical: T.s12,
  },

  summaryCard: {
    backgroundColor: "rgba(19,23,26,0.92)",
    borderRadius: T.r16,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.s8,
    paddingVertical: T.s32,
  },
  loadingText: {
    fontFamily: "Barlow-Regular",
    fontSize: 13,
    color: T.muted2,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.s8,
    backgroundColor: T.dangerDim,
    borderWidth: 1,
    borderColor: T.dangerBorder,
    borderRadius: T.r12,
    padding: T.s16,
  },
  errorText: {
    fontFamily: "Barlow-Regular",
    fontSize: 12,
    color: T.danger,
    flex: 1,
  },
  retryText: {
    fontFamily: "Barlow-Medium",
    fontSize: 12,
    color: T.accent,
  },
});
