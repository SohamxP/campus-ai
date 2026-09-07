from app.db.retrieval_repository import reciprocal_rank_fusion


def make_result(chunk_id: str):
    return {
        "chunk_id": chunk_id,
        "document_id": "doc-1",
        "filename": "lecture.pdf",
        "page_number": 1,
        "chunk_index": 0,
        "content": "example",
        "score": 0.5,
    }


def test_rrf_rewards_results_found_by_both_methods():
    vector_results = [
        make_result("A"),
        make_result("B"),
        make_result("C"),
    ]

    keyword_results = [
        make_result("B"),
        make_result("D"),
        make_result("A"),
    ]

    results = reciprocal_rank_fusion(
        vector_results,
        keyword_results,
        limit=4,
    )

    ids = [result["chunk_id"] for result in results]

    assert ids[0] == "B"
    assert "A" in ids
    assert len(results) == 4


def test_rrf_respects_limit():
    vector_results = [
        make_result("A"),
        make_result("B"),
        make_result("C"),
    ]

    results = reciprocal_rank_fusion(
        vector_results,
        [],
        limit=2,
    )

    assert len(results) == 2
