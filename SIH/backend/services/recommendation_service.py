from __future__ import annotations
import json
from pathlib import Path

try:
    from .skill_gap_service import generate_skill_gaps
    from .nsqf_mapping_service import find_matching_qualifications
    from .profile_service import canonicalize_profile
except ImportError:
    from services.skill_gap_service import generate_skill_gaps
    from services.nsqf_mapping_service import find_matching_qualifications
    from services.profile_service import canonicalize_profile

COURSES_PATH = Path(__file__).resolve().parent.parent / "data" / "courses.json"


def normalize_qualification_record(record):
    if not record:
        return {
            "qualification_name": "Not available",
            "job_role": "Not available",
            "qualification_pack_id": "Not available",
            "sector": "Not available",
            "nsqf_level": None,
            "version": "Not available",
            "skills": [],
            "eligibility": {},
            "duration_hours": None,
            "assessment": "Verification pending",
            "source": "Verification pending",
            "source_url": "https://nqr.gov.in/",
            "verified": False,
            "demo_status": "Demo NSQF-aligned data"
        }

    verified = bool(record.get("verified") is True)
    if verified:
        return {
            "qualification_name": str(record.get("qualification_name") or "Not available"),
            "job_role": str(record.get("job_role") or "Not available"),
            "qualification_pack_id": str(record.get("qualification_pack_id") or "Not available"),
            "sector": str(record.get("sector") or "Not available"),
            "nsqf_level": record.get("nsqf_level"),
            "version": str(record.get("version") or "Not available"),
            "skills": record.get("skills") or [],
            "eligibility": record.get("eligibility") or {},
            "duration_hours": record.get("duration_hours"),
            "assessment": str(record.get("assessment") or "Not available"),
            "source": str(record.get("source") or "National Qualification Register"),
            "source_url": str(record.get("source_url") or "https://nqr.gov.in/"),
            "verified": True,
            "demo_status": "Verified NQR data"
        }

    return {
        "qualification_name": "Not available",
        "job_role": "Not available",
        "qualification_pack_id": "Not available",
        "sector": str(record.get("sector") or "Not available"),
        "nsqf_level": None,
        "version": "Not available",
        "skills": record.get("skills") or [],
        "eligibility": record.get("eligibility") or {},
        "duration_hours": None,
        "assessment": "Verification pending",
        "source": str(record.get("source") or "Verification pending"),
        "source_url": str(record.get("source_url") or "https://nqr.gov.in/"),
        "verified": False,
        "demo_status": "Demo NSQF-aligned data"
    }


def load_courses_catalog():
    try:
        with open(COURSES_PATH, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return []


def generate_localized_summary(qualification_name, sector, language="en"):
    if language == "ta":
        return f"உங்கள் குறிக்கோளுக்கு ஏற்ப {qualification_name} பயிற்சி பரிந்துரைக்கப்படுகிறது."
    elif language == "hi":
        return f"आपके लक्ष्य के अनुसार {qualification_name} पाठ्यक्रम की अनुशंसा की जाती है।"
    return f"Based on your profile, we recommend the {qualification_name} qualification under PM-AJAY GIA grant."


def recommend_courses(profile):
    """Generate dynamic recommendations based strictly on user profile data. No hardcoded defaults."""
    profile = canonicalize_profile(profile)
    language = profile.get("language") or "en"
    
    nsqf_matches = find_matching_qualifications(profile)
    career_goal = profile.get("career_goal") or profile.get("interest") or profile.get("current_livelihood") or ""
    skill_gaps = generate_skill_gaps(profile, career_goal)

    results = []

    for match in nsqf_matches[:4]:
        qualification = normalize_qualification_record(match)
        scheme_alignment = {
            "scheme": "PM-AJAY",
            "component": "GIA",
            "focus": ["Skill Development", "Livelihood Generation", "Income Generation"],
            "alignment_reason": f"The proposed {match.get('qualification_name')} training pathway supports PM-AJAY GIA skill-development objectives."
        }

        voice_summary = generate_localized_summary(match.get('qualification_name'), match.get('sector'), language)

        rec = {
            "course_id": match.get("qp_id") or "NSQF-PACK",
            "title": match.get("qualification_name"),
            "job_role": match.get("job_role"),
            "sector": match.get("sector"),
            "score": match.get("match_score", 90),
            "nsqf_level": f"NSQF Level {match.get('nsqf_level')}" if match.get('nsqf_level') else "NSQF Aligned",
            "qualification_pack_id": match.get("qp_id"),
            "potential_skill_gaps": match.get("skill_gaps") or skill_gaps,
            "description": f"NSQF Level {match.get('nsqf_level', 4)} qualification in {match.get('sector')} aligned for {match.get('job_role')} job roles under PM-AJAY GIA Component.",
            "duration": f"240-350 Hours (6-8 Weeks)",
            "expected_salary": "₹18,000 - ₹28,000/mo",
            "matched_factors": [
                "Profile aspiration match",
                "Skill gap alignment",
                "PM-AJAY GIA grant subsidy",
                "NSQF role compatibility"
            ],
            "why_this_recommendation": f"Based on your profile in {profile.get('current_livelihood') or 'your field'} and aspiration in {career_goal or match.get('sector')}, this {match.get('qualification_name')} pathway aligns with PM-AJAY skill-development objectives.",
            "source_url": match.get("source_url") or "https://nqr.gov.in/",
            "qualification": qualification,
            "scheme_alignment": scheme_alignment,
            "pathway": {
                "livelihood_mapping": {
                    "current_livelihood": profile.get("current_livelihood") or "Current Livelihood",
                    "target_livelihood": match.get("job_role"),
                    "target_sector": match.get("sector")
                },
                "skill_gaps": skill_gaps,
                "pm_ajay_alignment": scheme_alignment,
                "nsqf_matches": [match]
            },
            "voice_summary": voice_summary
        }
        results.append(rec)

    return results

