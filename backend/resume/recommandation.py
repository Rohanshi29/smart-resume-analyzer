def recommend_jobs(skills):

    jobs = [

        {
            "title": "Python Developer",
            "skills": ["Python", "Django", "SQL"]
        },

        {
            "title": "Frontend Developer",
            "skills": ["HTML", "CSS", "JavaScript", "React"]
        },

        {
            "title": "Full Stack Developer",
            "skills": ["Python", "React", "MySQL"]
        }

    ]

    recommended = []

    for job in jobs:

        match = 0

        for skill in job["skills"]:

            if skill in skills:
                match += 1

        if match >= 2:
            recommended.append(job)

    return recommended