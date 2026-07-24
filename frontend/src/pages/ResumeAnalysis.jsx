import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { analyzeResume } from "../services/resumeService";
import "./ResumeAnalysis.css";

const BREAKDOWN_LABELS = {
  contact_info: "Contact Info",
  structure: "Resume Structure",
  skills: "Skills Match",
  education: "Education",
  experience: "Experience",
  length_formatting: "Length / Formatting",
};

const BREAKDOWN_MAX = {
  contact_info: 10,
  structure: 20,
  skills: 35,
  education: 10,
  experience: 15,
  length_formatting: 10,
};

function ResumeAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = location.state || null;

  const [resumeId] = useState(initial?.resumeId || null);
  const [resumeData, setResumeData] = useState(initial?.resumeData || null);
  const [atsScore, setAtsScore] = useState(initial?.atsScore || null);
  const [recommendedJobs, setRecommendedJobs] = useState(initial?.recommendedJobs || []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) return;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await analyzeResume(resumeId);
        setResumeData(res.data.resume_data);
        setAtsScore(res.data.ats_score);
        setRecommendedJobs(res.data.recommended_jobs);
      } catch (err) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Could not load resume analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="analysis-container">
        <div className="analysis-header">
          <h1 className="analysis-title">Resume Analysis</h1>
        </div>
        <div className="analysis-card">
          <div className="analysis-loading">
            <div className="spinner"></div>
            <p>Analyzing your resume...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-container">
        <div className="analysis-header">
          <h1 className="analysis-title">Resume Analysis</h1>
        </div>
        <div className="analysis-card">
          <div className="analysis-error">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/upload")}
            >
              Upload a Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData || !atsScore) {
    return (
      <div className="analysis-container">
        <div className="analysis-header">
          <h1 className="analysis-title">Resume Analysis</h1>
        </div>
        <div className="analysis-card">
          <p>No resume analyzed yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/upload")}
          >
            Upload a Resume
          </button>
        </div>
      </div>
    );
  }

  const isLegacyScore = typeof atsScore === "number";
  if (isLegacyScore) {
    return (
      <div className="analysis-container">
        <div className="analysis-header">
          <h1 className="analysis-title">Resume Analysis</h1>
        </div>
        <div className="analysis-card">
          <div className="analysis-warning">
            <p>Your backend is running an outdated version of <code>ats.py</code> / <code>recommendation.py</code>.</p>
            <p>Please replace them with the latest files and restart <code>python manage.py runserver</code>, then re-upload the resume.</p>
            <p className="legacy-score"><strong>ATS Score (legacy):</strong> {atsScore}/100</p>
          </div>
        </div>
      </div>
    );
  }

  const total = atsScore.total_score;

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        {/* Header */}
        <div className="analysis-header">
          <h1 className="analysis-title">Resume Analysis</h1>
          <div className="analysis-actions">
            <Link to="/" className="btn btn-outline">Back to Home</Link>
            <Link to="/upload" className="btn btn-primary">Add New Resume</Link>
          </div>
        </div>

        {/* Overall ATS Score Card */}
        <div className="analysis-card score-card">
          <div className="score-header">
            <h2 className="score-title">ATS Score</h2>
            <div className="score-display">{total}/100</div>
          </div>
          <div className="score-bar-container">
            <div className="score-bar">
              <div
                className="score-bar-fill"
                style={{ width: `${total}%` }}
              />
            </div>
            <p className="score-description">
              {total >= 80 ? "Excellent!" : total >= 60 ? "Good" : total >= 40 ? "Fair" : "Needs Improvement"}
            </p>
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="analysis-card">
          <h3 className="card-title">Score Breakdown</h3>
          <div className="breakdown-grid">
            {Object.entries(atsScore.breakdown).map(([key, value]) => (
              <div key={key} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">{BREAKDOWN_LABELS[key] || key}</span>
                  <span className="breakdown-score">{value}/{BREAKDOWN_MAX[key]}</span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-bar-fill"
                    style={{ width: `${(value / BREAKDOWN_MAX[key]) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Card */}
        {atsScore.suggestions?.length > 0 && (
          <div className="analysis-card">
            <h3 className="card-title">How to Improve Your Score</h3>
            <ul className="suggestions-list">
              {atsScore.suggestions.map((suggestion, i) => (
                <li key={i} className="suggestion-item">
                  <span className="suggestion-icon">→</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted Details Card */}
        <div className="analysis-card">
          <h3 className="card-title">Extracted Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label className="detail-label">Name</label>
              <p className="detail-value">{resumeData.name || "Not found"}</p>
            </div>
            <div className="detail-item">
              <label className="detail-label">Email</label>
              <p className="detail-value">{resumeData.email?.join(", ") || "Not found"}</p>
            </div>
            <div className="detail-item">
              <label className="detail-label">Phone</label>
              <p className="detail-value">{resumeData.phone?.join(", ") || "Not found"}</p>
            </div>
            <div className="detail-item">
              <label className="detail-label">Education</label>
              <p className="detail-value">{resumeData.education?.join(", ") || "Not found"}</p>
            </div>
            <div className="detail-item full-width">
              <label className="detail-label">Technical Skills</label>
              <p className="detail-value">
                {resumeData.skills?.length ? resumeData.skills.join(", ") : "None detected"}
              </p>
            </div>
            <div className="detail-item full-width">
              <label className="detail-label">Soft Skills</label>
              <p className="detail-value">
                {resumeData.soft_skills?.length ? resumeData.soft_skills.join(", ") : "None detected"}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Jobs Card */}
        <div className="analysis-card">
          <h3 className="card-title">Recommended Jobs</h3>
          {recommendedJobs.length === 0 ? (
            <p className="no-matches">No strong matches yet — try adding more relevant skills to your resume.</p>
          ) : (
            <div className="jobs-list">
              {recommendedJobs.map((job) => (
                <div key={job.title} className="job-item">
                  <div className="job-header">
                    <h4 className="job-title">{job.title}</h4>
                    <span className="job-match-badge">{job.match_percent ?? "N/A"}% match</span>
                  </div>
                  <div className="job-bar">
                    <div
                      className="job-bar-fill"
                      style={{ width: `${job.match_percent ?? 0}%` }}
                    />
                  </div>
                  {(job.skill_overlap_percent !== undefined || job.ml_similarity_percent !== undefined) && (
                    <p className="job-metrics">
                      Skill match: {job.skill_overlap_percent ?? "N/A"}% &middot; ML similarity: {job.ml_similarity_percent ?? "N/A"}%
                    </p>
                  )}
                  <div className="job-skills">
                    {job.matched_skills?.length > 0 && (
                      <p>
                        <strong>Matched:</strong> {job.matched_skills.join(", ")}
                      </p>
                    )}
                    {job.missing_skills?.length > 0 && (
                      <p className="missing-skills">
                        <strong>Missing:</strong> {job.missing_skills.join(", ")}
                      </p>
                    )}
                  </div>
                  {job.companies && (
                    <p className="job-companies">
                      <strong>Companies:</strong> {job.companies.join(", ") || "N/A"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;
