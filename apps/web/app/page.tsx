"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createCourse } from "@/lib/api";

const DEV_USER_ID =
  "fed62f14-4e23-4ec2-809d-c026dad4cde1";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const course = await createCourse(
        DEV_USER_ID,
        name.trim(),
        code.trim(),
      );

      router.push(`/courses/${course.id}`);
    } catch {
      setError("Could not create course.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            CampusAI
          </p>

          <h1 className="text-5xl font-semibold tracking-tight">
            Learn from your own course material.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Upload lecture material, ask questions, and get
            grounded answers with page-level sources.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-xl font-semibold">
            Create a course
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Course name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Neural Networks"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Course code
              </label>

              <input
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="CSE 4311"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create course"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
