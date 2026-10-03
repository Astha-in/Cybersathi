import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initiateGoogleLogin } from "../../services/auth";
import type { LoginRequest } from "../../types/auth";

interface LoginFormProps {
  onLoginSuccess: (name: string) => void;
}

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  function handleGoogleAuth() {
    setGoogleLoading(true);
    setError("");
    initiateGoogleLogin();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Prevent multiple submissions while a request is in flight
    if (loading || googleLoading) {
      return;
    }

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const credentials: LoginRequest = {
      email: trimmedEmail,
      password,
    };

    try {
      setLoading(true);

      const result = await login(credentials);

      onLoginSuccess(result.user.name);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-form-wrapper">
      {/* Continue with Google */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading || googleLoading}
        className="google-login-btn"
        aria-label="Continue with Google"
      >
        {googleLoading ? (
          <>
            <span className="button-spinner" />
            Connecting to Google...
          </>
        ) : (
          <>
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="login-divider">
        <span>or continue with email</span>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading || googleLoading}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <div className="password-label-row">
            <label htmlFor="password">Password</label>
            <span>Secure authentication</span>
          </div>

          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading || googleLoading}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <div className="login-error" role="alert">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="login-submit"
          disabled={loading || googleLoading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />
              Authenticating...
            </>
          ) : (
            <>
              Sign in with Email
              <span>→</span>
            </>
          )}
        </button>

        <div className="login-security">
          <span className="security-icon">✓</span>

          <div>
            <strong>Protected connection</strong>
            <p>Your credentials are securely processed by CyberSathi.</p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;