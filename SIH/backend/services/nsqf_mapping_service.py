from __future__ import annotations
import json
import re
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "nsqf_qualifications.json"


def load_nsqf_qualifications():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError:
        return {"qualifications": []}
    return data or {"qualifications": []}


def normalize_text(value):
    return str(value or "").strip()


def extract_tokens(text):
    if not text:
        return set()
    words = re.split(r'\W+', str(text).lower())
    return {w for w in words if len(w) > 2 and w not in {"and", "the", "for", "with", "into", "from", "user", "work", "worker"}}


def find_matching_qualifications(profile, livelihood=None, skill_gaps=None):
    """Return ranked NSQF matches dynamically based on profile keywords."""
    data = load_nsqf_qualifications()
    qualifications = data.get("qualifications") or []
    if not qualifications:
        return []

    # Collect profile tokens
    goal = normalize_text(profile.get("career_goal"))
    interest = normalize_text(profile.get("interest"))
    occupation = normalize_text(profile.get("current_livelihood") or profile.get("occupation"))
    skills_list = profile.get("skills") or []
    if isinstance(skills_list, str):
        skills_list = [skills_list]

    goal_tokens = extract_tokens(goal)
    interest_tokens = extract_tokens(interest)
    occupation_tokens = extract_tokens(occupation)
    user_skill_tokens = set()
    for s in skills_list:
        user_skill_tokens.update(extract_tokens(s))

    all_user_tokens = goal_tokens | interest_tokens | occupation_tokens | user_skill_tokens

    if not all_user_tokens:
        return []

    matches = []

    for record in qualifications:
        if not record:
            continue

        q_name = record.get("qualification_name", "")
        q_role = record.get("job_role", "")
        q_sector = record.get("sector", "")
        q_keywords = set(record.get("keywords") or [])
        q_skills = record.get("skills") or []

        q_text_tokens = extract_tokens(f"{q_name} {q_role} {q_sector} {' '.join(q_keywords)} {' '.join(q_skills)}")

        score = 0
        matched_factors = []

        # Goal / Interest match (High Priority)
        goal_interest_tokens = goal_tokens | interest_tokens
        if goal_interest_tokens:
            g_overlap = goal_interest_tokens & (q_text_tokens | q_keywords)
            if g_overlap:
                score += min(45, len(g_overlap) * 20)
                matched_factors.append(f"Goal/Interest match ({', '.join(g_overlap)})")

        # Occupation match
        if occupation_tokens:
            o_overlap = occupation_tokens & (q_text_tokens | q_keywords)
            if o_overlap:
                score += min(30, len(o_overlap) * 15)
                matched_factors.append(f"Occupation alignment ({', '.join(o_overlap)})")

        # Skill overlap
        if user_skill_tokens:
            s_overlap = user_skill_tokens & q_text_tokens
            if s_overlap:
                score += min(20, len(s_overlap) * 10)
                matched_factors.append("Existing skill overlap")

        # Keyword direct match
        for token in all_user_tokens:
            if token in q_keywords:
                score += 15

        if score > 0:
            final_score = max(65, min(98, score + 40))
            matches.append({
                "qualification_name": q_name,
                "job_role": q_role,
                "sector": q_sector,
                "nsqf_level": record.get("nsqf_level") or 4,
                "qp_id": record.get("qualification_pack_id") or "QP-NO-ID",
                "required_skills": q_skills,
                "matched_skills": list(user_skill_tokens & q_text_tokens),
                "skill_gaps": [s for s in q_skills if s.lower() not in user_skill_tokens],
                "match_score": final_score,
                "verification_status": "Verified NQR Data" if record.get("verified") else "NSQF Aligned",
                "source": record.get("source") or "National Qualification Register",
                "source_url": record.get("source_url") or "https://nqr.gov.in/",
                "verified": bool(record.get("verified")),
                "demo_status": "NSQF Qualification"
            })

    # Sort descending by match score
    matches.sort(key=lambda item: item["match_score"], reverse=True)
    return matches
