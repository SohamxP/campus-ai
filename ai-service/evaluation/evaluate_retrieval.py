import json
from pathlib import Path

from app.db.retrieval_repository import (
    retrieve_hybrid_chunks,
    retrieve_reranked_chunks,
    retrieve_vector_chunks,
)
from app.services.embedding_service import create_embedding


DATASET_PATH = Path(__file__).parent / "questions.json"


def is_relevant(result: dict, expected_sources: list[dict]) -> bool:
    for source in expected_sources:
        if (
            result["filename"] == source["filename"]
            and result["page_number"] in source["pages"]
        ):
            return True

    return False


def recall_at_k(
    results: list[dict],
    expected_sources: list[dict],
    k: int,
) -> int:
    return int(
        any(
            is_relevant(result, expected_sources)
            for result in results[:k]
        )
    )


def reciprocal_rank(
    results: list[dict],
    expected_sources: list[dict],
) -> float:
    for rank, result in enumerate(results, start=1):
        if is_relevant(result, expected_sources):
            return 1 / rank

    return 0.0


def evaluate(course_id: str):
    with open(DATASET_PATH) as file:
        questions = json.load(file)

    systems = {
        "Vector retrieval": {
            "recall": {1: [], 3: [], 5: []},
            "rr": [],
        },
        "Hybrid retrieval": {
            "recall": {1: [], 3: [], 5: []},
            "rr": [],
        },
        "Hybrid + reranker": {
            "recall": {1: [], 3: [], 5: []},
            "rr": [],
        },
    }

    print()
    print("CampusAI Retrieval Evaluation")
    print("=" * 70)
    print(f"Questions evaluated: {len(questions)}")
    print()

    for number, item in enumerate(questions, start=1):
        question = item["question"]
        expected_sources = item["expected_sources"]

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

        results_by_system = {
            "Vector retrieval": vector_results,
            "Hybrid retrieval": hybrid_results,
            "Hybrid + reranker": reranked_results,
        }

        for system_name, results in results_by_system.items():
            for k in [1, 3, 5]:
                systems[system_name]["recall"][k].append(
                    recall_at_k(
                        results,
                        expected_sources,
                        k,
                    )
                )

            systems[system_name]["rr"].append(
                reciprocal_rank(
                    results,
                    expected_sources,
                )
            )

        print(f"{number}. {question}")

        expected_display = [
            f'{source["filename"]}: {source["pages"]}'
            for source in expected_sources
        ]

        print(f"   Expected: {expected_display}")

        for system_name, results in results_by_system.items():
            returned = [
                f'{result["filename"]}:p{result["page_number"]}'
                for result in results
            ]

            print(
                f"   {system_name:<19} {returned}"
            )

        print()

    print("=" * 70)

    for system_name, metrics in systems.items():
        print(system_name)

        for k in [1, 3, 5]:
            scores = metrics["recall"][k]
            value = sum(scores) / len(scores)

            print(
                f"Recall@{k}: {value:.2%}"
            )

        mrr = sum(metrics["rr"]) / len(metrics["rr"])
        print(f"MRR:      {mrr:.3f}")
        print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--course-id",
        required=True,
    )

    args = parser.parse_args()

    evaluate(args.course_id)
