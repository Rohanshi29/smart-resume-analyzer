import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple Admin Login
    if (
      admin.username === "admin" &&
      admin.password === "admin123"
    ) {
      alert("Admin Login Successful");
      navigate("/admin");
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Admin Login</h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={admin.username}
              onChange={handleChange}
              placeholder="Enter Username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={admin.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </div>

          <button className="btn btn-primary w-100">
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminLogin;