import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  FaUser,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCode,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaEdit,
  FaUpload,
  FaUserCircle,
  FaBriefcase,
  FaFileAlt,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaCamera,
  FaEye,
} from "react-icons/fa";

const EditFreelancerProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [errors, setErrors] = useState({});
  const [freelancer, setFreelancer] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    profilePicture: "",
    resume: "",
    resumeOriginalName: "",
  });

  const token = localStorage.getItem("token");

  // Redirect if not authenticated or not freelancer
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "freelancer") {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch freelancer profile on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === "freelancer") {
      fetchFreelancerProfile();
    }
  }, [isAuthenticated, user]);

  const fetchFreelancerProfile = async () => {
    try {
      setInitialLoading(true);
      console.log("🔄 Fetching freelancer profile...");

      const response = await axios.get(
        `http://localhost:8000/api/freelancers/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Freelancer profile fetched:", response.data);

      // Map the response data to our form structure
      const profileData = response.data.freelancer || response.data;
      setFreelancer({
        fullName: profileData.fullName || profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: profileData.location || profileData.address || "",
        bio: profileData.bio || profileData.about || "",
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        experience: profileData.experience || "",
        github: profileData.github || "",
        linkedin: profileData.linkedin || "",
        portfolio: profileData.portfolio || "",
        profilePicture: profileData.profilePicture || profileData.avatar || "",
        resume: profileData.resume || "",
        resumeOriginalName: profileData.resumeOriginalName || "",
      });
    } catch (err) {
      console.error("❌ Error fetching freelancer profile:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load profile data";
      alert(errorMessage);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFreelancer((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setFreelancer((prev) => ({ ...prev, skills: skillsArray }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploadingAvatar(true);
    try {
      console.log("🔄 Uploading profile picture...");

      const response = await axios.put(
        `http://localhost:8000/api/freelancers/upload/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Profile picture uploaded:", response.data);

      setFreelancer((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture || response.data.avatar,
      }));
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("❌ Profile picture upload failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to upload profile picture";
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max for resumes)
    if (file.size > 10 * 1024 * 1024) {
      alert("Resume file size must be less than 10MB");
      return;
    }

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF, DOC, or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploadingResume(true);
    try {
      console.log("🔄 Uploading resume...");

      const response = await axios.put(
        `http://localhost:8000/api/freelancers/upload/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Resume uploaded:", response.data);

      setFreelancer((prev) => ({
        ...prev,
        resume: response.data.resume,
        resumeOriginalName: response.data.resumeOriginalName || file.name,
      }));
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error("❌ Resume upload failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to upload resume";
      alert(errorMessage);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) {
      return;
    }

    try {
      console.log("🔄 Deleting resume...");

      await axios.delete(
        `http://localhost:8000/api/freelancers/upload/resume`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Resume deleted");

      setFreelancer((prev) => ({
        ...prev,
        resume: "",
        resumeOriginalName: "",
      }));
      alert("Resume deleted successfully!");
    } catch (err) {
      console.error("❌ Resume deletion failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete resume";
      alert(errorMessage);
    }
  };

  // Primary download resume function
  const downloadResume = async () => {
    if (!freelancer.resume) {
      alert("No resume available to download");
      return;
    }

    setDownloadingResume(true);
    try {
      console.log("🔄 Downloading resume...");

      const response = await axios({
        method: "GET",
        url: `http://localhost:8000/api/freelancers/download/resume`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for file downloads
        timeout: 30000, // 30 second timeout
      });

      console.log("✅ Resume response received:", {
        status: response.status,
        contentType: response.headers["content-type"],
        contentLength: response.headers["content-length"],
      });

      // Create blob link to download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Check if blob has content
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = freelancer.resumeOriginalName || "resume.pdf";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("✅ Resume downloaded successfully:", filename);
      alert(`Resume "${filename}" has been downloaded successfully!`);
    } catch (err) {
      console.error("❌ Resume download failed:", err);

      // More specific error handling
      if (err.code === "ECONNABORTED") {
        alert("Download timed out. Please try again.");
      } else if (err.response?.status === 404) {
        alert("Resume not found on server.");
      } else if (err.response?.status === 401) {
        alert("Authentication failed. Please login again.");
      } else {
        // Fallback: try direct URL download
        console.log("🔄 Trying fallback download method...");
        downloadResumeAlternative();
      }
    } finally {
      setDownloadingResume(false);
    }
  };

  // FIXED: Add the missing downloadResumeAlternative function
  const downloadResumeAlternative = () => {
    if (!freelancer.resume) {
      alert("No resume available to download");
      return;
    }

    try {
      console.log("🔄 Using alternative download method...");
      
      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = freelancer.resume;
      link.download = freelancer.resumeOriginalName || "resume.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      // Add to document temporarily
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      console.log("✅ Alternative download initiated");
      alert("Resume opened in new tab. You can download it from there if it didn't download automatically.");
    } catch (error) {
      console.error("❌ Alternative download also failed:", error);
      alert("Failed to download resume. Please try refreshing the page or contact support.");
    }
  };

  // View resume in new tab function
  const viewResumeInNewTab = () => {
    if (!freelancer.resume) {
      alert("No resume available to view");
      return;
    }

    try {
      window.open(freelancer.resume, '_blank', 'noopener,noreferrer');
      console.log("✅ Resume opened in new tab");
    } catch (error) {
      console.error("❌ Failed to open resume:", error);
      alert("Failed to open resume. Please try again.");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!freelancer.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (freelancer.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!freelancer.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancer.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      freelancer.phone &&
      !/^\d{10}$/.test(freelancer.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (
      freelancer.experience &&
      (isNaN(freelancer.experience) ||
        freelancer.experience < 0 ||
        freelancer.experience > 50)
    ) {
      newErrors.experience = "Experience must be a number between 0 and 50";
    }

    if (freelancer.github && !freelancer.github.includes("github.com")) {
      newErrors.github = "Please enter a valid GitHub URL";
    }

    if (freelancer.linkedin && !freelancer.linkedin.includes("linkedin.com")) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL";
    }

    if (freelancer.portfolio && !/^https?:\/\/.+/.test(freelancer.portfolio)) {
      newErrors.portfolio =
        "Please enter a valid portfolio URL (with http/https)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("🔄 Updating freelancer profile...");

      const updateData = {
        fullName: freelancer.fullName,
        email: freelancer.email,
        phone: freelancer.phone,
        location: freelancer.location,
        bio: freelancer.bio,
        skills: freelancer.skills,
        experience: freelancer.experience,
        github: freelancer.github,
        linkedin: freelancer.linkedin,
        portfolio: freelancer.portfolio,
      };

      const response = await axios.put(
        `http://localhost:8000/api/freelancers/update`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Profile updated successfully:", response.data);
      alert("Profile updated successfully!");
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 p-6 pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Dark Emerald Container */}
        <div className="bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-500/20 p-8 hover:shadow-emerald-500/20 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-emerald-400 transition-colors p-3 rounded-2xl hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40"
              title="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>

            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 shadow-lg mr-4 border border-emerald-500/30">
                <FaUser className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-200">
                  Edit Freelancer Profile
                </h1>
                <p className="text-gray-400">
                  Update your professional information
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-red-400 transition-colors p-3 rounded-2xl hover:bg-red-500/10 border border-emerald-500/20 hover:border-red-400/40"
              title="Cancel"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <FaUserCircle className="text-emerald-400" />
                Profile Picture
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={
                      freelancer.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        freelancer.fullName || "User"
                      )}&size=120&background=10b981&color=ffffff`
                    }
                    alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-500/30 shadow-2xl"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        freelancer.fullName || "User"
                      )}&size=120&background=10b981&color=ffffff`;
                    }}
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <FaSpinner className="animate-spin text-emerald-400 text-2xl" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 border-4 border-slate-800">
                    <FaCamera className="text-white text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 border border-emerald-500/30 flex items-center gap-2 w-fit">
                      <FaUpload />
                      {uploadingAvatar ? "Uploading..." : "Change Picture"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG up to 5MB. Recommended size: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Section - FIXED */}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-emerald-400" />
                Resume
              </h3>

              {freelancer.resume ? (
                <div className="bg-slate-600/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <FaFileAlt className="text-emerald-400 text-xl" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {freelancer.resumeOriginalName || "resume.pdf"}
                        </p>
                        <p className="text-gray-400 text-sm">Resume uploaded</p>
                        <p className="text-gray-500 text-xs">
                          Click download to save to your device
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* Primary Download Button */}
                      <button
                        type="button"
                        onClick={downloadResume}
                        disabled={downloadingResume}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30"
                        title="Download resume to your device"
                      >
                        {downloadingResume ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <FaDownload />
                            <span>Download</span>
                          </>
                        )}
                      </button>

                      {/* View Button - FIXED */}
                      <button
                        type="button"
                        onClick={viewResumeInNewTab}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30"
                        title="Open resume in new tab"
                      >
                        <FaEye />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResumeDelete}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                        title="Delete resume"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Resume Info */}
                  <div className="mt-3 p-3 bg-slate-700/30 rounded-lg border border-emerald-500/10">
                    <p className="text-xs text-gray-400">
                      💡 <strong>Download Tips:</strong>
                    </p>
                    <ul className="text-xs text-gray-400 mt-1 space-y-1">
                      <li>
                        • Click "Download" to save the file to your device
                      </li>
                      <li>• Click "View" to open in a new tab for preview</li>
                      <li>
                        • If download fails, try the "View" option instead
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-600/30 border-2 border-dashed border-emerald-500/30 rounded-xl p-8 text-center mb-4">
                  <FaFileAlt className="text-emerald-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No resume uploaded</p>
                  <p className="text-gray-400 text-sm">
                    Upload your resume to increase your chances
                  </p>
                </div>
              )}

              <label className="cursor-pointer">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 border border-blue-500/30 flex items-center gap-2 w-fit">
                  <FaUpload />
                  {uploadingResume ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>
                      {freelancer.resume ? "Replace Resume" : "Upload Resume"}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                />
              </label>
              <p className="text-sm text-gray-400 mt-2">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>

            {/* Personal Information */}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <FaEdit className="text-emerald-400" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaUser />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={freelancer.fullName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="Your full name"
                    maxLength="50"
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaEnvelope />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={freelancer.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaPhone />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={freelancer.phone || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="1234567890"
                    maxLength="15"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaBriefcase />
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={freelancer.experience || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="Years of experience"
                    min="0"
                    max="50"
                  />
                  {errors.experience && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.experience}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Location/Address
                </label>
                <input
                  type="text"
                  name="location"
                  value={freelancer.location || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                  placeholder="City, State, Country"
                  maxLength="100"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <FaBriefcase className="text-emerald-400" />
                Professional Information
              </h3>

              {/* Bio Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-emerald-400 mb-3">
                  Professional Summary
                </label>
                <textarea
                  name="bio"
                  value={freelancer.bio || ""}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300 resize-none"
                  placeholder="Tell us about yourself, your skills, experience, and what makes you unique as a freelancer..."
                  maxLength="1000"
                />
                <p className="text-xs text-gray-400 mt-2 bg-emerald-500/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/20">
                  💡 A compelling summary helps clients understand your
                  expertise and value
                </p>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <FaCode />
                  Skills & Technologies
                </label>
                <input
                  type="text"
                  value={freelancer.skills?.join(", ") || ""}
                  onChange={handleSkillsChange}
                  className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                  placeholder="JavaScript, React, Node.js, Python, MongoDB, etc."
                />
                <p className="text-xs text-gray-400 mt-2 bg-teal-500/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-teal-500/20">
                  ⚡ Separate skills with commas. Add both technical and soft
                  skills.
                </p>
                {/* Skills Preview */}
                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Skills Preview:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.slice(0, 10).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 10 && (
                        <span className="text-gray-400 text-sm px-3 py-1">
                          +{freelancer.skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links & Portfolio */}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <FaGlobe className="text-emerald-400" />
                Portfolio & Social Links
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaGithub />
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={freelancer.github || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="https://github.com/username"
                  />
                  {errors.github && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.github}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaLinkedin />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={freelancer.linkedin || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedin && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.linkedin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaGlobe />
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={freelancer.portfolio || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="https://yourportfolio.com"
                  />
                  {errors.portfolio && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.portfolio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-8 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-slate-700/60 hover:bg-slate-600/60 text-gray-300 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 hover:border-emerald-400/40 backdrop-blur-2xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingAvatar || uploadingResume}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 disabled:from-emerald-300 disabled:to-teal-300 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-500/30 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-2xl p-6 rounded-2xl border border-emerald-500/20">
            <h3 className="font-bold text-lg text-emerald-400 mb-3">
              💡 Profile Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Complete all sections to appear more professional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Use a professional profile picture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Upload your latest resume for better opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Showcase your best skills and experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Keep your portfolio links up to date</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFreelancerProfile;
