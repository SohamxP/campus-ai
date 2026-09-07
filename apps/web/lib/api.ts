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
