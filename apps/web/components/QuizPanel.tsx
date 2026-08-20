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
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInitialLoading(true);
    setError("");

    getQuiz(courseId)
      .then(setQuestions)
      .catch(() => {
        setError("Could not load quiz questions.");
      })
      .finally(() => {
        setInitialLoading(false);
      });
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
      setSubmitting(true);
      setError("");

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
    } finally {
      setSubmitting(false);
    }
  }

  const question = questions[index];
  const progress =
    questions.length > 0
      ? ((index + 1) / questions.length) * 100
      : 0;

  function optionClasses(option: string) {
    if (!result) {
      return selected === option
        ? "border-white bg-zinc-800 text-white"
        : "border-zinc-800 bg-zinc-950/30 hover:border-zinc-600 hover:bg-zinc-900";
    }

    if (option === result.correct_answer) {
      return "border-emerald-700 bg-emerald-950/40 text-emerald-100";
    }

    if (
      option === selected &&
      option !== result.correct_answer
    ) {
      return "border-red-800 bg-red-950/40 text-red-100";
    }

    return "border-zinc-800 bg-zinc-950/20 text-zinc-500";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quiz</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Test your understanding of the material.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating quiz..." : "Generate Quiz"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {(initialLoading || loading) && !question && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/40">
          <div className="text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            <p className="mt-3 text-sm text-zinc-400">
              {loading
                ? "Generating your quiz..."
                : "Loading quiz..."}
            </p>
          </div>
        </div>
      )}

      {!question && !initialLoading && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 p-10 text-center">
          <p className="font-medium text-zinc-300">
            No quiz questions yet
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Generate a quiz from your uploaded material.
          </p>
        </div>
      )}

      {question && (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-400">
                Question {index + 1} of {questions.length}
              </span>
              <span className="text-zinc-600">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              {question.topic}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-500">
              Page {question.source_page}
            </span>
          </div>

          <h3 className="text-xl font-medium leading-8">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                disabled={result !== null}
                onClick={() => setSelected(option)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${optionClasses(
                  option,
                )}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold opacity-70">
                  {String.fromCharCode(65 + optionIndex)}
                </span>

                <span className="pt-0.5">{option}</span>
              </button>
            ))}
          </div>

          {!result && (
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="rounded-xl bg-white px-5 py-2.5 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? "Submitting..." : "Submit answer"}
            </button>
          )}

          {result && (
            <div
              className={`rounded-2xl border p-5 ${
                result.is_correct
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-red-900 bg-red-950/30"
              }`}
            >
              <div className="font-semibold">
                {result.is_correct ? "Correct" : "Incorrect"}
              </div>

              {!result.is_correct && (
                <div className="mt-2 text-sm text-zinc-200">
                  Correct answer:{" "}
                  <strong>{result.correct_answer}</strong>
                </div>
              )}

              <p className="mt-3 text-sm leading-6 text-zinc-300">
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
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm transition hover:bg-zinc-800"
            >
              Next question
            </button>
          )}

          {result && index === questions.length - 1 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
              Quiz complete. Open Progress to review your mastery.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
