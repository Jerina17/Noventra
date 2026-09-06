import json
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

try:
    from .config import FRONTEND_DIR, SECRET_KEY
    from .database import init_db
    from .models import create_beneficiary, get_beneficiary_by_id, get_latest_beneficiary, save_interests, save_recommendation, save_skill_gap, save_skills, update_beneficiary
    from .services.ai_service import extract_profile as ai_extract_profile
    from .services.nlp_service import extract_profile_from_text
    from .services.profile_service import canonicalize_profile
    from .services.recommendation_service import recommend_courses
    from .services.skill_gap_service import generate_skill_gaps
except ImportError:
    from config import FRONTEND_DIR, SECRET_KEY
    from database import init_db
    from models import create_beneficiary, get_beneficiary_by_id, get_latest_beneficiary, save_interests, save_recommendation, save_skill_gap, save_skills, update_beneficiary
    from services.ai_service import extract_profile as ai_extract_profile
    from services.nlp_service import extract_profile_from_text
    from services.profile_service import canonicalize_profile
    from services.recommendation_service import recommend_courses
    from services.skill_gap_service import generate_skill_gaps

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
app.config["SECRET_KEY"] = SECRET_KEY
init_db()


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/")
def index():
    return send_from_directory(str(FRONTEND_DIR), "index.html")


@app.route("/profile")
def profile_page():
    return send_from_directory(str(FRONTEND_DIR), "profile.html")


@app.route("/recommendations")
def recommendations_page():
    return send_from_directory(str(FRONTEND_DIR), "recommendations.html")


@app.route("/dashboard")
def dashboard_page():
    return send_from_directory(str(FRONTEND_DIR), "dashboard.html")


@app.route("/sw.js")
def service_worker():
    return send_from_directory(str(FRONTEND_DIR), "sw.js")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/profile", methods=["POST", "GET"])
def profile_api():
    if request.method == "GET":
        beneficiary_id = request.args.get("beneficiary_id")
        if beneficiary_id:
            profile = get_beneficiary_by_id(int(beneficiary_id))
            if not profile:
                return jsonify({"error": "Profile not found"}), 404
            return jsonify(canonicalize_profile(profile))
        latest = get_latest_beneficiary()
        return jsonify(canonicalize_profile(latest or {}))

    payload = request.get_json(silent=True) or {}
    if not payload:
        return jsonify({"error": "Please provide the missing information."}), 400

    cleaned = canonicalize_profile(payload)
    cleaned = {key: value for key, value in cleaned.items() if value is not None and value != []}
    if not cleaned:
        return jsonify({"error": "Please provide the missing information."}), 400

    beneficiary_id = payload.get("beneficiary_id")
    if beneficiary_id:
        update_beneficiary(int(beneficiary_id), cleaned)
        beneficiary = get_beneficiary_by_id(int(beneficiary_id))
    else:
        beneficiary_id = create_beneficiary(cleaned)
        beneficiary = get_beneficiary_by_id(beneficiary_id)

    if cleaned.get("skills"):
        save_skills(beneficiary_id, cleaned["skills"])
    if cleaned.get("interest"):
        save_interests(beneficiary_id, [cleaned["interest"]])

    return jsonify({"beneficiary_id": beneficiary_id, "profile": canonicalize_profile(beneficiary)})


@app.route("/api/analyze-profile", methods=["POST"])
def analyze_profile():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text") or payload.get("answer") or ""
    if not text:
        return jsonify({"error": "Please provide a response to analyze."}), 400

    existing_profile = payload.get("profile") or {}
    profile, source = ai_extract_profile(text, payload.get("language", "en"), existing_profile)
    normalized = canonicalize_profile(profile)
    return jsonify({"success": True, "profile": normalized, "source": source})


@app.route("/api/skill-gaps", methods=["POST"])
def skill_gaps_api():
    payload = request.get_json(silent=True) or {}
    profile = canonicalize_profile(payload.get("profile") or {})
    if not any(profile.get(key) for key in ("education", "current_livelihood", "experience_years", "skills", "interest", "career_goal", "district")):
        return jsonify({"error": "Profile is required."}), 400
    gaps = generate_skill_gaps(profile, profile.get("career_goal"))
    return jsonify({"potential_skill_gaps": gaps})


