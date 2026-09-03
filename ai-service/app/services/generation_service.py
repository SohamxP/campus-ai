from openai import OpenAI, OpenAIError

from app.core_config import settings


client = OpenAI(
    api_key=settings.openai_api_key,
)


def _extractive_fallback(
    chunks: list[dict],
) -> str:
    if not chunks:
        return (
            "I could not find relevant course material "
            "for this question."
        )

    passages = []

    for index, chunk in enumerate(
        chunks[:3],
        start=1,
    ):
        content = chunk["content"].strip()

        passages.append(
            f"{content} [Source {index}]"
        )

    return "\n\n".join(passages)


def generate_grounded_answer(
    question: str,
    chunks: list[dict],
) -> str:
    context_parts = []

    for index, chunk in enumerate(chunks, start=1):
        context_parts.append(
            f"""[Source {index}]
Document: {chunk["filename"]}
Page: {chunk["page_number"]}
Content:
{chunk["content"]}
"""
        )

    context = "\n\n".join(context_parts)

    prompt = f"""
You are CampusAI, an academic assistant.

Answer the student's question using ONLY the course material provided below.

Rules:
1. Do not use outside knowledge.
2. If the provided material does not contain enough information, clearly say so.
3. Cite claims using source markers like [Source 1] or [Source 2].
4. Do not invent citations.
5. Be concise but educational.

COURSE MATERIAL:

{context}

STUDENT QUESTION:
{question}

ANSWER:
""".strip()

    try:
        response = client.responses.create(
            model=settings.openai_model,
            input=prompt,
            reasoning={
                "effort": "none",
            },
        )

        answer = response.output_text.strip()

        if answer:
            return answer

    except OpenAIError:
        pass

    return _extractive_fallback(chunks)
