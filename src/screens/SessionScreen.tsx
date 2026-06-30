import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  SkipBack,
  SkipForward,
  Check,
  Volume2,
  Maximize,
  Play,
  Pause,
  ChevronRight,
  Layers,
  Repeat,
  EyeOff,
  Eye,
  PictureInPicture2,
  X,
  Hand,
} from "lucide-react-native";

import { useAppTheme } from "../theme/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { SPText } from "../components/ui/SPText";
import { SPIcon } from "../components/icons/SPIcon";
import { fonts } from "../theme";

import { PauseExitSheet } from "../components/session/PauseExitSheet";

import { useSessionTimer } from "../hooks/useSessionTimer";
import { useRestTimer } from "../hooks/useRestTimer";
import { useSessionState } from "../hooks/useSessionState";

import type { SessionScreenProps } from "../types/session";
import type { IconName } from "../components/icons/SPIcon";

// ─── Theme ────────────────────────────────────────────────────────────────────

const { height: SCREEN_H } = Dimensions.get("window");

const darkTheme = {
  bg: "#0C0E10",
  surface: "#13171A",
  surface2: "#1A1F23",
  border: "rgba(255,255,255,0.07)",
  text: "#F0EDE4",
  muted: "#6B6B62",
  muted2: "#9A9A90",
  accent: "#C8F135",
  accentDim: "rgba(200,241,53,0.10)",
  void: "#0A0A0A",
  raised: "#1E1E1E",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressionType = "VOLUME" | "LOAD" | "DENSITY";

interface ProgressionContext {
  week: number;
  progressionType: ProgressionType;
  weeklyChange: string | null;
}

interface SessionScreenPropsWithProgression extends SessionScreenProps {
  progressionContext?: ProgressionContext | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLevel(level: string) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Video playback clock — m:ss, no leading zero on minutes (matches the
// reference design's "0:00 / 3:00" style)
function formatVideoTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${pad(secs)}`;
}

const MUSCLE_ICON_MAP: Record<string, IconName> = {
  UPPER: "muscleUpper",
  LOWER: "muscleLower",
  CORE: "muscleCore",
  FULLBODY: "muscleFullbody",
  Chest: "muscleUpper",
  Shoulders: "muscleUpper",
  Triceps: "muscleUpper",
  Biceps: "muscleUpper",
  Back: "muscleUpper",
  "Upper Back": "muscleUpper",
  "Lower Back": "muscleCore",
  Lats: "muscleUpper",
  Traps: "muscleUpper",
  Forearms: "muscleUpper",
  Quads: "muscleLower",
  Hamstrings: "muscleLower",
  Glutes: "muscleLower",
  Calves: "muscleLower",
  "Hip Flexors": "muscleLower",
  Adductors: "muscleLower",
  Abductors: "muscleLower",
  Abs: "muscleCore",
  Obliques: "muscleCore",
  Core: "muscleCore",
  "Full Body": "muscleFullbody",
  Cardio: "muscleFullbody",
};

function muscleToIcon(muscles: string[] | undefined): IconName {
  if (!muscles || muscles.length === 0) return "training";
  return MUSCLE_ICON_MAP[muscles[0]] ?? "training";
}

// ─── useFlowMode ──────────────────────────────────────────────────────────────
// Tracks inactivity and enters cinematic flow mode after timeout.
// Default: 120s (spec range 90–180s — pass timeoutMs to override).
// Any touch anywhere resets the timer and exits flow mode.

const FLOW_TIMEOUT_MS = 120_000;

function useFlowMode(timeoutMs = FLOW_TIMEOUT_MS) {
  const [isFlowMode, setIsFlowMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFlow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsFlowMode(true), timeoutMs);
  }, [timeoutMs]);

  const resetFlow = useCallback(() => {
    setIsFlowMode(false);
    scheduleFlow();
  }, [scheduleFlow]);

  useEffect(() => {
    scheduleFlow();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleFlow]);

  return { isFlowMode, resetFlow };
}

// ─── PressableScale ───────────────────────────────────────────────────────────

function PressableScale({
  onPress,
  disabled,
  style,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const spring = { damping: 18, stiffness: 260, mass: 0.8 };

  return (
    <Animated.View style={[aStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!onPress || disabled) return;
          scale.value = withSpring(0.93, spring);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring);
        }}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── ProgressHeader ───────────────────────────────────────────────────────────

function ProgressHeader({
  current,
  total,
  accentColor,
}: {
  current: number;
  total: number;
  accentColor: string;
}) {
  const progress = total > 0 ? current / total : 0;
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(progress, { duration: 400 });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%` as `${number}%`,
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.progressHeader}>
      <View style={[s.progressTrack, { backgroundColor: darkTheme.border }]}>
        <Animated.View
          style={[s.progressFill, fillStyle, { backgroundColor: accentColor }]}
        />
      </View>
      <SPText style={[s.progressCount, { color: darkTheme.muted2 }]}>
        {current} / {total}
      </SPText>
    </Animated.View>
  );
}

// ─── ExerciseHeader ───────────────────────────────────────────────────────────

