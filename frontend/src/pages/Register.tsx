import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { initiateGoogleLogin } from "../services/auth";

const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleGoogleAuth() {
    setGoogleLoading(true);
    setError("");
    initiateGoogleLogin();
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data?.detail === "string") {
          throw new Error(data.detail);
        }

        throw new Error("Registration failed.");
      }

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-4 py-8 text-white">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-2xl font-bold tracking-tight"
          >
            Cyber<span className="text-cyan-400">Sathi</span>
          </button>

          <p className="mt-3 text-sm text-slate-500">
            Create your security account
          </p>
        </div>

        {/* Card */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Get Started
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Create an account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Start analyzing suspicious messages, URLs and screenshots.
            </p>
          </div>

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

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-slate-300">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Enter your name"
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-300">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Create a password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />

              <p className="mt-2 text-xs text-slate-600">
                Use at least 8 characters.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-700">
          CyberSathi Security
        </p>
      </div>
    </main>
  );
}

export default Register;