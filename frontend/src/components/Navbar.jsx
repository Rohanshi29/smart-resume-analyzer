// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const HEADER_HEIGHT = 64;

export default function Navbar() {
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div
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
          zIndex: 9999,
          background: "rgba(0,0,0,0.55)", // semi-transparent for dark hero; change to '#fff' for light header
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>Smart Resume Analyzer</div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ color: "#fff", marginRight: 12 }}>{user?.email}</span>
              <button
                onClick={handleLogout}
                style={{
                  marginRight: 8,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(8, 7, 7, 0.2)",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
              <Link
                to="/profile"
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#fff",
                  color: "#000",
                  textDecoration: "none",
                }}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "transparent",
                  color: "#fff",
                  textDecoration: "none",
                  border: "1px solid rgba(9, 9, 9, 0.2)",
                  marginRight: 8,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                 background: "transparent",
                  color: "#fff",
                  textDecoration: "none",
                  border: "1px solid rgba(9, 9, 9, 0.2)",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* spacer so page content isn't hidden behind fixed header */}
      <div style={{ height: HEADER_HEIGHT }} />
    </>
  );
}