"""
ATS scoring.

Real ATS (Applicant Tracking System) screening tools check several
independent things, not just "does a field exist". This scorer mirrors
that by weighting several factors and returning a breakdown, so a
resume with 1 skill and no sections scores very differently from one
with 12 relevant skills and a proper structure.

Weights (sum to 100):
  Contact Info        10
  Structure/Sections   20
  Skills (technical)   35
  Education            10
  Experience           15
  Length/Formatting    10
"""

TOTAL_SECTIONS = 7          # matches len(SECTION_PATTERNS) in parser.py
FULL_MARKS_SKILL_COUNT = 12  # skill count that earns full marks in that category
IDEAL_WORD_RANGE = (300, 1200)


def _score_contact(data):
    score = 0
    if data.get("email"):
        score += 5
    if data.get("phone"):
        score += 3
    if data.get("linkedin") or data.get("github"):
        score += 2
    return min(score, 10)


def _score_structure(data):
    found = len(data.get("sections_found", []))
    return round((found / TOTAL_SECTIONS) * 20, 1)


def _score_skills(data):
    count = len(data.get("skills", []))
    score = (count / FULL_MARKS_SKILL_COUNT) * 35
    # small bonus for soft skills, capped so it can't replace technical skills
    score += min(len(data.get("soft_skills", [])), 3) * 1
    return round(min(score, 35), 1)


def _score_education(data):
    return 10 if data.get("education") else 0


def _score_experience(data):
    years = data.get("experience_years", 0) or 0
    if years >= 3:
        return 15
    if years >= 1:
        return 10
    if years > 0:
        return 6
    return 0


def _score_length(data):
    words = data.get("word_count", 0) or 0
    low, high = IDEAL_WORD_RANGE
    if low <= words <= high:
        return 10
    if words < low:
        # too short: linear ramp up to 10
        return round(max(words / low, 0) * 10, 1)
    # too long: mild penalty, floor at 5
    overflow = words - high
    return round(max(10 - (overflow / 200), 5), 1)


def calculate_ats(data):
    breakdown = {
        "contact_info": _score_contact(data),
        "structure": _score_structure(data),
        "skills": _score_skills(data),
        "education": _score_education(data),
        "experience": _score_experience(data),
        "length_formatting": _score_length(data),
    }

    total = round(sum(breakdown.values()))
    total = max(0, min(total, 100))

    suggestions = []
    if breakdown["contact_info"] < 10:
        suggestions.append("Add a professional email, phone number, and LinkedIn/GitHub link.")
    if breakdown["structure"] < 14:
        missing = TOTAL_SECTIONS - len(data.get("sections_found", []))
        suggestions.append(f"Add clear section headers — {missing} standard section(s) (e.g. Skills, Projects, Experience) weren't detected.")
    if breakdown["skills"] < 20:
        suggestions.append("List more relevant technical skills explicitly (as a dedicated Skills section), not just mentioned in passing.")
    if breakdown["education"] == 0:
        suggestions.append("Clearly state your degree (e.g. B.Tech, BCA, M.Sc) in an Education section.")
    if breakdown["experience"] == 0:
        suggestions.append("Add internships, projects with dates, or work experience to show applied experience.")
    if breakdown["length_formatting"] < 8:
        suggestions.append("Resume length looks off — aim for roughly 300–1200 words for good ATS parsing.")

    return {
        "total_score": total,
        "breakdown": breakdown,
        "suggestions": suggestions,
    }
