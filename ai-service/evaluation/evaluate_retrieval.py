import json
from pathlib import Path

from app.db.retrieval_repository import (
    retrieve_hybrid_chunks,
    retrieve_reranked_chunks,
    retrieve_vector_chunks,
)
from app.services.embedding_service import create_embedding


DATASET_PATH = Path(__file__).parent / "questions.json"


def recall_at_k(results, expected_pages, k):
    returned_pages = {
        result["page_number"]
        for result in results[:k]
    }

    return int(
        any(page in returned_pages for page in expected_pages)
    )


def evaluate(course_id: str):
    with open(DATASET_PATH) as file:
        questions = json.load(file)

    vector_scores = {1: [], 3: [], 5: []}
    hybrid_scores = {1: [], 3: [], 5: []}
    reranked_scores = {1: [], 3: [], 5: []}

    print()
    print("CampusAI Retrieval Evaluation")
    print("=" * 60)
    print(f"Questions evaluated: {len(questions)}")
    print()

    for number, item in enumerate(questions, start=1):
        question = item["question"]
        expected_pages = item["expected_pages"]

        embedding = create_embedding(question)

        vector_results = retrieve_vector_chunks(
            course_id=course_id,
            query_embedding=embedding,
            limit=5,
        )

        hybrid_results = retrieve_hybrid_chunks(
            course_id=course_id,
            question=question,
            query_embedding=embedding,
            limit=5,
        )

        reranked_results = retrieve_reranked_chunks(
            course_id=course_id,
            question=question,
            query_embedding=embedding,
            limit=5,
        )

        for k in [1, 3, 5]:
            vector_scores[k].append(
                recall_at_k(vector_results, expected_pages, k)
            )

            hybrid_scores[k].append(
                recall_at_k(hybrid_results, expected_pages, k)
            )

            reranked_scores[k].append(
                recall_at_k(reranked_results, expected_pages, k)
            )

        vector_pages = [
            result["page_number"]
            for result in vector_results
        ]

        hybrid_pages = [
            result["page_number"]
            for result in hybrid_results
        ]

        reranked_pages = [
            result["page_number"]
            for result in reranked_results
        ]

        print(f"{number}. {question}")
        print(f"   Expected:  {expected_pages}")
        print(f"   Vector:    {vector_pages}")
        print(f"   Hybrid:    {hybrid_pages}")
        print(f"   Reranked:  {reranked_pages}")
        print()

    print("=" * 60)

    print("Vector retrieval")
    for k in [1, 3, 5]:
        score = sum(vector_scores[k]) / len(vector_scores[k])
        print(f"Recall@{k}: {score:.2%}")

    print()

    print("Hybrid retrieval")
    for k in [1, 3, 5]:
        score = sum(hybrid_scores[k]) / len(hybrid_scores[k])
        print(f"Recall@{k}: {score:.2%}")

    print()

    print("Hybrid + reranker")
    for k in [1, 3, 5]:
        score = sum(reranked_scores[k]) / len(reranked_scores[k])
        print(f"Recall@{k}: {score:.2%}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--course-id",
        required=True,
    )

    args = parser.parse_args()

    evaluate(args.course_id)
