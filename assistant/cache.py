import json
import hashlib

# Thousands of employees ask the same questions. An identical (question,
# context) must not re-bill the API. Hash the request into a stable key.
_CACHE: dict[str, dict] = {}


def cache_key(question: str, context: str) -> str:
    payload = json.dumps({"q": question, "c": context}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def cached(question: str, context: str, compute):
    k = cache_key(question, context)
    if k in _CACHE:
        return _CACHE[k]            # cache HIT — zero API cost, zero latency
    result = compute()
    _CACHE[k] = result
    return result


# Route by difficulty: cheap model for routine Q&A, flagship for hard requests.
def pick_model(question: str) -> str:
    hard = any(w in question.lower() for w in ("draft", "compare", "analyze", "why"))
    return "gpt-4o" if hard else "gpt-4o-mini"
