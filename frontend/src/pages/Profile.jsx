import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getCurrentDate = () => {
    const today = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return today.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.memberSince = getCurrentDate();
        setUser(userData);
        setFormData({
          email: userData.email || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setMessage("Email is required");
      setMessageType("error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Since there's no backend endpoint, we'll just update localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.location.reload();
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update profile");
      setMessageType("error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match");
      setMessageType("error");
      return;
    }

    if (passwordData.newPassword.length < 4) {
      setMessage("Password must be at least 4 characters");
      setMessageType("error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "users/change-password/",
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setMessage("Password changed successfully!");
      setMessageType("success");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangePasswordMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to change password";
      setMessage(errMsg);
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="spinner-profile"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        {message && (
          <div className={`profile-message profile-message-${messageType}`}>
            {message}
          </div>
        )}

        {/* Profile Info Card */}
        {!editMode && !changePasswordMode && (
          <div className="profile-card">
            <div className="profile-info-section">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {(user?.email?.charAt(0) || "U").toUpperCase()}
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user?.email || "Not set"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {user?.memberSince || getCurrentDate()}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
              <button
                className="action-btn password-btn"
                onClick={() => setChangePasswordMode(true)}
              >
                Change Password
              </button>
              <button className="action-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Form */}
        {editMode && (
          <div className="profile-card">
            <h2 className="form-title">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      email: user?.email || "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Form */}
        {changePasswordMode && (
          <div className="profile-card">
            <h2 className="form-title">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  className="form-input"
                  placeholder="Enter 4-6 digit PIN"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-input"
                  placeholder="Enter 4-6 digit PIN"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter 4-6 digit PIN"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  maxLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setChangePasswordMode(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
