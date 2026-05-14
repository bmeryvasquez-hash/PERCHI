import { useEffect, useState } from "react";
import { getMockSessionUserId, isLoggedIn, isMockSession, subscribeAuthChange } from "../api/client";

export function useAuthState() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [mockUserId, setMockUserId] = useState<string | null>(isMockSession() ? getMockSessionUserId() : null);

  useEffect(() => {
    function sync() {
      setLoggedIn(isLoggedIn());
      setMockUserId(isMockSession() ? getMockSessionUserId() : null);
    }

    sync();
    return subscribeAuthChange(sync);
  }, []);

  return { isLoggedIn: loggedIn, mockUserId };
}
