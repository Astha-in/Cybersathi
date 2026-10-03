import { useEffect, useMemo, useState } from "react";
import {
  getDashboardStats,
  type DashboardStats,
} from "../services/api";
import RecentActivity from "../components/dashboard/RecentActivity";

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load security statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const totalThreats = useMemo(() => {
    if (!stats) return 0;

    return (
      stats.medium_risk +
      stats.high_risk +
      stats.critical_risk
    );
  }, [stats]);

  const protectionPercentage = useMemo(() => {
    if (!stats || stats.total_analyses === 0) return 100;

    const safe = stats.low_risk;

    return Math.round(
      (safe / stats.total_analyses) * 100
    );
  }, [stats]);

  return (
    <main className="min-h-screen bg-[#08090d] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Security Command Center
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Cyber<span className="text-cyan-400">Sathi</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Monitor threats, analyze suspicious content, and
              keep your digital activity safer with AI-powered
              security analysis.
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className="w-fit rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-400 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-semibold text-red-300">
              Unable to load security statistics
            </p>

            <p className="mt-2 text-sm text-red-300/70">
              {error}
            </p>

            <button
              onClick={loadStats}
              className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />

              <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
            </div>
          </div>
        )}

        {/* Dashboard */}
        {stats && !loading && (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Total Analyses"
                value={stats.total_analyses}
                subtitle="Security checks"
                icon="◈"
                valueClass="text-cyan-400"
              />

              <StatCard
                title="Low Risk"
                value={stats.low_risk}
                subtitle="Safe findings"
                icon="✓"
                valueClass="text-emerald-400"
              />

              <StatCard
                title="Medium Risk"
                value={stats.medium_risk}
                subtitle="Needs review"
                icon="!"
                valueClass="text-yellow-400"
              />

              <StatCard
                title="High Risk"
                value={stats.high_risk}
                subtitle="Potential threats"
                icon="⚠"
                valueClass="text-orange-400"
              />

              <StatCard
                title="Critical"
                value={stats.critical_risk}
                subtitle="Immediate attention"
                icon="!"
                valueClass="text-red-400"
              />
            </div>

            {/* Main overview */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

              {/* Threat distribution */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                      Security Overview
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Threat Distribution
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Current distribution of analyzed security events.
                    </p>
                  </div>

                  <div className="hidden rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-3 sm:block">
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-cyan-400">
                      {stats.total_analyses}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <RiskRow
                    label="Low Risk"
                    value={stats.low_risk}
                    total={stats.total_analyses}
                    bar="bg-emerald-400"
                    text="text-emerald-400"
                  />

                  <RiskRow
                    label="Medium Risk"
                    value={stats.medium_risk}
                    total={stats.total_analyses}
                    bar="bg-yellow-400"
                    text="text-yellow-400"
                  />

                  <RiskRow
                    label="High Risk"
                    value={stats.high_risk}
                    total={stats.total_analyses}
                    bar="bg-orange-400"
                    text="text-orange-400"
                  />

                  <RiskRow
                    label="Critical Risk"
                    value={stats.critical_risk}
                    total={stats.total_analyses}
                    bar="bg-red-500"
                    text="text-red-400"
                  />
                </div>
              </section>

              {/* Quick action */}
              <section className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.04] to-transparent p-5 sm:p-7">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative flex h-full flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-400">
                    ⌁
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                    Quick Action
                  </p>

                  <h2 className="mt-3 text-2xl font-bold leading-tight">
                    Analyze something suspicious
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    Check a suspicious message, URL, email,
                    or screenshot using CyberSathi's security
                    analysis engine.
                  </p>

                  <div className="mt-auto pt-8">
                    <button
                      onClick={() => {
                        window.location.href = "/analyze";
                      }}
                      className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20"
                    >
                      Start Analysis →
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Security status */}
            <section className="mt-6 grid gap-4 sm:grid-cols-3">

              <StatusCard
                label="Security Checks"
                value={String(stats.total_analyses)}
                description="Total analyses performed"
                icon="◈"
              />

              <StatusCard
                label="Threats Detected"
                value={String(totalThreats)}
                description="Medium, high and critical findings"
                icon="⚠"
              />

              <StatusCard
                label="Low-Risk Share"
                value={`${protectionPercentage}%`}
                description="Share classified as low risk"
                icon="✓"
              />
            </section>

            {/* Recent activity */}
            <div className="mt-6">
              <RecentActivity />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  valueClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-sm text-slate-500 transition group-hover:text-cyan-400">
          {icon}
        </span>
      </div>

      <p
        className={`mt-5 text-3xl font-bold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {subtitle}
      </p>
    </div>
  );
}

function RiskRow({
  label,
  value,
  total,
  bar,
  text,
}: {
  label: string;
  value: number;
  total: number;
  bar: string;
  text: string;
}) {
  const percentage =
    total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${bar}`}
          />

          <span className="text-sm text-slate-300">
            {label}
          </span>
        </div>

        <span className={`text-sm font-semibold ${text}`}>
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-[11px] text-slate-600">
        {Math.round(percentage)}%
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold text-white">
          {value}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;