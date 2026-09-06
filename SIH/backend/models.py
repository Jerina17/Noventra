try:
    from .database import execute, fetch_one, fetch_all, get_db_connection
except ImportError:
    from database import execute, fetch_one, fetch_all, get_db_connection


def create_beneficiary(profile):
    query = """
        INSERT INTO beneficiaries (district, education, occupation, experience_years, career_goal, language)
        VALUES (?, ?, ?, ?, ?, ?)
    """
    beneficiary_id = execute(
        query,
        (
            profile.get("district"),
            profile.get("education"),
            profile.get("current_livelihood") or profile.get("occupation"),
            profile.get("experience_years"),
            profile.get("career_goal"),
            profile.get("language", "en"),
        ),
    )
    return beneficiary_id


def update_beneficiary(beneficiary_id, profile):
    query = """
        UPDATE beneficiaries
        SET district = ?, education = ?, occupation = ?, experience_years = ?, career_goal = ?, language = ?
        WHERE id = ?
    """
    execute(
        query,
        (
            profile.get("district"),
            profile.get("education"),
            profile.get("current_livelihood") or profile.get("occupation"),
            profile.get("experience_years"),
            profile.get("career_goal"),
            profile.get("language", "en"),
            beneficiary_id,
        ),
    )


def save_list(beneficiary_id, table_name, values):
    conn = get_db_connection()
    conn.execute(f"DELETE FROM {table_name} WHERE beneficiary_id = ?", (beneficiary_id,))
    for value in values:
        if value:
            conn.execute(f"INSERT INTO {table_name} (beneficiary_id, {table_name[:-1] if table_name.endswith('s') else 'skill'}) VALUES (?, ?)", (beneficiary_id, value))
    conn.commit()
    conn.close()


def save_skills(beneficiary_id, skills):
    save_list(beneficiary_id, "skills", skills)


def save_interests(beneficiary_id, interests):
    save_list(beneficiary_id, "interests", interests)


def get_beneficiary_by_id(beneficiary_id):
    row = fetch_one("SELECT * FROM beneficiaries WHERE id = ?", (beneficiary_id,))
    if not row:
        return None
    profile = dict(row)
    skills = fetch_all("SELECT skill FROM skills WHERE beneficiary_id = ? ORDER BY id", (beneficiary_id,))
    interests = fetch_all("SELECT interest FROM interests WHERE beneficiary_id = ? ORDER BY id", (beneficiary_id,))
    profile["skills"] = [item[0] for item in skills]
    profile["interests"] = [item[0] for item in interests]
    return profile


def get_latest_beneficiary():
    row = fetch_one("SELECT * FROM beneficiaries ORDER BY id DESC LIMIT 1")
    if not row:
        return None
    return get_beneficiary_by_id(row["id"])


def save_recommendation(beneficiary_id, course_id, score):
    execute(
        "INSERT INTO recommendations (beneficiary_id, course_id, score) VALUES (?, ?, ?)",
        (beneficiary_id, course_id, score),
    )


def save_skill_gap(beneficiary_id, gap):
    execute("INSERT INTO skill_gaps (beneficiary_id, skill) VALUES (?, ?)", (beneficiary_id, gap))


def get_dashboard_rows():
    return fetch_all(
        """
        SELECT id, district, education, occupation, experience_years, career_goal
        FROM beneficiaries
        ORDER BY id DESC
        """
    )
