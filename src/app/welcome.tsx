// src/app/welcome.tsx
import { useEffect, useState } from "react";
import { getSessionToken } from "../lib/api"; // however you expose the stored token
import { jwtDecode } from "jwt-decode";
import { WelcomeScreen } from "../screens/WelcomeScreen";

export default function WelcomePage() {
  const [firstName, setFirstName] = useState("Athlete");

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (token) {
        const payload = jwtDecode<{ name?: string }>(token);
        const first = payload.name?.split(" ")[0] ?? "Athlete";
        setFirstName(first);
      }
    })();
  }, []);

  return <WelcomeScreen firstName={firstName} />;
}
