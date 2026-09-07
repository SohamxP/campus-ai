from app.services.generation_service import generate_grounded_answer


def test_generate_grounded_answer():
    chunks = [
        {
            "filename": "lecture.pdf",
            "page_number": 3,
            "content": (
                "A single-layer neural network contains an input layer "
                "connected directly to an output layer."
            ),
        }
    ]

    answer = generate_grounded_answer(
        question="What is a single-layer neural network?",
        chunks=chunks,
    )

    assert isinstance(answer, str)
    assert len(answer) > 0
