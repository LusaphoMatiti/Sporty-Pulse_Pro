/**
 * useSessionTimer
 *
 * Manages the elapsed session timer using Reanimated shared values.
 * - Counts up from an optional seed (draft resume)
 * - Exposes pause / resume
 * - Returns a raw `progress` SharedValue (0 → 1 over FULL_DURATION_S)
 *   so that TimerRing can compute its own circumference from the radius
 *   it actually draws with, keeping strokeDasharray and strokeDashoffset
 *   in perfect sync regardless of screen size.
 *
 * ── Why progress instead of animatedRingProps? ──────────────────────────────
 * The old hook baked circumference = 2π × 100 into the dashOffset math, but
 * TimerRing draws the circle with a responsive radius (86 / 94 / 100 / 108).
 * They only agreed on xl phones. Exposing a unit-less 0-1 progress value lets
 * each side own its own geometry.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

const FULL_DURATION_S = 2400; // 40 min — ring is 100 % full at this point

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function useSessionTimer(seedSeconds = 0) {
  const [seconds, setSeconds] = useState(seedSeconds);
  const [paused, setPaused] = useState(false);

  // Unit-less progress: 0 (empty) → 1 (full).
  // TimerRing multiplies this by its own circumference to get strokeDashoffset.
  const progress = useSharedValue(Math.min(seedSeconds / FULL_DURATION_S, 1));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate progress whenever seconds changes
  useEffect(() => {
    progress.value = withTiming(Math.min(seconds / FULL_DURATION_S, 1), {
      duration: 900,
    });
  }, [seconds, progress]);

  // Tick — start / stop based on paused state
  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const toggle = useCallback(() => setPaused((p) => !p), []);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const mins = pad(Math.floor(seconds / 60));
  const secs = pad(seconds % 60);

  return {
    seconds,
    paused,
    toggle,
    pause,
    resume,
    mins,
    secs,
    progress, // SharedValue<number> — pass straight to TimerRing
  } as const;
}
