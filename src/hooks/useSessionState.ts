/**
 * useSessionState
 *
 * The exercise state machine for a session.
 * Handles:
 *   - currentExerciseIdx / completedSets
 *   - Set completion → rest trigger → next exercise / end
 *   - Draft persistence via api.ts (replaces Next.js fetch calls)
 *   - Weight storage via expo-secure-store (replaces localStorage)
 *   - Final session POST via completeSession()
 *
 * Dependencies injected (not imported directly) so this hook stays testable:
 *   - startRest(duration) — from useRestTimer
 *   - seconds — from useSessionTimer (snapshot at completion time)
 *   - onSessionEnd(route) — navigation callback from the screen
 */

import { useCallback, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { saveDraft, completeSession } from "../lib/api";
import type {
  ExerciseForSession,
  SessionDraft,
  SessionLog,
  SessionPhase,
} from "../types/session";

const WEIGHTS_KEY = (instanceId: string, dayNumber: number) =>
  `sp_weights_${instanceId}_${dayNumber}`;

interface UseSessionStateParams {
  instanceId: string;
  dayNumber: number;
  exercises: ExerciseForSession[];
  draft?: SessionDraft | null;
  startRest: (duration: number) => void;
  getSeconds: () => number; // snapshot — avoids stale closure on seconds
  onSessionEnd: () => void;
}

export function useSessionState({
  instanceId,
  dayNumber,
  exercises,
  draft,
  startRest,
  getSeconds,
  onSessionEnd,
}: UseSessionStateParams) {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(
    draft?.currentExerciseIdx ?? 0,
  );
  const [completedSets, setCompletedSets] = useState(draft?.completedSets ?? 0);
  const [phase, setPhase] = useState<SessionPhase>("in_progress");

  const logsRef = useRef<SessionLog[]>(draft?.logs ?? []);

  // Weights — loaded once from SecureStore, kept in ref for synchronous reads
  const weightsRef = useRef<Record<string, number>>({});

  // Load weights asynchronously on mount — best-effort, non-blocking
  const loadWeights = useCallback(async () => {
    try {
      const raw = await SecureStore.getItemAsync(
        WEIGHTS_KEY(instanceId, dayNumber),
      );
      if (raw) weightsRef.current = JSON.parse(raw) as Record<string, number>;
    } catch {
      // non-critical
    }
  }, [instanceId, dayNumber]);

  // Call this once from the screen's useEffect on mount
  const initWeights = loadWeights;

  const currentExercise = exercises[currentExerciseIdx] ?? null;
  const totalExercises = exercises.length;

  // ─── Draft ──────────────────────────────────────────────────────────────────

  const persistDraft = useCallback(
    async (overrides?: Partial<SessionDraft>) => {
      const payload: SessionDraft = {
        sessionNumber: dayNumber,
        currentExerciseIdx,
        completedSets,
        elapsedSeconds: getSeconds(),
        logs: logsRef.current,
        ...overrides,
      };
      try {
        await saveDraft(instanceId, payload);
      } catch {
        // non-critical — session state is in memory, draft is just resume support
      }
    },
    [instanceId, dayNumber, currentExerciseIdx, completedSets, getSeconds],
  );

  const clearPersistedDraft = useCallback(async () => {
    try {
      await saveDraft(instanceId, null);
    } catch {
      // non-critical
    }
  }, [instanceId]);

  // ─── End session ────────────────────────────────────────────────────────────

  const handleEndSession = useCallback(
    async (completed = false) => {
      if (phase === "ending") return;
      setPhase("ending");

      const finalLogs = [...logsRef.current];
      if (completedSets > 0 && currentExercise) {
        finalLogs.push({
          plannedExerciseId: currentExercise.id,
          actualSets: completedSets,
          actualReps: currentExercise.reps,
          weightKg: weightsRef.current[currentExercise.id] || undefined,
        });
      }

      // ── ADD THESE ──
      console.log("[handleEndSession] instanceId:", instanceId);
      console.log("[handleEndSession] dayNumber:", dayNumber);
      console.log("[handleEndSession] logs:", JSON.stringify(finalLogs));
      console.log("[handleEndSession] durationSeconds:", getSeconds());
      // ──────────────

      try {
        const result = await completeSession({
          instanceId,
          sessionNumber: dayNumber,
          durationSeconds: getSeconds(),
          completed,
          logs: finalLogs,
        });
        console.log("[handleEndSession] completeSession result:", result); // ← ADD
        await clearPersistedDraft();
      } catch (e) {
        console.error("[handleEndSession] completeSession THREW:", e); // ← ADD
      }

      try {
        await SecureStore.deleteItemAsync(WEIGHTS_KEY(instanceId, dayNumber));
      } catch {}

      onSessionEnd();
    },
    [
      phase,
      completedSets,
      currentExercise,
      instanceId,
      dayNumber,
      getSeconds,
      clearPersistedDraft,
      onSessionEnd,
    ],
  );

  // ─── Complete set (state machine core) ──────────────────────────────────────

  const handleCompleteSet = useCallback(() => {
    if (
      !currentExercise ||
      phase === "resting" ||
      phase === "paused" ||
      phase === "ending"
    )
      return;

    const newCompletedSets = completedSets + 1;

    if (newCompletedSets >= currentExercise.sets) {
      // All sets done for this exercise — log it
      logsRef.current.push({
        plannedExerciseId: currentExercise.id,
        actualSets: currentExercise.sets,
        actualReps: currentExercise.reps,
        weightKg: weightsRef.current[currentExercise.id] || undefined,
      });

      if (currentExerciseIdx + 1 < totalExercises) {
        // Advance to next exercise
        const nextIdx = currentExerciseIdx + 1;
        setCurrentExerciseIdx(nextIdx);
        setCompletedSets(0);
        setPhase("resting");
        startRest(currentExercise.restSeconds);
        persistDraft({
          currentExerciseIdx: nextIdx,
          completedSets: 0,
          logs: logsRef.current,
          elapsedSeconds: getSeconds(),
        });
      } else {
        // All exercises done — end as completed
        handleEndSession(true);
      }
    } else {
      // More sets remaining
      setCompletedSets(newCompletedSets);
      setPhase("resting");
      startRest(currentExercise.restSeconds);
      persistDraft({
        completedSets: newCompletedSets,
        logs: logsRef.current,
        elapsedSeconds: getSeconds(),
      });
    }
  }, [
    currentExercise,
    completedSets,
    currentExerciseIdx,
    totalExercises,
    phase,
    startRest,
    handleEndSession,
    persistDraft,
    getSeconds,
  ]);

  // Called by useRestTimer when rest ends — screen can also call from skipRest
  const onRestEnd = useCallback(() => {
    setPhase("in_progress");
  }, []);

  // ─── Pause / resume ──────────────────────────────────────────────────────────

  const setPaused = useCallback((value: boolean) => {
    setPhase((prev) => {
      if (value) return "paused";
      // Restore to appropriate active phase
      return prev === "paused" ? "in_progress" : prev;
    });
  }, []);

  return {
    currentExercise,
    currentExerciseIdx,
    completedSets,
    totalExercises,
    phase,
    logsRef,
    handleCompleteSet,
    handleEndSession,
    persistDraft,
    clearPersistedDraft,
    initWeights,
    onRestEnd,
    setPaused,
  } as const;
}
