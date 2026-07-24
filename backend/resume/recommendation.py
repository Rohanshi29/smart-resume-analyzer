"""
Job recommendation engine.

Each job lists the skills it typically requires, plus a sample of
companies known to hire for that role (for context — this is not a
live job-listing feed, just illustrative of the kind of company that
hires for this profile).

Matching is percentage-based: (matched skills / required skills) * 100,
so recommendations are ranked by genuine fit instead of a fixed
"has >= 2 skills" cutoff.
"""

from .ml_matcher import compute_similarities, HAS_SKLEARN

JOBS = [
    {
        "title": "Python Developer",
        "skills": ["Python", "Django", "Flask", "SQL", "REST API", "Git"],
        "companies": ["TCS", "Infosys", "Wipro", "Zoho", "Amazon"],
    },
    {
        "title": "Frontend Developer",
        "skills": ["HTML", "CSS", "JavaScript", "React", "Bootstrap", "Redux"],
        "companies": ["Accenture", "Freshworks", "Swiggy", "Flipkart", "Razorpay"],
    },
    {
        "title": "Full Stack Developer",
        "skills": ["Python", "JavaScript", "React", "Django", "Node.js", "MongoDB", "SQL"],
        "companies": ["Infosys", "TCS", "Zoho", "Postman", "Cred"],
    },
    {
        "title": "Backend Developer",
        "skills": ["Python", "Java", "Django", "Node.js", "SQL", "MongoDB", "REST API", "Docker"],
        "companies": ["Amazon", "Flipkart", "Paytm", "Ola", "Infosys"],
    },
    {
        "title": "Java Developer",
        "skills": ["Java", "Spring Boot", "SQL", "OOP", "Git", "REST API"],
        "companies": ["TCS", "Infosys", "Cognizant", "Capgemini", "IBM"],
    },
    {
        "title": "Data Analyst",
        "skills": ["SQL", "Excel", "Python", "Data Analysis", "Data Visualization", "Power BI", "Tableau", "Statistics"],
        "companies": ["Deloitte", "EY", "Accenture", "Mu Sigma", "Flipkart"],
    },
    {
        "title": "Data Scientist",
        "skills": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Statistics", "SQL", "Data Visualization"],
        "companies": ["Fractal Analytics", "Mu Sigma", "Amazon", "Microsoft", "Swiggy"],
    },
    {
        "title": "Machine Learning Engineer",
        "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NumPy", "Scikit-learn"],
        "companies": ["NVIDIA", "Microsoft", "Google", "Fractal Analytics", "Amazon"],
    },
    {
        "title": "DevOps Engineer",
        "skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "CI/CD", "Linux", "Git"],
        "companies": ["Amazon", "Infosys", "Wipro", "Freshworks", "Zoho"],
    },
    {
        "title": "Cloud Engineer",
        "skills": ["AWS", "Microsoft Azure", "Google Cloud Platform", "Linux", "Docker", "Kubernetes"],
        "companies": ["TCS", "Accenture", "IBM", "Wipro", "Capgemini"],
    },
    {
        "title": "Android Developer",
        "skills": ["Android Development", "Java", "Kotlin", "Git", "REST API"],
        "companies": ["Flipkart", "Swiggy", "PhonePe", "Ola", "Paytm"],
    },
    {
        "title": "Mobile App Developer (Cross-platform)",
        "skills": ["Flutter", "React Native", "JavaScript", "REST API", "Git"],
        "companies": ["Zomato", "Meesho", "CRED", "Razorpay", "Freshworks"],
    },
    {
        "title": "QA / Test Engineer",
        "skills": ["Python", "SQL", "Postman", "Agile/Scrum", "Git"],
        "companies": ["TCS", "Infosys", "Cognizant", "Capgemini", "HCL"],
    },
    {
        "title": "Database Administrator",
        "skills": ["SQL", "MySQL", "PostgreSQL", "Oracle DB", "MongoDB"],
        "companies": ["Oracle", "TCS", "Infosys", "IBM", "Wipro"],
    },
    {
        "title": "UI/UX Designer",
        "skills": ["Figma", "HTML", "CSS", "Communication"],
        "companies": ["Swiggy", "Zomato", "Freshworks", "CRED", "Razorpay"],
    },
    {
        "title": "Business/Data Analyst (Non-tech track)",
        "skills": ["Excel", "SQL", "Data Analysis", "Communication", "Critical Thinking"],
        "companies": ["Deloitte", "EY", "KPMG", "PwC", "Accenture"],
    },
]

MIN_MATCH_PERCENT = 20  # below this, a role isn't a meaningful match
MAX_RECOMMENDATIONS = 6

# How much weight the rule-based skill-overlap % gets vs the ML (TF-IDF
# cosine similarity) score, when combining them into one ranking score.
SKILL_OVERLAP_WEIGHT = 0.6
ML_SIMILARITY_WEIGHT = 0.4


def recommend_jobs(skills, resume_text=""):
    candidate_skills = set(skills)
    ml_scores = compute_similarities(resume_text, JOBS)  # {title: 0.0-1.0}

    scored = []

    for job in JOBS:
        required = set(job["skills"])
        matched = sorted(required & candidate_skills)
        missing = sorted(required - candidate_skills)
        skill_overlap_percent = round((len(matched) / len(required)) * 100, 1) if required else 0

        ml_similarity = ml_scores.get(job["title"], 0.0)
        ml_similarity_percent = round(ml_similarity * 100, 1)

        combined_percent = round(
            (skill_overlap_percent * SKILL_OVERLAP_WEIGHT)
            + (ml_similarity_percent * ML_SIMILARITY_WEIGHT),
            1,
        )

        if combined_percent >= MIN_MATCH_PERCENT:
            scored.append({
                "title": job["title"],
                "match_percent": combined_percent,
                "skill_overlap_percent": skill_overlap_percent,
                "ml_similarity_percent": ml_similarity_percent,
                "matched_skills": matched,
                "missing_skills": missing,
                "companies": job["companies"],
            })

    scored.sort(key=lambda j: j["match_percent"], reverse=True)
    return scored[:MAX_RECOMMENDATIONS]
