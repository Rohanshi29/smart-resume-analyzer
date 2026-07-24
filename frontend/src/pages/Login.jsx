import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{4,6}$/.test(formData.password)) {
      setMessage("Password must be 4 to 6 digits only.");
      return;
    }

    try {
      const response = await api.post("users/login/", formData);
      const data = response.data;

      // Backend now always returns { token, user } on success.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      if (error.response?.status === 404) {
        alert("User not found. Please register first.");
        navigate("/register");
      } else if (error.response?.status === 401) {
        alert("Incorrect Password");
      } else {
        alert("Server Error");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-eyebrow">Welcome back</p>
        <h2 className="auth-title">Log in</h2>

        {message && <div className="auth-message">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="Enter 4–6 digit PIN"
              value={formData.password}
              maxLength={6}
              pattern="[0-9]{4,6}"
              onChange={(e) => {
                const value = e.target.value;

                // Allow only digits and maximum 6 digits
                if (/^\d{0,6}$/.test(value)) {
                  setFormData({
                    ...formData,
                    password: value,
                  });
                }
              }}
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Log in
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
