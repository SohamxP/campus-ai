const API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL ||
  "http://127.0.0.1:8001";

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
  userId: string,
  name: string,
  code: string,
): Promise<Course> {
  const response = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}`,
    {
      cache: "no-store",
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/documents`,
    {
      cache: "no-store",
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

  const response = await fetch(
    `${API_URL}/courses/${courseId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json();
}

export async function askCampusAI(
  courseId: string,
  question: string,
): Promise<{
  question: string;
  answer: string;
  sources: Source[];
}> {
  const response = await fetch(
    `${API_URL}/query/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/flashcards/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/flashcards`,
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/quiz/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/quiz`,
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
  const response = await fetch(
    `${API_URL}/quiz/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const response = await fetch(
    `${API_URL}/courses/${courseId}/mastery`,
  );

  if (!response.ok) {
    throw new Error("Failed to load mastery data.");
  }

  const data = await response.json();
  return data.mastery;
}
