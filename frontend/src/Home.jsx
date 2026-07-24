import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "./api/axios";

function Home() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios
      .get("/")
      .then((res) => {
        setMsg(res.data.message || "Smart Resume Analyzer");
      })
      .catch((err) => console.log(err));
  }, []);

  // small button styles (keeps buttons visible even if you don't use Bootstrap)
  const btnBase = {
    display: "inline-block",
    padding: "6px 12px",
    marginLeft: 8,
    borderRadius: 6,
    textDecoration: "none",
    fontSize: 14,
    cursor: "pointer",
  };

  const loginStyle = {
    ...btnBase,
    color: "#0b5ed7",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(11,93,215,0.2)",
  };

  const registerStyle = {
    ...btnBase,
    color: "#fff",
    background: "#0b5ed7",
    border: "1px solid #0b5ed7",
  };

  const HEADER_HEIGHT = 64;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* fixed header (top-right buttons) */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 10000,
          background: "transparent", // change to 'rgba(0,0,0,0.3)' or '#fff' as needed
          pointerEvents: "auto",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 600 }}>
          Smart Resume Analyzer
        </div>

        <div>
          <Link to="/login" style={loginStyle}>
            Login
          </Link>
          <Link to="/register" style={registerStyle}>
            Register
          </Link>
        </div>
      </header>

      {/* main content pushed down so header doesn't overlap */}
      <main style={{ paddingTop: HEADER_HEIGHT + 20, textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 48 }}>{msg}</h1>
        {/* rest of your home content below */}
      </main>
    </div>
  );
}

export default Home;