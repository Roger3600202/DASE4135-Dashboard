'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type AnalyzeResponse = {
  analysis?: string;
  stats?: {
    total: number;
    defectCount: number;
    defectRate: number;
    averageConfidence: number;
    recentStatuses: string[];
  };
  error?: string;
};

const initialMessage =
  'Run an AI analysis to summarize the latest inspection quality and receive three actionable suggestions.';

export default function AIInsightCard() {
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', { method: 'POST' });
      const raw = await response.text();
      let payload: AnalyzeResponse | null = null;

      if (raw) {
        try {
          payload = JSON.parse(raw) as AnalyzeResponse;
        } catch {
          // Ignore JSON parse errors; fall back to status text.
        }
      }

      if (!response.ok) {
        const reason = payload?.error || `Request failed (${response.status})`;
        throw new Error(reason);
      }

      setMessage(payload?.analysis?.trim() || 'AI did not return actionable insights.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 text-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            AI Insights
          </p>
          <p className="text-lg font-semibold text-white">Production Quality Copilot</p>
          <p className="mt-1 text-sm text-slate-400">
            Run a quick DeepSeek analysis on the latest Supabase inspection logs.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading}
          type="button"
        >
          <span className="text-lg">✨</span>
          <span>{loading ? 'AI is thinking...' : 'Generate AI Analysis'}</span>
        </button>
      </div>

      <div className="min-h-[180px] rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-200">
        {loading ? (
          <p className="animate-pulse text-slate-400">AI is reviewing the latest inspection data...</p>
        ) : error ? (
          <p className="text-rose-300">{error}</p>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-slate-200">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 pl-5 text-slate-200">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal space-y-1 pl-5 text-slate-200">{children}</ol>
                ),
                li: ({ children }) => <li className="text-slate-200">{children}</li>,
                strong: ({ children }) => <strong className="text-white">{children}</strong>,
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