function ExerciseHeader({
  level,
  focus,
  exerciseName,
  muscles,
  accentColor,
  onOpenPip,
  rs,
}: {
  level: string;
  focus: string;
  exerciseName: string;
  muscles: string[];
  accentColor: string;
  onOpenPip?: () => void;
  rs: (...args: number[]) => number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(40)}
      style={s.exerciseHeader}
    >
      <View style={s.exerciseHeaderTop}>
        <View style={{ flex: 1 }}>
          <SPText style={[s.exerciseMeta, { color: accentColor }]}>
            {level.toUpperCase()} · {focus.toUpperCase()}
          </SPText>
          <SPText
            style={[
              s.exerciseTitle,
              { color: darkTheme.text, fontSize: rs(24, 26, 30) },
            ]}
            numberOfLines={2}
          >
            {exerciseName}
          </SPText>
        </View>
        <PressableScale onPress={onOpenPip} style={s.pipButtonWrap}>
          <View
            style={[
              s.exerciseIconBox,
              {
                backgroundColor: darkTheme.surface2,
                borderColor: darkTheme.border,
              },
            ]}
          >
            <PictureInPicture2
              size={rs(20, 22)}
              color={accentColor}
              strokeWidth={1.8}
            />
          </View>
          <SPText style={[s.pipLabel, { color: darkTheme.muted }]}>PIP</SPText>
        </PressableScale>
      </View>

      {/* Muscle pills */}
      {muscles.length > 0 && (
        <View style={s.musclePillRow}>
          {muscles.slice(0, 3).map((m) => (
            <View
              key={m}
              style={[
                s.musclePill,
                {
                  backgroundColor: accentColor + "22",
                  borderColor: accentColor + "44",
                },
              ]}
            >
              <SPText style={[s.musclePillText, { color: accentColor }]}>
                {m.toUpperCase()}
              </SPText>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// ─── VideoPlayerCard ──────────────────────────────────────────────────────────

function VideoPlayerCard({
  durationSeconds = 180,
  onHideVideo,
  rs,
}: {
  durationSeconds?: number;
  onHideVideo?: () => void;
  rs: (...args: number[]) => number;
}) {
  const [playing, setPlaying] = useState(false);

  // ── Video's own playback clock — independent of the workout timer ─────────
  const [videoSeconds, setVideoSeconds] = useState(0);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    if (playing) {
      videoIntervalRef.current = setInterval(() => {
        setVideoSeconds((s) => {
          if (s + 1 >= durationSeconds) {
            if (videoIntervalRef.current)
              clearInterval(videoIntervalRef.current);
            setPlaying(false);
            return durationSeconds;
          }
          return s + 1;
        });
      }, 1000);
    }

    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [playing, durationSeconds]);

  const videoProgress =
    durationSeconds > 0 ? videoSeconds / durationSeconds : 0;
  const currentTime = formatVideoTime(videoSeconds);
  const duration = formatVideoTime(durationSeconds);

  // ── Flow-state controls: visible on tap, auto-fade after 3s ────────────────
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsOpacity = useSharedValue(1);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    controlsOpacity.value = withTiming(controlsVisible ? 1 : 0, {
      duration: 220,
    });
  }, [controlsVisible, controlsOpacity]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [scheduleHide]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const overlayPointerEvents = controlsVisible ? "auto" : "none";

  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(60)}
      style={s.videoCard}
    >
      {/* Thumbnail area — tapping anywhere brings controls back */}
      <Pressable style={s.videoThumb} onPress={showControls}>
        {/* Dark placeholder — swap for real Video component */}
        <View style={s.videoThumbInner} />

        {/* Top-right: hide video */}
        <Animated.View
          style={[s.videoTopBar, overlayStyle]}
          pointerEvents={overlayPointerEvents}
        >
          <Pressable style={s.videoMenuBtn} hitSlop={8} onPress={onHideVideo}>
            <EyeOff size={18} color="#fff" strokeWidth={2} />
          </Pressable>
        </Animated.View>

        {/* Centre play button */}
        <Animated.View
          style={overlayStyle}
          pointerEvents={overlayPointerEvents}
        >
          <PressableScale
            onPress={() => {
              setPlaying((p) => !p);
              showControls();
            }}
          >
            <View style={s.videoPlayBtn}>
              {playing ? (
                <Pause size={28} color="#fff" fill="#fff" strokeWidth={0} />
              ) : (
                <Play size={28} color="#fff" fill="#fff" strokeWidth={0} />
              )}
            </View>
          </PressableScale>
        </Animated.View>

        {/* Bottom gradient overlay — always present so the image never looks flat */}
        <View style={s.videoGradient} pointerEvents="none" />

        {/* Bottom controls */}
        <Animated.View
          style={[s.videoControls, overlayStyle]}
          pointerEvents={overlayPointerEvents}
        >
          <SPText style={s.videoTime}>{currentTime}</SPText>

          {/* Timeline */}
          <View style={s.videoTimeline}>
            <View
              style={[
                s.videoTimelineTrack,
                { backgroundColor: "rgba(255,255,255,0.25)" },
              ]}
            >
              <View
                style={[
                  s.videoTimelineFill,
                  {
                    width: `${videoProgress * 100}%` as `${number}%`,
                    backgroundColor: darkTheme.accent,
                  },
                ]}
              />
              {/* Scrubber dot */}
              <View
                style={[
                  s.videoScrubber,
                  {
                    left: `${videoProgress * 100}%` as `${number}%`,
                    backgroundColor: darkTheme.accent,
                  },
                ]}
              />
            </View>
          </View>

          <SPText style={s.videoTime}>{duration}</SPText>

          <Pressable hitSlop={8}>
            <Volume2
              size={16}
              color="rgba(255,255,255,0.8)"
              strokeWidth={1.8}
            />
          </Pressable>

          <Pressable hitSlop={8}>
            <Maximize
              size={16}
              color="rgba(255,255,255,0.8)"
              strokeWidth={1.8}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── VideoHiddenCard ──────────────────────────────────────────────────────────
// Replaces the video area when the user hides it — never an empty container.

function VideoHiddenCard({
  workoutTime,
  completedSets,
  totalSets,
  nextExerciseName,
  accentColor,
  onShowVideo,
  rs,
}: {
  workoutTime: string;
  completedSets: number;
  totalSets: number;
  nextExerciseName?: string | null;
  accentColor: string;
  onShowVideo?: () => void;
  rs: (...args: number[]) => number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[
        s.hiddenCard,
        { backgroundColor: darkTheme.surface, borderColor: darkTheme.border },
      ]}
    >
      <View style={s.hiddenStatsRow}>
        <View style={s.hiddenStatItem}>
          <SPText
            style={[
              s.metricValue,
              { color: darkTheme.text, fontSize: rs(22, 24) },
            ]}
          >
            {workoutTime}
          </SPText>
          <SPText style={[s.metricLabel, { color: darkTheme.muted }]}>
            TIME
          </SPText>
        </View>
        <View
          style={[s.metricDivider, { backgroundColor: darkTheme.border }]}
        />
        <View style={s.hiddenStatItem}>
          <SPText
            style={[
              s.metricValue,
              { color: darkTheme.text, fontSize: rs(22, 24) },
            ]}
          >
            {completedSets} / {totalSets}
          </SPText>
          <SPText style={[s.metricLabel, { color: darkTheme.muted }]}>
            SETS
          </SPText>
        </View>
      </View>

      {nextExerciseName ? (
        <View style={s.hiddenUpNextRow}>
          <SPText style={[s.upNextLabel, { color: darkTheme.muted2 }]}>
            UP NEXT
          </SPText>
          <SPText
            style={[s.hiddenUpNextName, { color: darkTheme.text }]}
            numberOfLines={1}
          >
            {nextExerciseName}
          </SPText>
        </View>
      ) : null}

      <PressableScale onPress={onShowVideo} style={s.showVideoBtn}>
        <Eye size={16} color={accentColor} strokeWidth={1.8} />
        <SPText style={[s.showVideoLabel, { color: accentColor }]}>
          SHOW VIDEO
        </SPText>
      </PressableScale>
    </Animated.View>
  );
}

// ─── PipOverlay ───────────────────────────────────────────────────────────────
// In-app floating mini-player (top-right). Note: this simulates PiP within the
// app's own screen — true OS-level PiP (floating over other apps) requires a
// native module and isn't achievable in pure Expo/RN.

function PipOverlay({
  visible,
  paused,
  exerciseName,
  onTogglePause,
  onClose,
  onExpand,
}: {
  visible: boolean;
  paused: boolean;
  exerciseName: string;
  onTogglePause: () => void;
  onClose: () => void;
  onExpand: () => void;
}) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        s.pipOverlay,
        { backgroundColor: darkTheme.raised, borderColor: darkTheme.border },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onExpand}>
        <View style={s.pipThumb} />
      </Pressable>

      <Pressable style={s.pipCloseBtn} onPress={onClose} hitSlop={8}>
        <X size={14} color="#fff" strokeWidth={2.4} />
      </Pressable>

      <View style={s.pipFooter} pointerEvents="box-none">
        <SPText style={s.pipName} numberOfLines={1}>
          {exerciseName}
        </SPText>
        <View style={s.pipControls}>
          <Pressable onPress={onTogglePause} hitSlop={6}>
            {paused ? (
              <Play size={16} color="#fff" fill="#fff" strokeWidth={0} />
            ) : (
              <Pause size={16} color="#fff" fill="#fff" strokeWidth={0} />
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── FlowModeOverlay ──────────────────────────────────────────────────────────
// Full-screen cinematic "flow mode" shown after inactivity.
// Renders outside SafeAreaView so the video fills edge-to-edge.
// All transitions: 250ms fade in / 200ms fade out.

function FlowModeOverlay({
  visible,
  current,
  total,
  level,
  focus,
  exerciseName,
  workoutTime,
  accentColor,
  onTap,
  onPip,
  onHideVideo,
}: {
  visible: boolean;
  current: number;
  total: number;
  level: string;
  focus: string;
  exerciseName: string;
  workoutTime: string;
  accentColor: string;
  onTap: () => void;
  onPip: () => void;
  onHideVideo: () => void;
}) {
  const insets = useSafeAreaInsets();

  // ── Overlay fade ──────────────────────────────────────────────────────────
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 250 : 200,
    });
  }, [visible]);
  const overlayAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // ── Progress fill ─────────────────────────────────────────────────────────
  const progress = total > 0 ? current / total : 0;
  const fillW = useSharedValue(progress);
  useEffect(() => {
    fillW.value = withTiming(progress, { duration: 500 });
  }, [progress]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillW.value * 100}%` as `${number}%`,
  }));

  // ── Pulsing active dot ────────────────────────────────────────────────────
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!visible) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1100 }),
        withTiming(1, { duration: 1100 }),
      ),
      -1,
      false,
    );
  }, [visible]);
  const dotAnim = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, fm.overlay, overlayAnim]}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* ── Full-screen tap detector (renders first = below content in z-order) */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onTap} />

      {/* ── Layout — rendered after Pressable so it's on top in z-order ──── */}
      <View
        style={[
          fm.overlayContent,
          {
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Progress bar + step count */}
        <View style={[fm.progressRow, { paddingHorizontal: 16 }]}>
          <View
            style={[
              fm.progressTrack,
              { backgroundColor: "rgba(255,255,255,0.07)" },
            ]}
          >
            <Animated.View
              style={[
                fm.progressFill,
                fillStyle,
                { backgroundColor: accentColor },
              ]}
            />
          </View>
          <SPText style={[fm.progressCount, { color: darkTheme.muted2 }]}>
            {current} / {total}
          </SPText>
        </View>

        {/* Exercise identity */}
        <View
          style={[fm.identity, { paddingHorizontal: 16 }]}
          pointerEvents="box-none"
        >
          <View style={{ flex: 1 }}>
            <SPText style={[fm.exerciseMeta, { color: accentColor }]}>
              {level.toUpperCase()} · {focus.toUpperCase()}
            </SPText>
            <SPText style={[fm.exerciseTitle, { color: darkTheme.text }]}>
              {exerciseName}
            </SPText>
          </View>

          {/* PiP button — identical to normal screen */}
          <PressableScale onPress={onPip} style={s.pipButtonWrap}>
            <View
              style={[
                s.exerciseIconBox,
                {
                  backgroundColor: darkTheme.surface2,
                  borderColor: darkTheme.border,
                },
              ]}
            >
              <PictureInPicture2
                size={22}
                color={accentColor}
                strokeWidth={1.8}
              />
            </View>
            <SPText style={[s.pipLabel, { color: darkTheme.muted }]}>
              PIP
            </SPText>
          </PressableScale>
        </View>

        {/* Cinematic video area — fills remaining height */}
        <View style={fm.videoWrap} pointerEvents="box-none">
          {/* Video placeholder (swap with expo-av Video component) */}
          <View style={[fm.videoFill, { backgroundColor: "#090b0c" }]}>
            {/* Bottom vignette — no LinearGradient dep */}
            <View style={fm.videoVignette} />
          </View>

          {/* Hide-video button — top right of the video */}
          <PressableScale onPress={onHideVideo} style={fm.eyeBtn}>
            <View style={fm.eyeBtnInner}>
              <EyeOff size={18} color={darkTheme.muted2} strokeWidth={1.8} />
            </View>
          </PressableScale>
        </View>

        {/* Bottom floating HUD + tap hint */}
        <View style={fm.bottomArea} pointerEvents="box-none">
          {/* Glass pill */}
          <View
            style={[
              fm.hudPill,
              {
                backgroundColor: "rgba(19,23,26,0.80)",
                borderColor: "rgba(255,255,255,0.06)",
              },
            ]}
          >
            <SPText
              style={[fm.hudLabel, { color: darkTheme.muted2 }]}
              numberOfLines={1}
            >
              {exerciseName.toUpperCase()}
            </SPText>
            <View
              style={[
                fm.hudDivider,
                { backgroundColor: "rgba(255,255,255,0.13)" },
              ]}
            />
            <SPText style={[fm.hudTime, { color: darkTheme.text }]}>
              {workoutTime}
            </SPText>
            <Animated.View
              style={[fm.hudDot, { backgroundColor: accentColor }, dotAnim]}
            />
          </View>

          {/* Tap hint */}
          <View style={fm.tapRow}>
            <Hand size={15} color={darkTheme.muted} strokeWidth={1.5} />
            <SPText style={[fm.tapHint, { color: darkTheme.muted }]}>
              Tap anywhere to show controls
            </SPText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── MetricsCard ─────────────────────────────────────────────────────────────

function MetricsCard({
  totalReps,
  completedSets,
  totalSets,
  accentColor,
  rs,
}: {
  totalReps: number | string;
  completedSets: number;
  totalSets: number;
  accentColor: string;
  rs: (...args: number[]) => number;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(260).delay(80)}>
      <View
        style={[
          s.metricsCard,
          { backgroundColor: darkTheme.surface, borderColor: darkTheme.border },
        ]}
      >
        {/* REPS */}
        <View style={s.metricItem}>
          <View style={s.metricIconRow}>
            <Repeat
              size={rs(14, 16)}
              color={darkTheme.muted2}
              strokeWidth={1.8}
            />
          </View>
          <SPText
            style={[
              s.metricValue,
              { color: darkTheme.text, fontSize: rs(26, 28) },
            ]}
          >
            {totalReps}
          </SPText>
          <SPText style={[s.metricLabel, { color: darkTheme.muted }]}>
            REPS
          </SPText>
        </View>

        <View
          style={[s.metricDivider, { backgroundColor: darkTheme.border }]}
        />

        {/* SETS */}
        <View style={s.metricItem}>
          <View style={s.metricIconRow}>
            <Layers size={rs(14, 16)} color={accentColor} strokeWidth={1.8} />
          </View>
          <SPText
            style={[
              s.metricValue,
              { color: darkTheme.text, fontSize: rs(26, 28) },
            ]}
          >
            {completedSets} / {totalSets}
          </SPText>
          <SPText style={[s.metricLabel, { color: darkTheme.muted }]}>
            SETS
          </SPText>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── UpNextCard ───────────────────────────────────────────────────────────────

function UpNextCard({
  exerciseName,
  equipment,
  accentColor,
  rs,
}: {
  exerciseName: string;
  equipment?: string;
  accentColor: string;
  rs: (...args: number[]) => number;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(260).delay(100)}>
      <View
        style={[
          s.upNextCard,
          { backgroundColor: darkTheme.surface, borderColor: darkTheme.border },
        ]}
      >
        {/* Thumbnail */}
        <View style={[s.upNextThumb, { backgroundColor: darkTheme.raised }]} />

        {/* Info */}
        <View style={s.upNextInfo}>
          <SPText style={[s.upNextLabel, { color: darkTheme.muted2 }]}>
            UP NEXT
          </SPText>
          <SPText
            style={[
              s.upNextName,
              { color: darkTheme.text, fontSize: rs(17, 19) },
            ]}
            numberOfLines={1}
          >
            {exerciseName}
          </SPText>
          {equipment && (
            <SPText style={[s.upNextEquipment, { color: darkTheme.muted }]}>
              {equipment}
            </SPText>
          )}
          <View style={[s.upNextAccent, { backgroundColor: accentColor }]} />
        </View>

        {/* Arrow */}
        <ChevronRight size={20} color={darkTheme.muted2} strokeWidth={1.8} />
      </View>
    </Animated.View>
  );
}

// ─── ActionControls ───────────────────────────────────────────────────────────

function ActionControls({
  onBack,
  onComplete,
  onNext,
  disabled,
  accentColor,
  phase,
  resting,
  rs,
}: {
  onBack?: () => void;
  onComplete?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  accentColor: string;
  phase: string;
  resting: boolean;
  rs: (...args: number[]) => number;
}) {
  const completeIcon =
    phase === "paused" ? (
      <Play size={rs(26, 28)} color="#000" fill="#000" strokeWidth={0} />
    ) : resting ? (
      <SkipForward size={rs(26, 28)} color="#000" fill="#000" strokeWidth={0} />
    ) : (
      <Check size={rs(26, 28)} color="#000" strokeWidth={2.5} />
    );

  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(140)}
      style={[s.actionControls, { borderTopColor: darkTheme.border }]}
    >
      {/* Back */}
      <PressableScale onPress={onBack} style={s.actionSideBtn}>
        <View
          style={[
            s.actionSecBtn,
            {
              backgroundColor: darkTheme.surface2,
              borderColor: darkTheme.border,
            },
          ]}
        >
          <SkipBack
            size={rs(18, 20)}
            color={darkTheme.text}
            strokeWidth={1.8}
          />
        </View>
        <SPText style={[s.actionBtnLabel, { color: darkTheme.muted }]}>
          BACK
        </SPText>
      </PressableScale>

      {/* Complete */}
      <View style={s.actionCenter}>
        <PressableScale onPress={onComplete} disabled={disabled}>
          <View style={[s.actionPrimaryBtn, { backgroundColor: accentColor }]}>
            {completeIcon}
          </View>
        </PressableScale>
        <SPText
          style={[
            s.actionBtnLabel,
            { color: darkTheme.text, fontFamily: fonts.brandBold },
          ]}
        >
          COMPLETE
        </SPText>
      </View>

      {/* Next */}
      <PressableScale onPress={onNext} style={s.actionSideBtn}>
        <View
          style={[
            s.actionSecBtn,
            {
              backgroundColor: darkTheme.surface2,
              borderColor: darkTheme.border,
            },
          ]}
        >
          <SkipForward
            size={rs(18, 20)}
            color={darkTheme.text}
            strokeWidth={1.8}
          />
        </View>
        <SPText style={[s.actionBtnLabel, { color: darkTheme.muted }]}>
          NEXT
        </SPText>
      </PressableScale>
    </Animated.View>
  );
}

// ─── WorkoutFooter ────────────────────────────────────────────────────────────

function WorkoutFooter({
  workoutTime,
  restTime,
  resting,
  phase,
  accentColor,
  onPauseResume,
  onEnd,
  rs,
}: {
  workoutTime: string;
  restTime: string;
  resting: boolean;
  phase: string;
  accentColor: string;
  onPauseResume: () => void;
  onEnd: () => void;
  rs: (...args: number[]) => number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(180)}
      style={[
        s.footer,
        { borderTopColor: darkTheme.border, backgroundColor: darkTheme.bg },
      ]}
    >
      {/* Workout timer */}
      <View style={s.footerTimer}>
        <SPText
          style={[
            s.footerTimerValue,
            { color: darkTheme.text, fontSize: rs(22, 24) },
          ]}
        >
          {workoutTime}
        </SPText>
        <SPText style={[s.footerTimerLabel, { color: darkTheme.muted }]}>
          WORKOUT
        </SPText>
      </View>

      {/* Pause / End */}
      <View style={s.footerCenter}>
        <Pressable onPress={onPauseResume} style={s.footerAction}>
          {phase === "paused" ? (
            <Play
              size={12}
              color={darkTheme.muted2}
              fill={darkTheme.muted2}
              strokeWidth={0}
            />
          ) : (
            <View style={s.pauseIconRow}>
              <View
                style={[s.pauseBar, { backgroundColor: darkTheme.muted2 }]}
              />
              <View
                style={[s.pauseBar, { backgroundColor: darkTheme.muted2 }]}
              />
            </View>
          )}
          <SPText style={[s.footerActionLabel, { color: darkTheme.muted2 }]}>
            {phase === "paused" ? "RESUME" : "PAUSE"}
          </SPText>
        </Pressable>

        <Pressable onPress={onEnd} style={s.footerAction}>
          <View style={[s.stopIcon, { borderColor: "#ef4444" }]} />
          <SPText style={[s.footerActionLabel, { color: "#ef4444" }]}>
            END
          </SPText>
        </Pressable>
      </View>

      {/* Rest timer */}
      <View style={[s.footerTimer, { alignItems: "flex-end" }]}>
        <SPText
          style={[
            s.footerTimerValue,
            {
              color: resting ? accentColor : darkTheme.text,
              fontSize: rs(22, 24),
            },
          ]}
        >
          {restTime}
        </SPText>
        <SPText style={[s.footerTimerLabel, { color: darkTheme.muted }]}>
          REST
        </SPText>
      </View>
    </Animated.View>
  );
}

// ─── SessionScreen ────────────────────────────────────────────────────────────

export default function SessionScreen({
  instanceId,
  dayNumber,
  planName,
  focus,
  level,
  muscleGroup,
  exercises,
  draft,
  progressionContext,
}: SessionScreenPropsWithProgression) {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  const { rs } = useResponsive();

  const levelLabel = formatLevel(level);
  const accentColor = isDark ? darkTheme.accent : "#5C8A00";

  // ─── Exercise navigation ──────────────────────────────────────────────────

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const total = exercises.length;
  const currentExView = exercises[currentExIdx] ?? null;
  const nextExView = exercises[currentExIdx + 1] ?? null;

  // ─── Video hide / PiP state ────────────────────────────────────────────────

  const [videoHidden, setVideoHidden] = useState(false);
  const [pipActive, setPipActive] = useState(false);

  // ─── Flow / hide mode ─────────────────────────────────────────────────────
  // Activates after FLOW_TIMEOUT_MS of no interaction. Any touch resets.

  const { isFlowMode, resetFlow } = useFlowMode();

  // ─── Session hooks ────────────────────────────────────────────────────────

  const timer = useSessionTimer(draft?.elapsedSeconds ?? 0);
  const restTimer = useRestTimer();

  const secondsRef = useRef(timer.seconds);
  useEffect(() => {
    secondsRef.current = timer.seconds;
  }, [timer.seconds]);
  const getSeconds = useCallback(() => secondsRef.current, []);

  const onSessionEnd = useCallback(() => {
    router.replace("/(tabs)/training");
  }, [router]);

  const session = useSessionState({
    instanceId,
    dayNumber,
    exercises,
    draft,
    startRest: restTimer.startRest,
    getSeconds,
    onSessionEnd,
  });

  useEffect(() => {
    session.initWeights();
  }, [instanceId]);

  useEffect(() => {
    if (!restTimer.resting && session.phase === "resting") {
      session.onRestEnd();
    }
  }, [restTimer.resting, session.phase, session.onRestEnd]);

  useEffect(() => {
    if (
      session.currentExerciseIdx !== undefined &&
      session.currentExerciseIdx !== currentExIdx
    ) {
      setCurrentExIdx(session.currentExerciseIdx);
    }
  }, [session.currentExerciseIdx]);

  // ─── Pause / exit ──────────────────────────────────────────────────────────

  const showSheet = session.phase === "paused";

  const handleOpenSheet = useCallback(() => {
    timer.pause();
    session.setPaused(true);
  }, [timer, session]);

  const handleResume = useCallback(() => {
    session.setPaused(false);
    timer.resume();
  }, [timer, session]);

  const handleSaveDraftAndLeave = useCallback(async () => {
    await session.persistDraft();
    router.replace("/(tabs)/training");
  }, [session, router]);

  const handleEndAndSave = useCallback(() => {
    session.handleEndSession(false);
  }, [session]);

  // ─── Derived display values ────────────────────────────────────────────────

  const workoutTime = `${timer.mins}:${timer.secs}`;
  const restTime = restTimer.resting
    ? `${pad(restTimer.restMins)}:${pad(restTimer.restSecs)}`
    : "00:00";

  const completedSetsForCurrent = session.completedSets ?? 0;
  const totalSetsForCurrent =
    session.currentExercise?.sets ?? currentExView?.sets ?? 0;
  const totalRepsForCurrent =
    session.currentExercise?.reps ?? currentExView?.reps ?? 0;

  const currentMuscles: string[] = currentExView?.exercise.musclesWorked ?? [
    muscleGroup,
  ];

  const completeHandler =
    session.phase === "paused"
      ? handleResume
      : restTimer.resting
        ? restTimer.skipRest
        : session.currentExercise
          ? session.handleCompleteSet
          : undefined;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    // Outer wrapper — full screen, sits outside SafeAreaView so FlowModeOverlay
    // can cover the entire display including safe-area insets.
    <View
      style={[s.rootWrap, { backgroundColor: darkTheme.bg }]}
      // Capture-phase touch handler: resets idle timer WITHOUT consuming events.
      // Children still receive and handle their own touches normally.
      onStartShouldSetResponderCapture={() => {
        resetFlow();
        return false;
      }}
    >
      <SafeAreaView
        style={[s.safe, { backgroundColor: darkTheme.bg }]}
        edges={["top", "bottom"]}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[
            s.content,
            { paddingHorizontal: rs(16, 20, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1 — Progress Header */}
          <ProgressHeader
            current={currentExIdx + 1}
            total={total}
            accentColor={accentColor}
          />

          {/* 2 — Exercise Header */}
          {currentExView && (
            <ExerciseHeader
              level={levelLabel}
              focus={focus}
              exerciseName={currentExView.exercise.name}
              muscles={currentMuscles}
              accentColor={accentColor}
              onOpenPip={() => setPipActive(true)}
              rs={rs}
            />
          )}

          {/* 3 — Video Player (or compact summary when hidden) */}
          {videoHidden ? (
            <VideoHiddenCard
              workoutTime={workoutTime}
              completedSets={completedSetsForCurrent}
              totalSets={totalSetsForCurrent}
              nextExerciseName={nextExView?.exercise.name ?? null}
              accentColor={accentColor}
              onShowVideo={() => setVideoHidden(false)}
              rs={rs}
            />
          ) : (
            <VideoPlayerCard onHideVideo={() => setVideoHidden(true)} rs={rs} />
          )}

          {/* 4 — Metrics */}
          <MetricsCard
            totalReps={totalRepsForCurrent}
            completedSets={completedSetsForCurrent}
            totalSets={totalSetsForCurrent}
            accentColor={accentColor}
            rs={rs}
          />

          {/* 5 — Up Next */}
          {nextExView && (
            <UpNextCard
              exerciseName={nextExView.exercise.name}
              equipment={nextExView.exercise.equipment?.name ?? undefined}
              accentColor={accentColor}
              rs={rs}
            />
          )}

          {/* 6 — Action Controls */}
          <ActionControls
            onBack={() => setCurrentExIdx((i) => Math.max(0, i - 1))}
            onComplete={completeHandler}
            onNext={() => setCurrentExIdx((i) => Math.min(total - 1, i + 1))}
            disabled={session.phase === "ending"}
            accentColor={accentColor}
            phase={session.phase}
            resting={restTimer.resting}
            rs={rs}
          />

          {/* 7 — Workout Footer */}
          <WorkoutFooter
            workoutTime={workoutTime}
            restTime={restTime}
            resting={restTimer.resting}
            phase={session.phase}
            accentColor={accentColor}
            onPauseResume={handleOpenSheet}
            onEnd={() => session.handleEndSession(false)}
            rs={rs}
          />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Floating mini-player (in-app PiP) */}
        <PipOverlay
          visible={pipActive}
          paused={session.phase === "paused"}
          exerciseName={currentExView?.exercise.name ?? ""}
          onTogglePause={() => {
            if (session.phase === "paused") {
              handleResume();
            } else {
              handleOpenSheet();
            }
          }}
          onClose={() => setPipActive(false)}
          onExpand={() => setPipActive(false)}
        />

        {/* Pause / Exit Sheet */}
        {showSheet && (
          <PauseExitSheet
            visible={showSheet}
            onResume={handleResume}
            onSaveDraftAndLeave={handleSaveDraftAndLeave}
            onEndAndSave={handleEndAndSave}
          />
        )}
      </SafeAreaView>

      {/* ── Flow / Hide Mode Overlay ─────────────────────────────────────────
          Renders outside SafeAreaView so video fills edge-to-edge.
          zIndex 90 sits above PipOverlay (zIndex 200 handles PiP separately).
          Tap anywhere to exit; PiP/Hide buttons intercept their own presses. */}
      <FlowModeOverlay
        visible={isFlowMode && !showSheet}
        current={currentExIdx + 1}
        total={total}
        level={levelLabel}
        focus={focus}
        exerciseName={currentExView?.exercise.name ?? ""}
        workoutTime={workoutTime}
        accentColor={accentColor}
        onTap={resetFlow}
        onPip={() => {
          setPipActive(true);
          resetFlow();
        }}
        onHideVideo={() => {
          setVideoHidden(true);
          resetFlow();
        }}
      />
    </View>
  );
}

// Styles

const s = StyleSheet.create({
  rootWrap: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingTop: 16,
    gap: 14,
    paddingBottom: 32,
  },

  // ── Progress Header ──
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressCount: {
    fontSize: 13,
    fontFamily: fonts.brandMedium,
    letterSpacing: 0.4,
    minWidth: 32,
    textAlign: "right",
  },

  // ── Exercise Header ──
  exerciseHeader: {
    gap: 12,
  },
  exerciseHeaderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  exerciseMeta: {
    fontSize: 11,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  exerciseTitle: {
    fontFamily: fonts.brandBold,
    lineHeight: 32,
  },
  exerciseIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  pipButtonWrap: {
    alignItems: "center",
    gap: 6,
  },
  pipLabel: {
    fontSize: 9,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
  },
  musclePillRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  musclePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  musclePillText: {
    fontSize: 9,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 0.8,
  },

  // ── Video Card ──
  videoCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0d0d0d",
  },
  videoThumb: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  videoThumbInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111416",
  },
  videoTopBar: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  videoMenuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  videoControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  videoTime: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: fonts.brandMedium,
  },
  videoTimeline: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  videoTimelineTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "visible",
    position: "relative",
  },
  videoTimelineFill: {
    height: "100%",
    borderRadius: 2,
  },
  videoScrubber: {
    position: "absolute",
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    marginLeft: -6,
  },

  // ── Hidden Video (compact summary) ──
  hiddenCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  hiddenStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hiddenStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  hiddenUpNextRow: {
    gap: 3,
  },
  hiddenUpNextName: {
    fontFamily: fonts.brandBold,
    fontSize: 16,
  },
  showVideoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  showVideoLabel: {
    fontSize: 12,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1,
  },

  // ── PiP floating mini-player ──
  pipOverlay: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 220,
    height: 148,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 200,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 24,
  },
  pipThumb: {
    flex: 1,
    backgroundColor: "#15181a",
  },
  pipCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.62)",
    alignItems: "center",
    justifyContent: "center",
  },
  pipFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "rgba(0,0,0,0.60)",
    gap: 8,
  },
  pipName: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.brandMedium,
  },
  pipControls: {
    flexDirection: "row",
    gap: 8,
  },

  // ── Metrics Card ──
  metricsCard: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    gap: 4,
  },
  metricIconRow: {
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: fonts.brandBold,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
  },
  metricDivider: {
    width: 1,
    marginVertical: 16,
  },

  // ── Up Next ──
  upNextCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingRight: 16,
    gap: 0,
  },
  upNextThumb: {
    width: 110,
    height: 90,
  },
  upNextInfo: {
    flex: 1,
    paddingLeft: 16,
    paddingVertical: 16,
    gap: 3,
  },
  upNextLabel: {
    fontSize: 10,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
  },
  upNextName: {
    fontFamily: fonts.brandBold,
    lineHeight: 24,
  },
  upNextEquipment: {
    fontSize: 13,
    fontFamily: fonts.brandMedium,
  },
  upNextAccent: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },

  // ── Action Controls ──
  actionControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  actionSideBtn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  actionSecBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCenter: {
    alignItems: "center",
    gap: 8,
  },
  actionPrimaryBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnLabel: {
    fontSize: 10,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 6,
    borderTopWidth: 1,
  },
  footerTimer: {
    alignItems: "flex-start",
    gap: 4,
    flex: 1,
  },
  footerTimerValue: {
    fontFamily: fonts.brandBold,
    letterSpacing: -0.5,
  },
  footerTimerLabel: {
    fontSize: 9,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.2,
  },
  footerCenter: {
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerActionLabel: {
    fontSize: 12,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 0.8,
  },
  pauseIconRow: {
    flexDirection: "row",
    gap: 3,
  },
  pauseBar: {
    width: 3,
    height: 12,
    borderRadius: 2,
  },
  stopIcon: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 2,
  },
});

// ─── Flow Mode Stylesheet ─────────────────────────────────────────────────────

const fm = StyleSheet.create({
  // Full-screen dark overlay
  overlay: {
    zIndex: 90,
    backgroundColor: darkTheme.bg,
  },
  // Absolute fill that holds the layout — sits on top of the Pressable tap catcher
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },

  // ── Progress bar ──
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: fonts.brandMedium,
    letterSpacing: 0.4,
    minWidth: 30,
    textAlign: "right",
  },

  // ── Exercise identity ──
  identity: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  exerciseMeta: {
    fontSize: 11,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  exerciseTitle: {
    fontFamily: fonts.brandBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },

  // ── Video fill — cinematic, edge-to-edge ──
  videoWrap: {
    flex: 1,
    position: "relative",
    marginBottom: 20,
    // No horizontal margin: video goes edge-to-edge
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: "hidden",
  },
  // Simulate bottom gradient without LinearGradient dep
  videoVignette: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.40)",
  },

  // Eye-off button — floats top-right of video
  eyeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  eyeBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Bottom HUD ──
  bottomArea: {
    alignItems: "center",
    gap: 14,
  },

  // Glass pill — width ~180-220px, height 56px
  hudPill: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    gap: 12,
    // maxWidth keeps it compact at ~pill spec
    maxWidth: 230,
    // backdrop blur is only achievable with BlurView — fallback is semi-opaque bg
  },
  hudLabel: {
    fontSize: 10,
    fontFamily: fonts.brandSemiBold,
    letterSpacing: 0.9,
    // truncate long exercise names gracefully
    flex: 1,
    flexShrink: 1,
  },
  hudDivider: {
    width: 1,
    height: 18,
  },
  hudTime: {
    fontFamily: fonts.brandBold,
    fontSize: 18,
    letterSpacing: -0.5,
  },
  // Tiny pulsing circle — accent active indicator
  hudDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // ── Tap hint ──
  tapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tapHint: {
    fontSize: 13,
    fontFamily: fonts.brandMedium,
    letterSpacing: 0.1,
  },
});
