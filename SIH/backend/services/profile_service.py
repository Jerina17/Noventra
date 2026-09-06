"""Canonical beneficiary profile shape used across the application."""


def _scalar(value):
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _list(value):
    if value is None:
        return []
    values = [value] if isinstance(value, str) else value
    return [str(item).strip() for item in values if str(item).strip()]


def canonicalize_profile(profile=None):
    """Normalize legacy API/database fields into the canonical profile object."""
    source = profile if isinstance(profile, dict) else {}
    experience = source.get("experience_years")
    if isinstance(experience, str):
        digits = "".join(character for character in experience if character.isdigit())
        experience = int(digits) if digits else None
    elif isinstance(experience, float):
        experience = int(experience)
    elif not isinstance(experience, int):
        experience = None

    interests = _list(source.get("interests"))
    interest = _scalar(source.get("interest")) or (interests[0] if interests else None)
    current_livelihood = _scalar(source.get("current_livelihood")) or _scalar(source.get("occupation"))

    return {
        "education": _scalar(source.get("education")),
        "current_livelihood": current_livelihood,
        "experience_years": experience,
        "skills": list(dict.fromkeys(_list(source.get("skills")))),
        "interest": interest,
        "career_goal": _scalar(source.get("career_goal")),
        "district": _scalar(source.get("district")),
        "language": _scalar(source.get("language")) or "en",
    }
