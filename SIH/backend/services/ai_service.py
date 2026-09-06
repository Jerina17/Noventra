import json
import os

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None

try:
    from .nlp_service import extract_profile_from_text
    from .profile_service import canonicalize_profile
except ImportError:  # pragma: no cover
    from services.nlp_service import extract_profile_from_text
    from services.profile_service import canonicalize_profile


PROFILE_KEYS = [
    "education",
    "current_livelihood",
    "experience_years",
    "skills",
    "interest",
    "career_goal",
    "district",
]


def normalize_scalar(value):
    if value is None:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    return value


def normalize_list(value):
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    cleaned = []
    for item in value:
        if item is None:
            continue
        text = str(item).strip()
        if text:
            cleaned.append(text)
    return cleaned


def sanitize_profile(raw_profile):
    return canonicalize_profile(raw_profile)


def merge_profiles(existing_profile, incoming_profile):
    existing = existing_profile or {}
    incoming = sanitize_profile(incoming_profile or {})
    merged = {
        "education": existing.get("education") or incoming.get("education"),
        "current_livelihood": existing.get("current_livelihood") or incoming.get("current_livelihood"),
        "experience_years": existing.get("experience_years") if existing.get("experience_years") is not None else incoming.get("experience_years"),
        "skills": list(dict.fromkeys((normalize_list(existing.get("skills")) + normalize_list(incoming.get("skills"))))),
        "interest": existing.get("interest") or incoming.get("interest"),
        "career_goal": existing.get("career_goal") or incoming.get("career_goal"),
        "district": existing.get("district") or incoming.get("district"),
        "language": existing.get("language") or incoming.get("language") or "en",
    }
    return merged


def fallback_profile(text, existing_profile=None):
    parsed = extract_profile_from_text(text)
    if existing_profile:
        return merge_profiles(existing_profile, parsed)
    return sanitize_profile(parsed)


def extract_profile(text, language="en", existing_profile=None):
    if not text or not str(text).strip():
        fallback = fallback_profile(text or "", existing_profile)
        return fallback, "fallback"

    fallback = fallback_profile(text, existing_profile)
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key or OpenAI is None:
        return fallback, "fallback"

    try:
        client = OpenAI(api_key=api_key)
        prompt = (
            "You are a livelihood profile extraction assistant. "
            "Extract ONLY information explicitly stated by the user. "
            "Return structured JSON with exactly these fields: education, current_livelihood, experience_years, skills, interest, career_goal, district. "
            "Rules: never invent information, never infer missing information, use null for missing scalar fields, use [] for missing arrays, "
            "experience_years must be numeric or null, preserve meaningful user information, support English and Tamil, and do not return explanations outside JSON."
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(text).strip()},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty AI response")
        payload = json.loads(content)
        sanitized = sanitize_profile(payload)
        merged = merge_profiles(existing_profile, sanitized)
        return merged, "ai"
    except Exception:
        return fallback, "fallback"
