import { useEffect, useState } from "react";
import { getSessionToken } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoadingScreen } from "../components/ui/Loadingscreen";

export default function WelcomePage() {
  // null = "still resolving the name" — we never want to paint "Athlete"
  // and then swap it out, so we don't render WelcomeScreen until we know.
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (token) {
        try {
          const payload = jwtDecode<{ name?: string }>(token);
          setFirstName(payload.name?.split(" ")[0] ?? "Athlete");
          return;
        } catch {
          // fall through to default below
        }
      }
      setFirstName("Athlete");
    })();
  }, []);

  if (firstName === null) {
    return <LoadingScreen />;
  }

  return <WelcomeScreen firstName={firstName} />;
}
