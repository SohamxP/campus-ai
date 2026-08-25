import { supabase } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL ||
  "http://127.0.0.1:8001";

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type Course = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  created_at: string;
};

export type DocumentItem = {
  id: string;
  course_id: string;
  filename: string;
  page_count: number;
  status: string;
  created_at: string;
};

export type Source = {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number: number;
  rrf_score: number;
  reranker_score: number;
};

export async function createCourse(
  name: string,
  code: string,
): Promise<Course> {
  const headers = await authHeaders();

  const response = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      name,
      code: code || null,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create course");
  }

  return response.json();
}

export async function getCourse(
  courseId: string,
): Promise<Course> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load course");
  }

  return response.json();
}

export async function getDocuments(
  courseId: string,
): Promise<DocumentItem[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/documents`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load documents");
  }

  const data = await response.json();

  return data.documents;
}

export async function uploadDocument(
  courseId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/documents`,
    {
      method: "POST",
      headers,
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json();
}

export async function deleteDocument(
  documentId: string,
): Promise<void> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/documents/${documentId}`,
    {
      method: "DELETE",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

export async function askCampusAI(
  courseId: string,
  question: string,
): Promise<{
  question: string;
  answer: string;
  sources: Source[];
}> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/query/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        course_id: courseId,
        question,
        limit: 5,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to generate answer");
  }

  return response.json();
}

export type Flashcard = {
  id?: string;
  front: string;
  back: string;
  topic: string;
  source_page: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  explanation: string;
  topic: string;
  source_page: number;
};

export type QuizAnswerResult = {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  topic: string;
};

export type MasteryItem = {
  topic: string;
  attempts: number;
  correct: number;
  mastery_score: number;
};

export async function generateFlashcards(
  courseId: string,
  count = 5,
): Promise<Flashcard[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/flashcards/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ count }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to generate flashcards.");
  }

  const data = await response.json();
  return data.flashcards;
}

export async function getFlashcards(
  courseId: string,
): Promise<Flashcard[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/flashcards`,
    {
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load flashcards.");
  }

  const data = await response.json();
  return data.flashcards;
}

export async function generateQuiz(
  courseId: string,
  count = 5,
): Promise<QuizQuestion[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/quiz/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ count }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to generate quiz.");
  }

  const data = await response.json();
  return data.questions;
}

export async function getQuiz(
  courseId: string,
): Promise<QuizQuestion[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/quiz`,
    {
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load quiz.");
  }

  const data = await response.json();
  return data.questions;
}

export async function submitQuizAnswer(
  questionId: string,
  selectedAnswer: string,
): Promise<QuizAnswerResult> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/quiz/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        selected_answer: selectedAnswer,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to submit quiz answer.");
  }

  return response.json();
}

export async function getMastery(
  courseId: string,
): Promise<MasteryItem[]> {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_URL}/courses/${courseId}/mastery`,
    {
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load mastery data.");
  }

  const data = await response.json();
  return data.mastery;
}
