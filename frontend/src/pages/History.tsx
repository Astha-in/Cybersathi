import { useEffect, useState } from "react";
import {
  getAnalysisHistory,
  type AnalysisHistoryItem,
} from "../services/api";

function History() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getAnalysisHistory();
      setAnalyses(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analysis history."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const highRiskCount = analyses.filter(
    (item) =>
      item.risk_level.toLowerCase() === "high" ||
      item.risk_level.toLowerCase() === "critical"
  ).length;

  const latestRisk = analyses[0]?.risk_score ?? 0;

  function getRiskStyle(level: string) {
    switch (level.toLowerCase()) {
      case "critical":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "high":
        return "border-orange-500/20 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "low":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      default:
        return "border-white/10 bg-white/5 text-slate-400";
    }
  }

  function getScoreStyle(level: string) {
    switch (level.toLowerCase()) {
      case "critical":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "high":
        return "border-orange-500/20 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "low":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      default:
        return "border-white/10 bg-white/5 text-slate-400";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#08090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Records
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Analysis <span className="text-cyan-400">History</span>
            </h1>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Review your previous CyberSathi security analyses.
            </p>
          </div>

          <button
            onClick={loadHistory}
            disabled={loading}
            className="w-fit rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Analyses"
            value={analyses.length}
          />

          <SummaryCard
            label="High / Critical"
            value={highRiskCount}
          />

          <SummaryCard
            label="Latest Risk"
            value={latestRisk}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.025]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
            <p className="font-medium text-red-300">
              Unable to load history
            </p>

            <p className="mt-2 text-sm text-red-300/70">
              {error}
            </p>

            <button
              onClick={loadHistory}
              className="mt-4 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && analyses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-lg font-semibold text-white">
              No analyses yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Your security analyses will appear here after you run them.
            </p>

            <button
              onClick={() => {
                window.location.href = "/analyze";
              }}
              className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Start an Analysis
            </button>
          </div>
        )}

        {/* History */}
        {!loading && !error && analyses.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Records
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Previous Security Analyses
              </h2>
            </div>

            <div className="space-y-3">
              {analyses.map((analysis) => (
                <article
                  key={analysis.id}
                  className="rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-white/10 hover:bg-white/[0.025] sm:p-5"
                >
                  <div className="flex items-center gap-4">

                    {/* Score */}
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-lg font-bold ${getScoreStyle(
                        analysis.risk_level
                      )}`}
                    >
                      {analysis.risk_score}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold capitalize text-white sm:text-base">
                        {analysis.threat_type.replaceAll("_", " ")}
                      </h3>

                      <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                        Analysis #{analysis.id}
                        {" · "}
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>

                    {/* Risk */}
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${getRiskStyle(
                        analysis.risk_level
                      )}`}
                    >
                      {analysis.risk_level}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-cyan-400">
        {value}
      </p>
    </div>
  );
}

export default History;