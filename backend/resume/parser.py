import os
import re
import pdfplumber
import docx


# ---------------------------------------------------------------------------
# Skill dictionary, grouped by category.
# Keys are the canonical skill name shown to the user; values are regex
# patterns used to search the resume text. Using explicit patterns (instead
# of a plain substring check) avoids false positives like the letter "R"
# matching inside the word "Developer", or "Go" matching inside "Google".
# ---------------------------------------------------------------------------
SKILL_PATTERNS = {
    # Programming languages
    "Python": r"\bpython\b",
    "Java": r"\bjava\b(?!script)",
    "JavaScript": r"\bjavascript\b|\bjs\b",
    "TypeScript": r"\btypescript\b",
    "C": r"\bc\b(?!\+\+|#)",
    "C++": r"c\+\+",
    "C#": r"c#",
    "PHP": r"\bphp\b",
    "R": r"\br\b(?=.{0,20}(programming|language|studio|stats|statistics))|\br-lang\b",
    "Go": r"\bgolang\b|\bgo\s+lang\b",
    "Kotlin": r"\bkotlin\b",
    "Swift": r"\bswift\b",
    "Ruby": r"\bruby\b",

    # Web / frontend
    "HTML": r"\bhtml5?\b",
    "CSS": r"\bcss3?\b",
    "React": r"\breact(\.js)?\b",
    "Angular": r"\bangular(js)?\b",
    "Vue.js": r"\bvue(\.js)?\b",
    "Bootstrap": r"\bbootstrap\b",
    "Tailwind CSS": r"\btailwind\b",
    "jQuery": r"\bjquery\b",
    "Redux": r"\bredux\b",
    "Next.js": r"\bnext\.?js\b",

    # Backend / frameworks
    "Django": r"\bdjango\b",
    "Django REST Framework": r"\bdjango\s*rest\s*framework\b|\bdrf\b",
    "Flask": r"\bflask\b",
    "Node.js": r"\bnode\.?js\b",
    "Express.js": r"\bexpress\.?js\b",
    "Spring Boot": r"\bspring\s*boot\b|\bspring\b",
    "ASP.NET": r"\basp\.net\b",
    "Laravel": r"\blaravel\b",
    "FastAPI": r"\bfastapi\b",

    # Databases
    "SQL": r"\bsql\b",
    "MySQL": r"\bmysql\b",
    "PostgreSQL": r"\bpostgresql\b|\bpostgres\b",
    "MongoDB": r"\bmongodb\b|\bmongo\b",
    "SQLite": r"\bsqlite\b",
    "Oracle DB": r"\boracle\s*(db|database)?\b",
    "Redis": r"\bredis\b",
    "Firebase": r"\bfirebase\b",

    # Data Science / ML / AI
    "Machine Learning": r"\bmachine\s*learning\b|\bml\b",
    "Deep Learning": r"\bdeep\s*learning\b",
    "Natural Language Processing": r"\bnlp\b|\bnatural\s*language\s*processing\b",
    "Computer Vision": r"\bcomputer\s*vision\b|\bopencv\b",
    "Pandas": r"\bpandas\b",
    "NumPy": r"\bnumpy\b",
    "Scikit-learn": r"\bscikit-?learn\b|\bsklearn\b",
    "TensorFlow": r"\btensorflow\b",
    "PyTorch": r"\bpytorch\b",
    "Keras": r"\bkeras\b",
    "Data Analysis": r"\bdata\s*analysis\b",
    "Data Visualization": r"\bdata\s*visuali[sz]ation\b|\btableau\b|\bpower\s*bi\b",
    "Power BI": r"\bpower\s*bi\b",
    "Tableau": r"\btableau\b",
    "Statistics": r"\bstatistics\b|\bstatistical\s*analysis\b",

    # Cloud / DevOps
    "AWS": r"\baws\b|\bamazon\s*web\s*services\b",
    "Microsoft Azure": r"\bazure\b",
    "Google Cloud Platform": r"\bgcp\b|\bgoogle\s*cloud\b",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "Jenkins": r"\bjenkins\b",
    "CI/CD": r"\bci\s*/\s*cd\b|\bci-cd\b|\bcontinuous\s*integration\b",
    "Linux": r"\blinux\b|\bunix\b",
    "Git": r"\bgit\b",
    "GitHub": r"\bgithub\b",
    "GitLab": r"\bgitlab\b",

    # Mobile
    "Android Development": r"\bandroid\b",
    "iOS Development": r"\bios\s*development\b|\bswiftui\b",
    "Flutter": r"\bflutter\b",
    "React Native": r"\breact\s*native\b",

    # Tools / other
    "REST API": r"\brest\s*api\b|\brestful\b",
    "GraphQL": r"\bgraphql\b",
    "Postman": r"\bpostman\b",
    "Figma": r"\bfigma\b",
    "Excel": r"\bms\s*excel\b|\bexcel\b",
    "Agile/Scrum": r"\bagile\b|\bscrum\b",
    "Data Structures & Algorithms": r"\bdata\s*structures?\b|\balgorithms?\b|\bdsa\b",
    "OOP": r"\boop\b|\bobject[\s-]oriented\b",
}

