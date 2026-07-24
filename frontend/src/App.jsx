import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import JobRecommendation from "./pages/JobRecommendation";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AddJob from "./pages/AddJob";
import AdminLogin from "./pages/AdminLogin";

import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/analysis" element={<ResumeAnalysis />} />
        <Route path="/jobs" element={<JobRecommendation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </>
  );
}

export default App;