@app.route("/api/recommendations", methods=["POST"])
def recommendations_api():
    payload = request.get_json(silent=True) or {}
    profile = canonicalize_profile(payload.get("profile") or {})
    app.logger.info("PROFILE SENT TO BACKEND: %s", profile)
    if not any(profile.get(key) for key in ("education", "current_livelihood", "experience_years", "skills", "interest", "career_goal", "district")):
        return jsonify({"error": "Profile is required."}), 400
    result = recommend_courses(profile)
    pathway = result[0]["pathway"] if result else {}
    app.logger.info("BACKEND RECEIVED: %s", profile)
    app.logger.info("LIVELIHOOD RESULT: %s", pathway.get("livelihood_mapping", {}))
    app.logger.info("SKILL GAP RESULT: %s", pathway.get("skill_gaps", []))
    app.logger.info("PM-AJAY RESULT: %s", pathway.get("pm_ajay_alignment", {}))
    app.logger.info("NSQF RESULT: %s", pathway.get("nsqf_matches", []))
    app.logger.info("FINAL PATHWAY: %s", pathway)
    return jsonify({
        "recommendations": result,
        "profile": profile,
        "pathway": pathway,
        "voice_summary": result[0].get("voice_summary") if result else ""
    })


@app.route("/api/debug/profile", methods=["GET"])
def debug_profile():
    return jsonify(canonicalize_profile(get_latest_beneficiary() or {}))


@app.route("/api/debug/recommendation", methods=["GET"])
def debug_recommendation():
    profile = canonicalize_profile(get_latest_beneficiary() or {})
    result = recommend_courses(profile) if any(profile.get(key) for key in ("education", "current_livelihood", "skills", "interest", "career_goal")) else []
    return jsonify(result[0].get("pathway", {}) if result else {})


@app.route("/api/courses", methods=["GET"])
def courses_api():
    courses_path = Path(__file__).resolve().parent / "data" / "courses.json"
    with open(courses_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return jsonify({"courses": data})


@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    try:
        from .database import fetch_all
    except ImportError:
        from database import fetch_all

    beneficiaries = fetch_all("SELECT * FROM beneficiaries")

    occupation_counts = {}
    education_counts = {}
    skill_gap_counts = {}
    demand_counts = {}
    district_counts = {}

    for row in beneficiaries:
        occupation = row["occupation"] or "Unknown"
        education = row["education"] or "Unknown"
        district = row["district"] or "Unknown"
        occupation_counts[occupation] = occupation_counts.get(occupation, 0) + 1
        education_counts[education] = education_counts.get(education, 0) + 1
        district_counts[district] = district_counts.get(district, 0) + 1

    skill_rows = fetch_all("SELECT skill FROM skill_gaps")
    for row in skill_rows:
        skill = row["skill"] or "Unknown"
        skill_gap_counts[skill] = skill_gap_counts.get(skill, 0) + 1

    course_rows = fetch_all("SELECT course_id, score FROM recommendations")
    course_lookup = {course["id"]: course["title"] for course in json.loads((Path(__file__).resolve().parent / "data" / "courses.json").read_text(encoding="utf-8"))}
    for row in course_rows:
        course_name = course_lookup.get(row["course_id"], row["course_id"])
        demand_counts[course_name] = demand_counts.get(course_name, 0) + 1

    return jsonify({
        "total_beneficiaries": len(beneficiaries),
        "top_occupations": sorted(occupation_counts.items(), key=lambda item: item[1], reverse=True)[:5],
        "education_distribution": sorted(education_counts.items(), key=lambda item: item[1], reverse=True),
        "common_skill_gaps": sorted(skill_gap_counts.items(), key=lambda item: item[1], reverse=True)[:5],
        "training_demand": sorted(demand_counts.items(), key=lambda item: item[1], reverse=True)[:5],
        "district_distribution": sorted(district_counts.items(), key=lambda item: item[1], reverse=True),
    })


@app.route("/<path:path>")
def catch_all(path):
    if path.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404
    static_file = Path(FRONTEND_DIR) / path
    if static_file.exists() and static_file.is_file():
        return send_from_directory(str(FRONTEND_DIR), path)
    return send_from_directory(str(FRONTEND_DIR), "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