# Softer / transferable skills — checked separately since they're weighted
# differently in the ATS score (they support, but don't replace, technical fit).
SOFT_SKILL_PATTERNS = {
    "Communication": r"\bcommunication\b",
    "Teamwork": r"\bteam\s*work\b|\bteam\s*player\b",
    "Leadership": r"\bleadership\b",
    "Problem Solving": r"\bproblem[\s-]solving\b",
    "Time Management": r"\btime\s*management\b",
    "Critical Thinking": r"\bcritical\s*thinking\b",
    "Adaptability": r"\badaptability\b",
}

EDUCATION_PATTERNS = {
    "PhD": r"\bph\.?d\b|\bdoctorate\b",
    "M.Tech": r"\bm\.?\s*tech\b|\bmaster\s*of\s*technology\b",
    "M.E.": r"\bm\.?\s*e\.?\b(?=.{0,15}(engineering))",
    "MBA": r"\bmba\b|\bmaster\s*of\s*business\s*administration\b",
    "MCA": r"\bmca\b|\bmaster\s*of\s*computer\s*applications\b",
    "M.Sc": r"\bm\.?\s*sc\b|\bmaster\s*of\s*science\b",
    "M.Com": r"\bm\.?\s*com\b|\bmaster\s*of\s*commerce\b",
    "B.Tech": r"\bb\.?\s*tech\b|\bbachelor\s*of\s*technology\b",
    "B.E.": r"\bb\.?\s*e\.?\b(?=.{0,15}(engineering))",
    "BCA": r"\bbca\b|\bbachelor\s*of\s*computer\s*applications\b",
    "B.Sc": r"\bb\.?\s*sc\b|\bbachelor\s*of\s*science\b",
    "B.Com": r"\bb\.?\s*com\b|\bbachelor\s*of\s*commerce\b",
    "BBA": r"\bbba\b|\bbachelor\s*of\s*business\s*administration\b",
    "Diploma": r"\bdiploma\b",
    "HSC / 12th": r"\bhsc\b|\b12th\b|\bhigher\s*secondary\b",
    "SSC / 10th": r"\bssc\b|\b10th\b|\bsecondary\s*school\b",
}

SECTION_PATTERNS = {
    "Summary/Objective": r"\b(summary|objective|profile)\b",
    "Education": r"\beducation\b|\bacademic\b",
    "Experience": r"\bexperience\b|\binternship\b|\bwork\s*history\b",
    "Skills": r"\bskills\b|\btechnical\s*skills\b",
    "Projects": r"\bprojects?\b",
    "Certifications": r"\bcertifications?\b|\bcertificates?\b",
    "Achievements": r"\bachievements?\b|\bawards?\b",
}

NAME_STOPWORDS = {
    "resume", "curriculum vitae", "cv", "bio-data", "biodata",
    "personal details", "profile", "contact", "objective",
}


def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text


def extract_text_from_docx(file_path):
    document = docx.Document(file_path)
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext == ".doc":
        raise ValueError(
            "Legacy .doc files are not supported. Please upload .pdf or .docx."
        )
    else:
        raise ValueError(f"Unsupported resume file type: {ext}")


def _find_matches(text_lower, patterns_dict):
    found = []
    for label, pattern in patterns_dict.items():
        if re.search(pattern, text_lower, flags=re.IGNORECASE):
            found.append(label)
    return found


def _extract_name(lines):
    for line in lines[:10]:
        clean = line.strip()
        if not clean:
            continue
        if clean.lower() in NAME_STOPWORDS:
            continue
        if "@" in clean or re.search(r"\d{3,}", clean):
            continue
        words = clean.split()
        if 1 <= len(words) <= 4 and all(w.replace(".", "").isalpha() for w in words):
            return clean.title()
    return "Not Found"


def _extract_experience_years(text_lower):
    """Look for explicit 'X years of experience' style phrases."""
    matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience",
        text_lower,
    )
    if matches:
        return max(float(m) for m in matches)

    # Fallback: count date-range entries like "2021 - 2023" / "2022-Present"
    # as a rough proxy for work/internship history.
    ranges = re.findall(
        r"(19|20)\d{2}\s*(?:-|–|to)\s*((19|20)\d{2}|present|current)",
        text_lower,
    )
    return len(ranges)  # treated as "number of roles" rather than years


def parse_resume(file_path):
    text = extract_text(file_path)
    text_lower = text.lower()
    lines = [l for l in text.split("\n")]

    email = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone = re.findall(r"(?:\+91[-\s]?)?[6-9]\d{9}", text)
    linkedin = re.findall(r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s,]+", text_lower)
    github = re.findall(r"(?:https?://)?(?:www\.)?github\.com/[^\s,]+", text_lower)

    skills = _find_matches(text_lower, SKILL_PATTERNS)
    soft_skills = _find_matches(text_lower, SOFT_SKILL_PATTERNS)
    education = _find_matches(text_lower, EDUCATION_PATTERNS)
    sections_found = _find_matches(text_lower, SECTION_PATTERNS)

    name = _extract_name(lines)
    experience_years = _extract_experience_years(text_lower)
    word_count = len(text.split())

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "skills": skills,
        "soft_skills": soft_skills,
        "education": education,
        "sections_found": sections_found,
        "experience_years": experience_years,
        "word_count": word_count,
        "raw_text": text,
    }
