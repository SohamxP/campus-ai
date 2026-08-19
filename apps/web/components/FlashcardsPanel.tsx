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
  const [error, setError] = useState("");

  useEffect(() => {
    getFlashcards(courseId)
      .then(setCards)
      .catch(() => {});
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Flashcards</h2>
          <p className="text-sm text-zinc-400">
            Review concepts generated from your course material.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate 5"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!card && !loading && (
        <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
          No flashcards yet.
        </div>
      )}

      {card && (
        <>
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center transition hover:border-zinc-700"
          >
            <span className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
              {flipped ? "Answer" : "Question"}
            </span>

            <span className="text-xl">
              {flipped ? card.back : card.front}
            </span>

            <span className="mt-6 text-xs text-zinc-500">
              Click to flip
            </span>
          </button>

          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              {card.topic} · Page {card.source_page}
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={index === 0}
                onClick={() => {
                  setIndex(index - 1);
                  setFlipped(false);
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-30"
              >
                Previous
              </button>

              <span className="text-sm text-zinc-400">
                {index + 1} / {cards.length}
              </span>

              <button
                disabled={index === cards.length - 1}
                onClick={() => {
                  setIndex(index + 1);
                  setFlipped(false);
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-30"
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
