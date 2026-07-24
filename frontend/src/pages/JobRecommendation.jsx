import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

function JobRecommendation() {
  const location = useLocation();
  const [recommendedJobs] = useState(location.state?.recommendedJobs || []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Recommended Jobs</h2>
        <div>
          <Link to="/" className="btn btn-outline-secondary me-2">Back to Home</Link>
          <Link to="/upload" className="btn btn-primary">Add New Resume</Link>
        </div>
      </div>

      {recommendedJobs.length === 0 ? (
        <p>
          No job recommendations yet. Upload a resume first from the{" "}
          <a href="/upload">Upload page</a> to see personalized matches.
        </p>
      ) : (
        recommendedJobs.map((job) => (
          <div key={job.title} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5 className="card-title">{job.title}</h5>
                <span className="badge bg-success align-self-start">{job.match_percent}% match</span>
              </div>
              <p className="mb-1">
                <strong>Matched skills:</strong>{" "}
                {job.matched_skills.length ? job.matched_skills.join(", ") : "None"}
              </p>
              {job.missing_skills.length > 0 && (
                <p className="mb-1 text-muted">
                  <strong>Skills to add:</strong> {job.missing_skills.join(", ")}
                </p>
              )}
              <p className="mb-0">
                <strong>Companies known to hire for this role:</strong>{" "}
                {job.companies.join(", ")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default JobRecommendation;
