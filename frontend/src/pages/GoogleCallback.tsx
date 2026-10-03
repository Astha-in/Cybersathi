import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { handleGoogleAuthTokens } from "../services/auth";
import type { User } from "../types/auth";

function GoogleCallback() {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 1. Check URL hash fragment first (#access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);

      // 2. Check query params as fallback (?error=...)
      const queryParams = new URLSearchParams(window.location.search);

      const urlError =
        queryParams.get("error") || hashParams.get("error");

      if (urlError) {
        setError(urlError);
        navigate(`/login?error=${encodeURIComponent(urlError)}`, {
          replace: true,
        });
        return;
      }

      const accessToken =
        hashParams.get("access_token") || queryParams.get("access_token");
      const refreshToken =
        hashParams.get("refresh_token") || queryParams.get("refresh_token");
      const idStr = hashParams.get("id") || queryParams.get("id");
      const name = hashParams.get("name") || queryParams.get("name") || "User";
      const email = hashParams.get("email") || queryParams.get("email") || "";

      if (!accessToken || !refreshToken) {
        const msg = "Invalid authentication response from Google login.";
        setError(msg);
        navigate(`/login?error=${encodeURIComponent(msg)}`, {
          replace: true,
        });
        return;
      }

      const user: User = {
        id: idStr ? parseInt(idStr, 10) : 0,
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        auth_provider: "google",
      };

      // Store in centralized localStorage helpers
      handleGoogleAuthTokens(accessToken, refreshToken, user);

      // Hydrate React Auth Context immediately
      setAuthSession(accessToken, user);

      // Clean up URL fragment from browser history and redirect to Dashboard
      navigate("/dashboard", { replace: true });
    } catch {
      const msg = "Failed to complete Google authentication.";
      setError(msg);
      navigate(`/login?error=${encodeURIComponent(msg)}`, {
        replace: true,
      });
    }
  }, [navigate, setAuthSession]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center shadow-2xl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="text-sm font-medium text-slate-300">
          {error ? error : "Authenticating with Google..."}
        </p>
      </div>
    </div>
  );
}

export default GoogleCallback;
