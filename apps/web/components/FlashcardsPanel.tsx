"use client";

import { useEffect, useState } from "react";
import {
  Flashcard,
  generateFlashcards,
  getFlashcards,
} from "@/lib/api";

type Props = {
  courseId: string;
};

export default function FlashcardsPanel({ courseId }: Props) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setInitialLoading(true);
    setError("");

    getFlashcards(courseId)
      .then(setCards)
      .catch(() => {
        setError("Could not load flashcards.");
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [courseId]);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const generated = await generateFlashcards(courseId, 5);
      setCards(generated);
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Flashcard generation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const card = cards[index];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Flashcards</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Review concepts generated from your course material.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating cards..." : "Generate 5"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {(initialLoading || loading) && !card && (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/50">
          <div className="text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            <p className="mt-3 text-sm text-zinc-400">
              {loading
                ? "Generating study cards..."
                : "Loading flashcards..."}
            </p>
          </div>
        </div>
      )}

      {!card && !initialLoading && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 p-10 text-center">
          <p className="font-medium text-zinc-300">
            No flashcards yet
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Generate a set from your uploaded course material.
          </p>
        </div>
      )}

      {card && (
        <>
          <div
            className="group relative min-h-72 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className={`absolute inset-0 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 text-center shadow-lg transition-all duration-300 ${
                flipped
                  ? "scale-[0.985]"
                  : "scale-100"
              } group-hover:border-zinc-700`}
            >
              <div className="mb-5 flex items-center gap-2">
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
                  {flipped ? "Answer" : "Question"}
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-500">
                  Page {card.source_page}
                </span>
              </div>

              <p className="max-w-2xl text-xl leading-8 text-zinc-100">
                {flipped ? card.back : card.front}
              </p>

              <p className="mt-6 text-xs text-zinc-600">
                Click card to flip
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="w-fit rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              {card.topic}
            </span>

            <div className="flex items-center gap-3">
              <button
                disabled={index === 0}
                onClick={() => {
                  setIndex(index - 1);
                  setFlipped(false);
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              <span className="min-w-16 text-center text-sm text-zinc-400">
                {index + 1} / {cards.length}
              </span>

              <button
                disabled={index === cards.length - 1}
                onClick={() => {
                  setIndex(index + 1);
                  setFlipped(false);
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
