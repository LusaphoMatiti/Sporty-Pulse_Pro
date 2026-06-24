import { useEffect, useState } from "react";
import { getSessionToken } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { WelcomeBackScreen } from "../screens/WelcomeBackScreen";

export default function WelcomeBackPage() {
  const [firstName, setFirstName] = useState("Athlete");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (token) {
        const payload = jwtDecode<{ name?: string; email?: string }>(token);
        setFirstName(payload.name?.split(" ")[0] ?? "Athlete");
        setEmail(payload.email ?? "");
      }
    })();
  }, []);

  return <WelcomeBackScreen firstName={firstName} email={email} />;
}
