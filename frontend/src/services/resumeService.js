import api from "../api/axios";

// Uploads the resume file and returns the analysis (ATS score + recommended jobs)
// in the same response.
export const uploadResume = (formData, headers) =>
  api.post("/upload-resume/", formData, { headers });

// Re-fetch / re-run analysis for a resume that was already uploaded.
export const analyzeResume = (resumeId) =>
  api.get("resume/analyze/", { params: resumeId ? { resume_id: resumeId } : {} });