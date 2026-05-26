function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

  if (typeof window === "undefined") return configuredUrl;

  const hostname = window.location.hostname;
  const isLocalBrowser = hostname === "localhost" || hostname === "127.0.0.1";

  if (!isLocalBrowser && configuredUrl.includes("localhost")) {
    return configuredUrl.replace("localhost", hostname);
  }

  return configuredUrl;
}

const API_URL = resolveApiUrl();
const DEMO_TOKEN = "perchi_demo_session";
const MOCK_TOKEN_PREFIX = "perchi_mock_user:";
const AUTH_EVENT = "perchi-auth-changed";

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getToken() {
  return localStorage.getItem("perchi_token");
}

export function setToken(token: string) {
  localStorage.setItem("perchi_token", token);
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
  localStorage.removeItem("perchi_token");
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

export async function uploadImageDataUrl(dataUrl: string) {
  const data = await api<{ imageUrl: string }>("/uploads/images", {
    method: "POST",
    body: JSON.stringify({ dataUrl })
  });

  return data.imageUrl;
}
