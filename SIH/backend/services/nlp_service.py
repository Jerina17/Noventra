import re

try:
    from .profile_service import canonicalize_profile
except ImportError:
    from services.profile_service import canonicalize_profile


def extract_profile_from_text(text):
    if not text or not str(text).strip():
        return {
            "education": None,
            "current_livelihood": None,
            "experience_years": None,
            "skills": [],
            "interest": None,
            "career_goal": None,
            "district": None,
        }

    cleaned = str(text).strip()
    lower_cleaned = cleaned.lower()
    result = {
        "education": None,
        "current_livelihood": None,
        "experience_years": None,
        "skills": [],
        "interest": None,
        "career_goal": None,
        "district": None,
    }

    # Education Extraction
    education_patterns = [
        (r"(10th|tenth|10 class|10th standard|பத்தாம் வகுப்பு|10वीं)", "10th"),
        (r"(12th|twelfth|12 class|12th standard|பன்னிரண்டாம் வகுப்பு|12वीं)", "12th"),
        (r"(graduat(e|ion)|b\.a|b\.sc|b\.com|இளங்கலை|स्नातक)", "Graduation"),
        (r"(diploma|டிப்ளமோ|डिप्लोमा)", "Diploma"),
        (r"(8th|eighth|8th class|8th standard|எட்டாம் வகுப்பு|8वीं)", "8th Pass"),
    ]
    for pattern, label in education_patterns:
        if re.search(pattern, cleaned, re.IGNORECASE):
            result["education"] = label
            break

    # Occupation Keywords (EN, TA, HI)
    occupation_keywords = [
        (["tailor", "sewing", "stitching", "தையல்", "दर्जी"], "Tailor"),
        (["farmer", "farming", "agriculture", "விவசாயி", "விவசாயம்", "किसान", "खेती"], "Farmer"),
        (["electrician", "electrical", "wiring", "மின்னியலாளர்", "इलेक्ट्रीशियन"], "Electrician"),
        (["driver", "driving", "transport", "ஓட்டுநர்", "ड्राइवर"], "Driver"),
        (["computer", "student", "developer", "coder", "கணினி", "कंप्यूटर"], "Computer Student"),
        (["beautician", "beauty", "salon", "அலங்காரம்", "ब्यूटीशियन"], "Beautician"),
        (["carpenter", "wood", "furniture", "தச்சர்", "बढ़ई"], "Carpenter"),
        (["nurse", "nursing", "healthcare", "செவிலியர்", "नर्स"], "Nurse"),
        (["mechanic", "automobile", "garage", "இயந்திரவியலாளர்", "मैकेनिक"], "Mechanic"),
        (["fisherman", "fishing", "aquaculture", "மீனவர்", "मछुआरा"], "Fisherman"),
        (["food processing", "food", "உணவு", "खाद्य"], "Food Processor")
    ]
    for keys, label in occupation_keywords:
        if any(k in lower_cleaned for k in keys):
            result["current_livelihood"] = label
            break

    # Years Experience
    years_match = re.search(r"(\d+)\s*(year|years|yr|yrs|வருட|வருடங்கள்|साल|वर्ष)", cleaned, re.IGNORECASE)
    if years_match:
        result["experience_years"] = int(years_match.group(1))
    elif re.search(r"ஐந்து\s*வருட|five\s*years|पांच\s*साल", cleaned, re.IGNORECASE):
        result["experience_years"] = 5

    # Extract Name (e.g., "Hi I am Anushya", "My name is Anushya", "நான் அனுஷ்யா")
    name_match = re.search(r"(?:i am|my name is|im|நான்|मेरा नाम)\s+([a-zA-Z\u0B80-\u0BFF\u0900-\u097F]+)", cleaned, re.IGNORECASE)
    if name_match and name_match.group(1).lower() not in ["a", "the", "working", "a", "an"]:
        result["full_name"] = name_match.group(1).title()

    # Extract Goal & Interest
    if "boutique" in lower_cleaned or "garment" in lower_cleaned or "fashion" in lower_cleaned:
        result["career_goal"] = "Open Boutique"
        result["interest"] = "Fashion Design & Garment Production"
    elif "organic" in lower_cleaned or "agri" in lower_cleaned:
        result["career_goal"] = "Organic Farming & Agri Business"
        result["interest"] = "Organic Farming"
    elif "solar" in lower_cleaned:
        result["career_goal"] = "Solar Panel Installation"
        result["interest"] = "Renewable Energy"
    elif "fleet" in lower_cleaned or "logistics" in lower_cleaned:
        result["career_goal"] = "Fleet Management"
        result["interest"] = "Commercial Transport"
    elif "python" in lower_cleaned or "ai" in lower_cleaned or "web" in lower_cleaned or "software" in lower_cleaned:
        result["career_goal"] = "Software Development & AI"
        result["interest"] = "Web & AI Technologies"
    elif "salon" in lower_cleaned or "beauty" in lower_cleaned:
        result["career_goal"] = "Salon Management"
        result["interest"] = "Cosmetology & Beauty Therapy"
    elif "furniture" in lower_cleaned or "wood" in lower_cleaned:
        result["career_goal"] = "Furniture Manufacturing"
        result["interest"] = "Wood Technology"
    else:
        goal_patterns = [
            (["boutique", "garment", "fashion", "design", "ஆடை"], "Open Boutique"),
            (["organic", "agri business", "farm", "இயற்கை"], "Organic Farming & Agri Business"),
            (["solar", "industrial electrician", "सोलर"], "Solar Energy & Electrical"),
            (["logistics", "fleet", "warehouse", "டிரைவிங்"], "Logistics & Fleet Management"),
            (["web", "python", "software", "ai", "data", "மென்பொருள்"], "Web Development & Software"),
            (["salon", "beauty therapy", "அழகு"], "Beauty Therapy & Salon Management"),
            (["furniture", "woodwork", "மர சாமான்கள்"], "Furniture Manufacturing"),
            (["patient care", "hospital", "மருத்துவம்"], "Healthcare & Patient Care"),
            (["auto repair", "servicing", "வண்டி ремонт"], "Automotive Servicing"),
            (["aquaculture", "fish farm", "மீன்"], "Aquaculture & Fisheries")
        ]
        for keys, label in goal_patterns:
            if any(k in lower_cleaned for k in keys):
                result["career_goal"] = label
                result["interest"] = label
                break

    if not result["career_goal"] and result["current_livelihood"]:
        result["career_goal"] = f"Advanced {result['current_livelihood']}"
        result["interest"] = result["current_livelihood"]

    # Extract Skills
    skills_map = [
        ("sewing", "Sewing"), ("stitching", "Stitching"), ("farming", "Farming"),
        ("wiring", "Wiring"), ("driving", "Driving"), ("coding", "Coding"),
        ("python", "Python"), ("makeup", "Makeup"), ("woodwork", "Woodwork"),
        ("nursing", "Patient Care"), ("mechanic", "Auto Repair"), ("fishing", "Aquaculture")
    ]
    for key, label in skills_map:
        if key in lower_cleaned:
            result["skills"].append(label)

    return canonicalize_profile(result)
