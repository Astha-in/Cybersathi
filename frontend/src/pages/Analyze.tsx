import { useState } from "react";
import {
  analyzeImage,
  analyzeText,
  type ThreatAnalysisResponse,
} from "../services/api";

type Mode = "text" | "image";

function Analyze() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [result, setResult] = useState<ThreatAnalysisResponse | null>(null);
  const [imageResult, setImageResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTextAnalysis() {
    if (!text.trim()) {
      setError("Please enter a suspicious message or URL.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await analyzeText(text.trim());
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze the message."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleImageAnalysis() {
    if (!file) {
      setError("Please select a screenshot first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setImageResult("");

      const data = await analyzeImage(file);
      setImageResult(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze the screenshot."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(selected.type)) {
      setError("Only PNG, JPEG and WEBP images are supported.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("The screenshot must be smaller than 10 MB.");
      return;
    }

    setError("");
    setImageResult("");
    setFile(selected);
  }

  function resetAnalysis() {
    setText("");
    setFile(null);
    setResult(null);
    setImageResult("");
    setError("");
  }

  function getRiskStyle(level: string) {
    switch (level.toLowerCase()) {
      case "critical":
        return {
          badge: "border-red-400/30 bg-red-500/10 text-red-300",
          icon: "bg-red-500/15 text-red-400",
          bar: "bg-red-400",
        };

      case "high":
        return {
          badge: "border-orange-400/30 bg-orange-500/10 text-orange-300",
          icon: "bg-orange-500/15 text-orange-400",
          bar: "bg-orange-400",
        };

      case "medium":
        return {
          badge: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
          icon: "bg-yellow-500/15 text-yellow-400",
          bar: "bg-yellow-400",
        };

      case "low":
        return {
          badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
          icon: "bg-emerald-500/15 text-emerald-400",
          bar: "bg-emerald-400",
        };

      default:
        return {
          badge: "border-white/10 bg-white/5 text-slate-300",
          icon: "bg-white/5 text-slate-300",
          bar: "bg-slate-400",
        };
    }
  }

  const riskStyle = result
    ? getRiskStyle(result.risk_level)
    : getRiskStyle("low");

  return (
    <main className="min-h-screen bg-[#08090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
                  Threat Intelligence
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Analyze{" "}
                <span className="text-cyan-400">Threats</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Analyze suspicious messages, URLs and screenshots using
                CyberSathi's security engine and AI reasoning.
              </p>
            </div>

            {(result || imageResult) && (
              <button
                onClick={resetAnalysis}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
              >
                + New Analysis
              </button>
            )}
          </div>
        </div>

        {/* Analyzer */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/20">

          {/* Tabs */}
          <div className="border-b border-white/10 bg-black/20 p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMode("text");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "text"
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/10"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="mr-2">⌁</span>
                Message / URL
              </button>

              <button
                onClick={() => {
                  setMode("image");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "image"
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/10"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="mr-2">▧</span>
                Screenshot
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">

            {/* Text mode */}
            {mode === "text" && (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Suspicious message or URL
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Paste an email, SMS, social message or suspicious link.
                    </p>
                  </div>

                  <span className="hidden rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 sm:block">
                    AI + Rules + RAG
                  </span>
                </div>

                <div className="relative mt-4">
                  <textarea
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      setError("");
                    }}
                    placeholder="Example: Your account will be suspended. Verify your identity immediately..."
                    className="min-h-[230px] w-full resize-y rounded-2xl border border-white/10 bg-[#05060a] p-5 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/10"
                  />

                  <div className="absolute bottom-4 right-4 rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-slate-600">
                    {text.length} characters
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-600">
                    Do not enter passwords, OTPs or other sensitive secrets.
                  </p>

                  <button
                    onClick={handleTextAnalysis}
                    disabled={loading}
                    className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Analyzing...
                      </span>
                    ) : (
                      "Analyze Threat →"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Image mode */}
            {mode === "image" && (
              <div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Analyze suspicious screenshot
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a screenshot of an email, SMS, website or social
                    media message.
                  </p>
                </div>

                <label className="mt-5 flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#05060a] px-6 text-center transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl">
                    ▧
                  </div>

                  <p className="mt-5 font-semibold text-white">
                    {file ? file.name : "Drop or choose a screenshot"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    PNG, JPEG or WEBP · Maximum 10 MB
                  </p>

                  <span className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                    Choose Image
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selectImage}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                        ✓
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setFile(null)}
                      className="ml-3 text-xs text-slate-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleImageAnalysis}
                    disabled={loading || !file}
                    className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Analyzing Screenshot..." : "Analyze Screenshot →"}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Analysis Error
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-300/70">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Text result */}
        {result && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

            {/* Result header */}
            <div className="border-b border-white/10 bg-black/20 p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                      Security Result
                    </p>
                  </div>

                  <h2 className="mt-2 text-2xl font-bold capitalize text-white">
                    {result.threat_type.replaceAll("_", " ")}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    CyberSathi threat assessment
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Risk Score
                    </p>

                    <p className="text-4xl font-bold text-white">
                      {result.risk_score}
                      <span className="text-lg text-slate-600">/100</span>
                    </p>
                  </div>

                  <span
                    className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider ${riskStyle.badge}`}
                  >
                    {result.risk_level}
                  </span>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${riskStyle.bar}`}
                  style={{
                    width: `${Math.min(Math.max(result.risk_score, 0), 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-7 p-5 sm:p-7">

              {/* Indicators */}
              {result.indicators?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      Threat Indicators
                    </h3>

                    <span className="text-xs text-slate-600">
                      {result.indicators.length} detected
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3">
                    {result.indicators.map((indicator, index) => {
                      const style = getRiskStyle(indicator.severity);

                      return (
                        <div
                          key={`${indicator.type}-${index}`}
                          className="flex gap-3 rounded-xl border border-white/5 bg-black/20 p-4"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
                          >
                            !
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <p className="text-sm leading-6 text-slate-300">
                                {indicator.description}
                              </p>

                              <span
                                className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${style.badge}`}
                              >
                                {indicator.severity}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <h3 className="font-semibold text-white">
                  Security Explanation
                </h3>

                <div className="mt-3 rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Recommended action */}
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold text-cyan-300">
                      Recommended Action
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.recommended_action}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI analysis */}
              {result.ai_analysis && (
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      AI Security Analysis
                    </h3>

                    <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                      AI
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl border border-purple-400/10 bg-purple-400/[0.03] p-5">
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                      {result.ai_analysis}
                    </p>
                  </div>
                </div>
              )}

              {/* URL results */}
              {result.url_results && result.url_results.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white">
                    URL Analysis
                  </h3>

                  <div className="mt-3 space-y-3">
                    {result.url_results.map((url, index) => {
                      const style = getRiskStyle(url.risk_level);

                      return (
                        <div
                          key={`${url.url}-${index}`}
                          className="rounded-2xl border border-white/5 bg-black/20 p-4"
                        >
                          <p className="break-all text-sm font-medium text-cyan-300">
                            {url.url}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-xs text-slate-500">
                              Risk Score:{" "}
                              <span className="font-semibold text-slate-300">
                                {url.risk_score}/100
                              </span>
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${style.badge}`}
                            >
                              {url.risk_level}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Image result */}
        {imageResult && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-purple-400/10 bg-white/[0.025]">
            <div className="border-b border-purple-400/10 bg-purple-400/[0.03] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
                  AI
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                    Multimodal Intelligence
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Screenshot Analysis
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                  {imageResult}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Bottom hint */}
        {!result && !imageResult && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Messages",
                text: "Detect phishing, scams and social engineering.",
              },
              {
                title: "URLs",
                text: "Inspect suspicious links and URL indicators.",
              },
              {
                title: "Screenshots",
                text: "Use multimodal AI to inspect visual threats.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Analyze;