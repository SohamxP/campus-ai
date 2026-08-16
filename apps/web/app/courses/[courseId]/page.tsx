"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  askCampusAI,
  Course,
  DocumentItem,
  getCourse,
  getDocuments,
  Source,
  uploadDocument,
} from "@/lib/api";

export default function CoursePage() {
  const params = useParams();

  const courseId = params.courseId as string;

  const [course, setCourse] =
    useState<Course | null>(null);

  const [documents, setDocuments] = useState<
    DocumentItem[]
  >([]);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<
    Source[]
  >([]);

  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  async function loadCourse() {
    try {
      const [courseData, documentData] =
        await Promise.all([
          getCourse(courseId),
          getDocuments(courseId),
        ]);

      setCourse(courseData);
      setDocuments(documentData);
    } catch {
      setError("Could not load course.");
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function handleUpload(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      await uploadDocument(
        courseId,
        selectedFile,
      );

      setSelectedFile(null);

      const updatedDocuments =
        await getDocuments(courseId);

      setDocuments(updatedDocuments);
    } catch {
      setError("Could not upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleQuestion(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    try {
      setAsking(true);
      setError("");
      setAnswer("");
      setSources([]);

      const response = await askCampusAI(
        courseId,
        question.trim(),
      );

      setAnswer(response.answer);
      setSources(response.sources);
    } catch {
      setError("Could not generate answer.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            CampusAI / Course
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {course?.name || "Loading..."}
          </h1>

          {course?.code && (
            <p className="mt-2 text-zinc-400">
              {course.code}
            </p>
          )}
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="font-semibold">
                Course material
              </h2>

              <form
                onSubmit={handleUpload}
                className="mt-5 space-y-4"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setSelectedFile(
                      event.target.files?.[0] ||
                        null,
                    )
                  }
                  className="block w-full text-sm text-zinc-400"
                />

                <button
                  disabled={
                    uploading || !selectedFile
                  }
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-40"
                >
                  {uploading
                    ? "Processing document..."
                    : "Upload PDF"}
                </button>
              </form>

              <div className="mt-7 space-y-3">
                {documents.length === 0 && (
                  <p className="text-sm text-zinc-500">
                    No documents uploaded yet.
                  </p>
                )}

                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <p className="truncate text-sm font-medium">
                      {document.filename}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {document.page_count} pages ·{" "}
                      {document.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">
              Ask CampusAI
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Answers are grounded in the documents
              uploaded to this course.
            </p>

            <form
              onSubmit={handleQuestion}
              className="mt-6"
            >
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Why can't gradient descent be used with the perceptron step function?"
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
              />

              <button
                disabled={asking}
                className="mt-3 rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
              >
                {asking
                  ? "Thinking..."
                  : "Ask CampusAI"}
              </button>
            </form>

            {answer && (
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <h3 className="font-semibold">
                  Answer
                </h3>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                  {answer}
                </p>

                {sources.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Sources
                    </h3>

                    <div className="mt-3 space-y-2">
                      {sources.map(
                        (source, index) => (
                          <div
                            key={
                              source.chunk_id
                            }
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                          >
                            <p className="text-sm">
                              Source{" "}
                              {index + 1}
                            </p>

                            <p className="mt-1 text-sm text-zinc-400">
                              {
                                source.filename
                              }{" "}
                              · Page{" "}
                              {
                                source.page_number
                              }
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
