import { useEffect, useState } from "react";
import {
  getAnalysisHistory,
  type AnalysisHistoryItem,
} from "../../services/api";

function RecentActivity() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getAnalysisHistory();

        setAnalyses(data.slice(0, 5));
      } catch (err) {
        console.error(err);
        setError("Unable to load recent activity.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  function getRiskStyle(level: string) {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 text-red-400 border-red-500/20";

      case "high":
        return "bg-orange-500/15 text-orange-400 border-orange-500/20";

      case "medium":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";

      case "low":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";

      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Activity
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Recent Security Analysis
          </h2>
        </div>

        <button
          onClick={() => {
            window.location.href = "/history";
          }}
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          View all →
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-white/[0.04]"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && analyses.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <p className="text-slate-400">
            No security analyses yet.
          </p>

          <button
            onClick={() => {
              window.location.href = "/analyze";
            }}
            className="mt-4 text-sm font-medium text-cyan-400"
          >
            Start your first analysis →
          </button>
        </div>
      )}

      {!loading && !error && analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${getRiskStyle(
                    analysis.risk_level
                  )}`}
                >
                  {analysis.risk_score}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {analysis.threat_type.replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(analysis.created_at)}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getRiskStyle(
                  analysis.risk_level
                )}`}
              >
                {analysis.risk_level}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;