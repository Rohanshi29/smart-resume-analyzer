import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Home.css";



const PIPELINE = [
  {
    step: "01",
    key: "parse",
    title: "Parse",
    description:
      "We read your resume the way an ATS does — pulling out sections, dates, and skills, not just words on a page.",
  },
  {
    step: "02",
    key: "score",
    title: "Score",
    description:
      "Get a clear ATS compatibility score, plus the specific formatting and keyword gaps holding it down.",
  },
  {
    step: "03",
    key: "match",
    title: "Match",
    description:
      "See roles that fit your actual experience, ranked by how closely your resume already lines up.",
  },
  {
    step: "04",
    key: "track",
    title: "Track",
    description:
      "Watch your score improve as you edit, and keep a history of every version you've analyzed.",
  },
];

const SCAN_TAGS = [
  { key: "skills", label: "Skills detected", value: "12", delay: 0 },
  { key: "experience", label: "Experience", value: "4 yrs", delay: 1 },
  { key: "score", label: "ATS score", value: "87%", delay: 2 },
];

function Home() {
  const [backendReady, setBackendReady] = useState(false);
  const navigate = useNavigate();

  const handleUploadClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/upload");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    axios
      .get("/")
      .then(() => setBackendReady(true))
      .catch(() => setBackendReady(false));
  }, []);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Smart Resume Analyzer</p>
            <h1 className="home-headline">
              Know what the machine sees
              <br />
              before the human does.
            </h1>
            <p className="home-subtext">
              Upload your resume and get an ATS compatibility score, targeted
              fixes, and job matches ranked to your actual experience — in
              under a minute.
            </p>
            <div className="home-cta-row">
              <button onClick={handleUploadClick} className="home-btn home-btn-primary">
                Upload resume
              </button>
              <a href="#how-it-works" className="home-btn home-btn-ghost">
                See how scoring works
              </a>
            </div>
            <div className="home-status">
              <span
                className={
                  "home-status-dot" + (backendReady ? " is-online" : "")
                }
              />
              {backendReady ? "Analyzer online" : "Connecting to analyzer…"}
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-doc">
              <div className="home-doc-scanbeam" />
              <div className="home-doc-line home-doc-line--title" />
              <div className="home-doc-line" />
              <div className="home-doc-line" />
              <div className="home-doc-line home-doc-line--short" />
              <div className="home-doc-line" />
              <div className="home-doc-line home-doc-line--short" />
              <div className="home-doc-line" />

              <div className="home-doc-tags">
                {SCAN_TAGS.map((tag) => (
                  <div
                    key={tag.key}
                    className="home-doc-tag"
                    style={{ animationDelay: `${0.6 + tag.delay * 0.5}s` }}
                  >
                    <span className="home-doc-tag-label">{tag.label}</span>
                    <span className="home-doc-tag-value">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-pipeline" id="how-it-works">
        <p className="home-eyebrow home-eyebrow--dark">How it works</p>
        <h2 className="home-section-title">
          One upload, four passes over your resume.
        </h2>

        <div className="home-pipeline-grid">
          {PIPELINE.map((item) => (
            <div className="home-pipeline-card" key={item.key}>
              <span className="home-pipeline-step">{item.step}</span>
              <h3 className="home-pipeline-title">{item.title}</h3>
              <p className="home-pipeline-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta-strip">
        <h2>Ready to see your score?</h2>
        <p>
          It takes about a minute, and you'll see exactly what to fix first.
        </p>
        <button onClick={handleUploadClick} className="home-btn home-btn-primary">
          Upload resume
        </button>
      </section>
    </div>
  );
}

export default Home;
