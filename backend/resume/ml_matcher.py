"""
ML-based resume/job matching.

Uses TF-IDF (Term Frequency - Inverse Document Frequency) vectorization
and cosine similarity to measure how semantically close the full resume
text is to each job's profile — this catches relevant context the
rule-based skill list can miss (e.g. "built REST APIs with Django and
deployed on AWS" reads as strongly Python/backend/cloud-relevant even
if a specific skill keyword is phrased slightly differently).

This is intentionally a classic, lightweight, explainable ML technique
(no external model download, no GPU, trains instantly at request time)
which fits an academic project's scope while still being genuine ML/NLP.

Graceful degradation: if scikit-learn isn't installed, HAS_SKLEARN is
False and recommendation.py falls back to pure rule-based skill overlap.
"""

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def build_job_document(job):
    """Turn a job's title + skill list into a text 'document' for TF-IDF."""
    title_repeated = (job["title"] + " ") * 3  # weight the title a bit more
    return title_repeated + " ".join(job["skills"])


def compute_similarities(resume_text, jobs):
    """
    Returns a dict {job_title: similarity_score_0_to_1}.
    Falls back to all-zero similarities if sklearn isn't available or
    the resume text is too short/empty to vectorize meaningfully.
    """
    if not HAS_SKLEARN or not resume_text or not resume_text.strip():
        return {job["title"]: 0.0 for job in jobs}

    documents = [resume_text] + [build_job_document(job) for job in jobs]

    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
        tfidf_matrix = vectorizer.fit_transform(documents)
    except ValueError:
        # Happens if the vocabulary ends up empty (e.g. resume is all numbers/symbols)
        return {job["title"]: 0.0 for job in jobs}

    resume_vector = tfidf_matrix[0:1]
    job_vectors = tfidf_matrix[1:]
    scores = cosine_similarity(resume_vector, job_vectors).flatten()

    return {job["title"]: float(score) for job, score in zip(jobs, scores)}
