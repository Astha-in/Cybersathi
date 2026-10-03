import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User, LoginRequest, LoginResponse } from "../types/auth";
import {
  clearAuthSession,
  fetchCurrentUser,
  getStoredRefreshToken,
  getStoredToken,
  loginUser,
  logoutUser,
} from "../services/auth";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  setAuthSession: (token: string, user: User) => void;
}

// ─── Context & hook ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionCheckDone = useRef(false);

  // ── Startup: verify stored token against real backend ──────────────────────
  useEffect(() => {
    if (sessionCheckDone.current) return;
    sessionCheckDone.current = true;

    const storedToken = getStoredToken();
    const storedRefreshToken = getStoredRefreshToken();

    if (!storedToken && !storedRefreshToken) {
      setIsLoading(false);
      return;
    }

    // fetchCurrentUser calls authenticatedFetch which will automatically
    // try refreshAccessToken if it gets a 401.  We only destroy the session
    // when the backend definitively rejects the refresh token.
    fetchCurrentUser()
      .then((verifiedUser) => {
        // May have refreshed internally — re-read the token from localStorage.
        const currentToken = getStoredToken();
        setToken(currentToken);
        setUser(verifiedUser);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message.toLowerCase() : "";

        // Only wipe localStorage when the session is truly invalid.
        // Do NOT clear on transient network / server-unavailable errors.
        const isDefiniteAuthFailure =
          msg.includes("session expired") ||
          msg.includes("session has expired") ||
          msg.includes("sign in again") ||
          msg.includes("refresh token is missing");

        if (isDefiniteAuthFailure) {
          clearAuthSession();
        }

        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await loginUser(credentials);
      setToken(response.access_token);
      setUser(response.user);
      return response;
    },
    []
  );

  // ── Set OAuth / External Session ───────────────────────────────────────────
  const setAuthSession = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    logoutUser();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !isLoading && Boolean(token) && user !== null,
        login,
        logout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
