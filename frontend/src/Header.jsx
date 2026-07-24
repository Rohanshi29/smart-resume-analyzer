import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      id="app-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 99999,
      }}
    >
      <div style={{ fontWeight: 700 }}>Smart Resume Analyzer</div>

      <div>
        <Link to="/login" style={{ color: "#fff", marginRight: 12, textDecoration: "none" }}>
          Login
        </Link>
        <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>
          Register
        </Link>
      </div>
    </header>
  );
}