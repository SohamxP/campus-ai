"use client";

import { useEffect, useState } from "react";
import {
  MasteryItem,
  getMastery,
} from "@/lib/api";

type Props = {
  courseId: string;
};

function masteryLabel(percentage: number) {
  if (percentage < 50) {
    return "Weak";
  }

  if (percentage < 80) {
    return "Developing";
  }

  return "Strong";
}

export default function ProgressPanel({ courseId }: Props) {
  const [mastery, setMastery] = useState<MasteryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMastery() {
    try {
      setLoading(true);
      setError("");

      const data = await getMastery(courseId);
      setMastery(data);
    } catch {
      setError("Could not load mastery data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMastery();
  }, [courseId]);

  const totalAttempts = mastery.reduce(
    (sum, item) => sum + item.attempts,
    0,
  );

  const totalCorrect = mastery.reduce(
    (sum, item) => sum + item.correct,
    0,
  );

  const overallPercentage =
    totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Progress</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Topic mastery based on your quiz performance.
          </p>
        </div>

        <button
          onClick={loadMastery}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {mastery.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Overall mastery
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {overallPercentage}%
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Questions answered
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalAttempts}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Correct answers
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {totalCorrect}
            </p>
          </div>
        </div>
      )}

      {loading && mastery.length === 0 && (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-zinc-800">
          <div className="text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            <p className="mt-3 text-sm text-zinc-400">
              Loading progress...
            </p>
          </div>
        </div>
      )}

      {!loading && mastery.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 p-10 text-center">
          <p className="font-medium text-zinc-300">
            No mastery data yet
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Answer quiz questions to build your mastery profile.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {mastery.map((item) => {
          const percentage = Math.round(
            item.mastery_score * 100,
          );

          return (
            <div
              key={item.topic}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {item.topic}
                  </div>

                  <div className="mt-1 text-xs text-zinc-500">
                    {item.correct}/{item.attempts} correct
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {percentage}%
                  </div>

                  <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                    {masteryLabel(percentage)}
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
