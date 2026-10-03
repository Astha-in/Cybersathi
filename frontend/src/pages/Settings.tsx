import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMe, type User } from "../services/api";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const data = await getMe();
        setUser(data);

        // Keep local user information synchronized.
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load account information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#08090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Account & Security
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            <span className="text-white">Settings</span>
          </h1>

          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Manage your CyberSathi account and security session.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
            <div className="h-52 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-semibold text-red-300">
              Unable to load account
            </p>

            <p className="mt-2 text-sm text-red-300/70">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Settings */}
        {user && !loading && !error && (
          <div className="space-y-6">

            {/* Profile */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-bold text-black shadow-lg shadow-cyan-400/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                    Profile
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>

                <div className="sm:ml-auto">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Authenticated
                  </span>
                </div>
              </div>
            </section>

            {/* Account information */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Account
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Account Information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  label="Full Name"
                  value={user.name}
                />

                <InfoCard
                  label="Email Address"
                  value={user.email}
                />

                <InfoCard
                  label="User ID"
                  value={String(user.id)}
                />

                <InfoCard
                  label="Account Status"
                  value="Active"
                />
              </div>
            </section>

            {/* Security */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Security
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Authentication & Session
                </h2>
              </div>

              <div className="space-y-3">
                <SecurityRow
                  title="Authentication"
                  description="JWT protected API session"
                  status="Active"
                />

                <SecurityRow
                  title="Password Protection"
                  description="Password is securely hashed on the backend"
                  status="Protected"
                />

                <SecurityRow
                  title="User Data Isolation"
                  description="Your analysis history is linked to your account"
                  status="Enabled"
                />
              </div>
            </section>

            {/* Logout */}
            <section className="rounded-3xl border border-red-500/10 bg-red-500/[0.025] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                    Session
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Sign out of CyberSathi
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Signing out removes your current session from this
                    browser.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function SecurityRow({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {status}
      </span>
    </div>
  );
}

export default Settings;