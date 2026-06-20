import { useCallback, useRef, useState } from "react";
import {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function useRestTimer() {
  const [resting, setResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const restDurationRef = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated arc for the rest ring (0 → 1 progress, counts down)
  const restProgress = useSharedValue(0);

  const animatedRestProps = useAnimatedProps(() => ({
    strokeDashoffset: restProgress.value,
  }));

  const startRest = useCallback(
    (duration: number) => {
      if (duration <= 0) return;

      restDurationRef.current = duration;

      // Clear any existing countdown
      if (intervalRef.current) clearInterval(intervalRef.current);

      setResting(true);
      setRestSecondsLeft(duration);

      // Animate progress from full to zero over the rest duration
      restProgress.value = 0;
      restProgress.value = withTiming(1, {
        duration: duration * 1000,
        easing: Easing.linear,
      });

      intervalRef.current = setInterval(() => {
        setRestSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setResting(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [restProgress],
  );

  const skipRest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    restProgress.value = withTiming(1, { duration: 200 });
    setResting(false);
    setRestSecondsLeft(0);
  }, [restProgress]);

  const restMins = Math.floor(restSecondsLeft / 60);
  const restSecs = restSecondsLeft % 60;
  return {
    resting,
    restSecondsLeft,
    restMins,
    restSecs,
    startRest,
    skipRest,
    animatedRestProps,
  } as const;
}
