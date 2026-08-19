"use client";

import { useEffect, useState } from "react";
import {
  QuizAnswerResult,
  QuizQuestion,
  generateQuiz,
  getQuiz,
  submitQuizAnswer,
} from "@/lib/api";

type Props = {
  courseId: string;
};

export default function QuizPanel({ courseId }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] =
    useState<QuizAnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getQuiz(courseId)
      .then(setQuestions)
      .catch(() => {});
  }, [courseId]);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const data = await generateQuiz(courseId, 5);
      setQuestions(data);
      setIndex(0);
      setSelected("");
      setResult(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Quiz generation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const question = questions[index];

    if (!question || !selected) {
      return;
    }

    try {
      const answerResult = await submitQuizAnswer(
        question.id,
        selected,
      );

      setResult(answerResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Answer submission failed.",
      );
    }
  }

  const question = questions[index];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quiz</h2>
          <p className="text-sm text-zinc-400">
            Test your understanding of the material.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!question && !loading && (
        <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
          No quiz questions yet.
        </div>
      )}

      {question && (
        <div className="space-y-5">
          <div className="text-sm text-zinc-500">
            Question {index + 1} of {questions.length}
          </div>

          <h3 className="text-lg font-medium">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                disabled={result !== null}
                onClick={() => setSelected(option)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selected === option
                    ? "border-white bg-zinc-800"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {!result && (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="rounded-lg bg-white px-5 py-2.5 font-medium text-black disabled:opacity-30"
            >
              Submit answer
            </button>
          )}

          {result && (
            <div
              className={`rounded-xl border p-5 ${
                result.is_correct
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-red-900 bg-red-950/30"
              }`}
            >
              <div className="font-semibold">
                {result.is_correct ? "Correct" : "Incorrect"}
              </div>

              {!result.is_correct && (
                <div className="mt-2 text-sm">
                  Correct answer:{" "}
                  <strong>{result.correct_answer}</strong>
                </div>
              )}

              <p className="mt-3 text-sm text-zinc-300">
                {result.explanation}
              </p>
            </div>
          )}

          {result && index < questions.length - 1 && (
            <button
              onClick={() => {
                setIndex(index + 1);
                setSelected("");
                setResult(null);
              }}
              className="rounded-lg border border-zinc-700 px-5 py-2.5"
            >
              Next question
            </button>
          )}

          <div className="text-xs text-zinc-500">
            {question.topic} · Page {question.source_page}
          </div>
        </div>
      )}
    </div>
  );
}
