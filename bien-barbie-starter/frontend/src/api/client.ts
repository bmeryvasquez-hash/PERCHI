const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const DEMO_TOKEN = "bb_demo_session";
const MOCK_TOKEN_PREFIX = "bb_mock_user:";
const AUTH_EVENT = "bb-auth-changed";

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getToken() {
  return localStorage.getItem("bb_token");
}

export function setToken(token: string) {
  localStorage.setItem("bb_token", token);
  notifyAuthChanged();
}

export function loginAsDemo() {
  setToken(DEMO_TOKEN);
}

export function loginAsMockUser(userId: string) {
  setToken(`${MOCK_TOKEN_PREFIX}${userId}`);
}

export function isDemoSession() {
  return getToken() === DEMO_TOKEN;
}

export function isMockSession() {
  return getToken()?.startsWith(MOCK_TOKEN_PREFIX) ?? false;
}

export function getMockSessionUserId() {
  const token = getToken();
  return token?.startsWith(MOCK_TOKEN_PREFIX) ? token.replace(MOCK_TOKEN_PREFIX, "") : null;
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function subscribeAuthChange(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function logout() {
  localStorage.removeItem("bb_token");
  notifyAuthChanged();
  window.location.href = "/";
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message ?? "Error inesperado");
  }

  return data as T;
}
