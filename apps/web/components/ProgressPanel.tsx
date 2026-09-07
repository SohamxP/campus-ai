"use client";

import { useEffect, useState } from "react";
import {
  MasteryItem,
  getMastery,
} from "@/lib/api";

type Props = {
  courseId: string;
};

export default function ProgressPanel({ courseId }: Props) {
  const [mastery, setMastery] = useState<MasteryItem[]>([]);

  async function loadMastery() {
    const data = await getMastery(courseId);
    setMastery(data);
  }

  useEffect(() => {
    loadMastery().catch(() => {});
  }, [courseId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Progress</h2>
          <p className="text-sm text-zinc-400">
            Topic mastery based on your quiz performance.
          </p>
        </div>

        <button
          onClick={() => loadMastery()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
        >
          Refresh
        </button>
      </div>

      {mastery.length === 0 && (
        <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
          Answer quiz questions to build your mastery profile.
        </div>
      )}

      <div className="space-y-5">
        {mastery.map((item) => {
          const percentage = Math.round(
            item.mastery_score * 100,
          );

          return (
            <div
              key={item.topic}
              className="rounded-xl border border-zinc-800 p-5"
            >
              <div className="mb-3 flex justify-between">
                <div>
                  <div className="font-medium">
                    {item.topic}
                  </div>

                  <div className="text-xs text-zinc-500">
                    {item.correct}/{item.attempts} correct
                  </div>
                </div>

                <div className="font-semibold">
                  {percentage}%
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white transition-all"
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
