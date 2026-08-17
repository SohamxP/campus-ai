import json
from typing import Any

import httpx
from pydantic import BaseModel, Field, ValidationError

from app.core_config import settings


class Flashcard(BaseModel):
    front: str
    back: str
    topic: str
    source_page: int


class FlashcardResponse(BaseModel):
    flashcards: list[Flashcard]


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    explanation: str
    topic: str
    source_page: int


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


def _build_context(chunks: list[dict]) -> str:
    parts = []

    for chunk in chunks:
        parts.append(
            f"""[Page {chunk["page_number"]}]
{chunk["content"]}"""
        )

    return "\n\n".join(parts)


def _ollama_generate(prompt: str) -> dict[str, Any]:
    last_raw_response = None

    for attempt in range(1, 4):
        retry_instruction = ""

        if attempt > 1:
            retry_instruction = """
IMPORTANT:
Your previous response was invalid or empty.
Return the complete requested JSON object.
Do NOT return {}.
Do NOT omit the required array.
"""

        response = httpx.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt + "\n\n" + retry_instruction,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.1,
                    "num_predict": 2048,
                },
            },
            timeout=180.0,
        )

        response.raise_for_status()

        raw_response = response.json()["response"]
        last_raw_response = raw_response

        print(
            f"OLLAMA RAW RESPONSE attempt {attempt}:",
            raw_response,
        )

        try:
            data = json.loads(raw_response)
        except json.JSONDecodeError:
            continue

        if isinstance(data, dict) and len(data) > 0:
            return data

    raise ValueError(
        f"Ollama failed to return usable JSON after 3 attempts. "
        f"Last response: {last_raw_response}"
    )


def _extract_flashcards(data: dict[str, Any]) -> list[dict]:
    if "flashcards" in data:
        candidate = data["flashcards"]

    elif "cards" in data:
        candidate = data["cards"]

    elif "questions" in data:
        candidate = data["questions"]

    elif isinstance(data.get("data"), list):
        candidate = data["data"]

    else:
        raise ValueError(
            f"Unexpected flashcard response structure. Keys: {list(data.keys())}"
        )

    try:
        validated = FlashcardResponse(
            flashcards=candidate
        )

        return [
            card.model_dump()
            for card in validated.flashcards
        ]

    except ValidationError as exc:
        raise ValueError(
            f"Invalid flashcard data returned by Ollama: {candidate}"
        ) from exc


def _extract_quiz(data: dict[str, Any]) -> list[dict]:
    if "questions" in data:
        candidate = data["questions"]
    elif "quiz" in data:
        candidate = data["quiz"]
    elif isinstance(data.get("data"), list):
        candidate = data["data"]
    else:
        raise ValueError(
            f"Unexpected quiz response structure. Keys: {list(data.keys())}"
        )

    try:
        validated = QuizResponse(
            questions=candidate
        )
    except ValidationError as exc:
        raise ValueError(
            f"Invalid quiz data returned by Ollama: {candidate}"
        ) from exc

    cleaned = []

    for question in validated.questions:
        options = [
            option.strip()
            for option in question.options
        ]

        if len(set(options)) != 4:
            raise ValueError(
                f"Quiz question contains duplicate options: "
                f"{question.question}"
            )

        if question.correct_answer.strip() not in options:
            raise ValueError(
                f"Correct answer does not match an option: "
                f"{question.question}"
            )

        cleaned.append({
            **question.model_dump(),
            "options": options,
            "correct_answer": question.correct_answer.strip(),
        })

    return cleaned




def generate_flashcards(
    chunks: list[dict],
    count: int = 8,
) -> list[dict]:
    context = _build_context(chunks)

    prompt = f"""
You are CampusAI.

Generate exactly {count} study flashcards using ONLY the course material below.

Return ONLY JSON.

Required format:

{{
  "flashcards": [
    {{
      "front": "Question",
      "back": "Answer",
      "topic": "Short topic name",
      "source_page": 1
    }}
  ]
}}

Requirements:
- Exactly {count} flashcards.
- Use only supplied course material.
- Every source_page must correspond to the material provided.
- Keep answers concise and educational.
- Do not include markdown.
- Do not include commentary outside the JSON.

COURSE MATERIAL:

{context}
""".strip()

    data = _ollama_generate(prompt)

    flashcards = _extract_flashcards(data)

    return flashcards[:count]


def generate_quiz(
    chunks: list[dict],
    count: int = 5,
) -> list[dict]:
    questions = []

    useful_chunks = [
        chunk
        for chunk in chunks
        if len(chunk.get("content", "").strip()) > 80
    ]

    if not useful_chunks:
        raise ValueError("No usable course material found.")

    chunk_index = 0
    attempts = 0
    max_attempts = count * 4

    while len(questions) < count and attempts < max_attempts:
        attempts += 1

        chunk = useful_chunks[
            chunk_index % len(useful_chunks)
        ]
        chunk_index += 1

        source_page = chunk["page_number"]
        source_text = chunk["content"]

        prompt = f"""
You are CampusAI.

Create EXACTLY ONE multiple-choice question using ONLY the
course material below.

SOURCE PAGE: {source_page}

COURSE MATERIAL:
{source_text}

Return ONLY valid JSON in this exact structure:

{{
  "questions": [
    {{
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_answer": "Exact text of one option",
      "explanation": "Short explanation supported by the source",
      "topic": "Short topic name",
      "source_page": {source_page}
    }}
  ]
}}

Requirements:
- Return exactly one question.
- Exactly four DISTINCT options.
- Only one option may be correct.
- correct_answer must exactly match one option.
- Do not duplicate or paraphrase the correct answer as another option.
- Preserve equations exactly as written in the supplied material.
- Do not invent formulas.
- Do not invent facts.
- The source_page must be {source_page}.
- Avoid vague questions.
- STRONGLY prefer conceptual questions over equation transcription.
- Prefer definitions, relationships, purposes, limitations, and conceptual reasoning.
- Avoid numerical calculation questions unless the source text is completely clear.
- Avoid equation questions when mathematical notation appears corrupted.
- If symbols such as $, %, #, or unusual characters appear inside an equation,
  do NOT create a question about that equation.
- Do not reconstruct or guess damaged mathematical notation.
- Do not ask for raw derivative values unless the source is completely clear.
- Avoid questions where all four choices are equations unless the
  source clearly supports four distinct alternatives.
- Return JSON only.
""".strip()

        try:
            data = _ollama_generate(prompt)
            generated = _extract_quiz(data)

            if len(generated) != 1:
                raise ValueError(
                    f"Expected 1 generated question, got {len(generated)}"
                )

            question = generated[0]

            if question["source_page"] != source_page:
                raise ValueError(
                    "Generated source page does not match supplied chunk."
                )

            normalized_question = question["question"].strip().lower()

            if any(
                existing["question"].strip().lower()
                == normalized_question
                for existing in questions
            ):
                raise ValueError("Duplicate quiz question generated.")

            questions.append(question)

            print(
                f"Accepted quiz question "
                f"{len(questions)}/{count} "
                f"from page {source_page}"
            )

        except ValueError as exc:
            print(
                f"Rejected quiz question attempt {attempts}:",
                str(exc),
            )

    if len(questions) < count:
        raise ValueError(
            f"Could only generate {len(questions)} valid "
            f"questions after {attempts} attempts."
        )

    return questions

