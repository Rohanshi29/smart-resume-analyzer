import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./UploadResume.css";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a resume.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      await api.post(
        "resume/upload-resume/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Resume uploaded successfully!");
      navigate("/analysis");

    } catch (err) {
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1 className="upload-title">Upload Resume</h1>
          <p className="upload-subtitle">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {message && (
          <div className={`upload-message upload-message-${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-field">
            <label htmlFor="file-input" className="file-upload-label">
              <div className="file-upload-area">
                <svg
                  className="file-upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div className="file-upload-text">
                  <p className="file-upload-main">
                    {file ? (
                      <>
                        <span className="file-selected">✓</span>
                        {file.name}
                      </>
                    ) : (
                      "Click to upload or drag and drop"
                    )}
                  </p>
                  <p className="file-upload-sub">
                    {file && (
                      <div className="file-info">
                        <span>✓ {file.name}</span>
                        <p className="file-size">{formatFileSize(file.size)}</p>
                      </div>
                    )}
                  </p>
                </div>
              </div>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            className={`upload-button ${loading ? "loading" : ""} ${file ? "has-file" : ""
              }`}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Analyzing...
              </>
            ) : (
              "Submit Resume"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadResume;
