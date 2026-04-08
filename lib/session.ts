export interface Session {
  email: string;
  method: string;
  loggedAt: string;
  ip: string;
  device: string;
}

export const MOCK_IP = "192.168.1.42";
export const MOCK_DEVICE = "Chrome / Windows 11";

// Client-side simulation helpers (keeping for UI state if needed, but primary is cookie)
export const setSession = (session: Session) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("auth_session", JSON.stringify(session));
  }
};

export const getSession = (): Session | null => {
  if (typeof window !== "undefined") {
    const s = sessionStorage.getItem("auth_session");
    return s ? JSON.parse(s) : null;
  }
  return null;
};

export const clearSession = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_session");
  }
};
