import numpy as np

from app.services.embedding_service import create_embedding


KEYWORD_RULES = {
    "Linear Regression": [
        "linear regression",
        "bias term",
        "identity activation",
        "mean squared error",
        "mse",
        "regression neuron",
    ],
    "Gradient Descent": [
        "gradient descent",
        "learning rate",
        "overshoot",
        "overshooting",
        "minimum",
        "minimization",
        "gradient update",
        "convergence",
    ],
    "Perceptron": [
        "perceptron",
        "step function",
        "heaviside",
        "decision boundary",
        "linearly separable",
    ],
    "Logistic Regression": [
        "logistic regression",
        "sigmoid",
        "binary classification",
        "cross entropy binary",
    ],
    "Multiclass & Softmax": [
        "multiclass",
        "softmax",
        "one-hot",
        "one hot",
        "multiclass logistic regression",
    ],
}


def _keyword_match(raw_topic: str) -> str | None:
    normalized = raw_topic.lower().strip()

    for canonical_topic, keywords in KEYWORD_RULES.items():
        for keyword in keywords:
            if keyword in normalized:
                return canonical_topic

    return None


def normalize_topic(
    raw_topic: str,
    canonical_topics: list[str],
) -> str:
    if not canonical_topics:
        return raw_topic

    keyword_topic = _keyword_match(raw_topic)

    if (
        keyword_topic is not None
        and keyword_topic in canonical_topics
    ):
        print(
            f'TOPIC MAP RULE: "{raw_topic}" '
            f'→ "{keyword_topic}"'
        )
        return keyword_topic

    raw_vector = np.array(
        create_embedding(raw_topic),
        dtype=np.float32,
    )

    best_topic = raw_topic
    best_score = -1.0

    for topic in canonical_topics:
        topic_vector = np.array(
            create_embedding(topic),
            dtype=np.float32,
        )

        denominator = (
            np.linalg.norm(raw_vector)
            * np.linalg.norm(topic_vector)
        )

        if denominator == 0:
            continue

        score = float(
            np.dot(raw_vector, topic_vector)
            / denominator
        )

        if score > best_score:
            best_score = score
            best_topic = topic

    print(
        f'TOPIC MAP SEMANTIC: "{raw_topic}" '
        f'→ "{best_topic}" '
        f'({best_score:.3f})'
    )

    return best_topic
