from __future__ import annotations
import re

def normalize_skills(skills):
    normalized = []
    for skill in (skills or []):
        text = str(skill).strip().lower()
        if text:
            normalized.append(text)
    return normalized


def generate_skill_gaps(profile, target_goal=None):
    profile_skills = set(normalize_skills(profile.get("skills") or []))
    
    target = str(target_goal or profile.get("career_goal") or profile.get("interest") or profile.get("current_livelihood") or "").strip()
    if not target:
        return []

    required_skills_map = {
        "food": ["Food safety", "Packaging", "Food processing", "Quality handling", "Entrepreneurship"],
        "tailor": ["Pattern drafting", "Garment cutting", "Overlock machine operation", "Quality inspection"],
        "fashion": ["Fashion sketching", "Pattern drafting", "Fabric grading", "Garment styling"],
        "garment": ["Garment manufacturing", "Single needle stitching", "Thread tensioning"],
        
        "farmer": ["Organic composting", "Drip irrigation scheduling", "Bio-pesticide preparation", "Soil testing"],
        "agriculture": ["Farm business planning", "Post-harvest handling", "Organic crop management", "Drip irrigation"],
        "organic": ["Organic soil management", "Bio-fertilizer preparation", "Organic certification process"],
        
        "electrician": ["Industrial circuit wiring", "PLC panel troubleshooting", "Multimeter testing", "Solar PV wiring"],
        "solar": ["Rooftop solar mounting", "PV inverter wiring", "Battery storage setup", "Solar cell testing"],
        "electrical": ["House wiring", "Circuit breaker testing", "Conduit laying", "Transformer safety"],
        
        "driver": ["Heavy vehicle defensive driving", "GPS logistics navigation", "Cargo securing", "Fleet dispatch"],
        "logistics": ["Barcode scanning", "Warehouse inventory tracking", "Forklift safety"],
        "warehouse": ["Stock counting", "Pallet stacking", "Dispatch management"],
        
        "computer": ["HTML5 & CSS3 Coding", "JavaScript ES6", "Python Programming", "Data Analytics"],
        "web": ["Frontend responsive design", "JavaScript Frameworks", "API Integration"],
        "python": ["Python syntax & Data Automation", "File handling & SQL", "Data preprocessing"],
        "data": ["Advanced Excel & SQL Queries", "Data visualization", "Dashboard creation"],
        "ai": ["Prompt engineering", "Machine learning basics", "Data preprocessing"]
    }

    target_lower = target.lower()
    matched_gaps = []

    for key, skills in required_skills_map.items():
        if key in target_lower:
            for s in skills:
                if s.lower() not in profile_skills:
                    matched_gaps.append(s)

    if not matched_gaps:
        words = [w for w in re.split(r'\W+', target) if len(w) > 2]
        if words:
            matched_gaps = [
                f"Advanced competency in {words[0].capitalize()}",
                "Practical industry safety standards",
                "Quality control and certification",
                "Digital tool usage and record keeping"
            ]
        else:
            matched_gaps = [
                "Industry certified competency training",
                "Quality handling & safety practice"
            ]

    final_gaps = []
    for gap in matched_gaps:
        if gap.lower() not in profile_skills:
            final_gaps.append(gap)

    return final_gaps[:5]
