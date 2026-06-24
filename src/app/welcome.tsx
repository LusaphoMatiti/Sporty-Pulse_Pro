import { useLocalSearchParams } from "expo-router";
import { getSessionToken } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoadingScreen } from "../components/ui/Loadingscreen";

let cachedWelcomeName: string | null = null;

export default function WelcomePage() {
  // Google path: auth.tsx already decoded the name and passed it as a
  // param, so we render straight away — no second loading screen.
  const params = useLocalSearchParams<{ firstName?: string }>();

  if (params.firstName && !cachedWelcomeName) {
    cachedWelcomeName = params.firstName;
  }

  // Email/password registration path: RegisterScreen routes here directly
  // (no auth.tsx hop), so there's no param yet. Only decode in that case.
  const [decodedName, setDecodedName] = useState<string | null>(
    params.firstName ?? cachedWelcomeName ?? null,
  );

  // Guard against React Strict Mode's double-invoked effect — without
  // this, the decode runs twice and can trigger two state updates /
  // renders in a row.
  const hasRun = useRef(false);

  useEffect(() => {
    if (params.firstName || cachedWelcomeName) return; // already have it
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      const token = await getSessionToken();
      if (token) {
        try {
          const payload = jwtDecode<{ name?: string }>(token);
          setDecodedName(payload.name?.split(" ")[0] ?? "Athlete");
          return;
        } catch {
          // fall through
        }
      }
      setDecodedName("Athlete");
    })();
  }, []);

  if (decodedName === null) {
    return <LoadingScreen />;
  }

  return <WelcomeScreen firstName={decodedName} />;
}
