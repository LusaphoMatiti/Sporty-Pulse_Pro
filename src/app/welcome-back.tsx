import { useLocalSearchParams } from "expo-router";
import { getSessionToken } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { WelcomeBackScreen } from "../screens/WelcomeBackScreen";
import { LoadingScreen } from "../components/ui/Loadingscreen";

let cachedIdentity: { firstName: string; email: string } | null = null;

export default function WelcomeBackPage() {
  // Google path: app/_layout.tsx already decoded firstName/email from the
  // auth deep link and passed them as params on the replace() call, so we
  // render straight away — no second loading screen.
  const params = useLocalSearchParams<{ firstName?: string; email?: string }>();

  if (params.firstName && !cachedIdentity) {
    cachedIdentity = { firstName: params.firstName, email: params.email ?? "" };
  }

  // Email/password sign-in path: LoginScreen routes here directly
  // (no deep-link hop), so there's no param yet. Only decode in that case.
  const [identity, setIdentity] = useState<{
    firstName: string;
    email: string;
  } | null>(
    params.firstName
      ? { firstName: params.firstName, email: params.email ?? "" }
      : cachedIdentity,
  );

  // Guard against React Strict Mode's double-invoked effect.
  const hasRun = useRef(false);

  useEffect(() => {
    if (params.firstName || cachedIdentity) return; // already have it
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      const token = await getSessionToken();
      if (token) {
        try {
          const payload = jwtDecode<{ name?: string; email?: string }>(token);
          setIdentity({
            firstName: payload.name?.split(" ")[0] ?? "Athlete",
            email: payload.email ?? "",
          });
          return;
        } catch {
          // fall through
        }
      }
      setIdentity({ firstName: "Athlete", email: "" });
    })();
  }, []);

  if (identity === null) {
    return <LoadingScreen />;
  }

  return (
    <WelcomeBackScreen firstName={identity.firstName} email={identity.email} />
  );
}
