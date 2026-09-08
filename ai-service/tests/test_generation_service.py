from types import SimpleNamespace

from app.services import generation_service


def test_generate_grounded_answer(monkeypatch):
    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)

        return SimpleNamespace(
            output_text=(
                "A single-layer neural network connects "
                "the input layer directly to the output "
                "layer. [Source 1]"
            )
        )

    monkeypatch.setattr(
        generation_service.client.responses,
        "create",
        fake_create,
    )

    chunks = [
        {
            "filename": "lecture.pdf",
            "page_number": 3,
            "content": (
                "A single-layer neural network contains "
                "an input layer connected directly to an "
                "output layer."
            ),
        }
    ]

    answer = (
        generation_service.generate_grounded_answer(
            question=(
                "What is a single-layer neural network?"
            ),
            chunks=chunks,
        )
    )

    assert isinstance(answer, str)
    assert len(answer) > 0
    assert "[Source 1]" in answer

    assert captured["model"] == (
        generation_service.settings.openai_model
    )

    prompt = captured["input"]

    assert "lecture.pdf" in prompt
    assert "Page: 3" in prompt
    assert (
        "What is a single-layer neural network?"
        in prompt
    )
