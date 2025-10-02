import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBuilding,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaBriefcase,
  FaDollarSign,
  FaCode,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    payPerHour: "",
    experienceLevel: "Entry Level",
  });

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Redirect if not company
  React.useEffect(() => {
    if (!token) {
      alert("Please login to post a job");
      navigate("/");
      return;
    }
    if (userRole !== "company") {
      alert("Only companies can post jobs");
      navigate("/");
      return;
    }
  }, [userRole, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!jobData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (jobData.title.trim().length < 5) {
      newErrors.title = "Job title must be at least 5 characters";
    }

    if (!jobData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (jobData.description.trim().length < 20) {
      newErrors.description = "Job description must be at least 20 characters";
    }

    if (!jobData.payPerHour) {
      newErrors.payPerHour = "Pay per hour is required";
    } else if (
      isNaN(jobData.payPerHour) ||
      parseFloat(jobData.payPerHour) <= 0
    ) {
      newErrors.payPerHour = "Please enter a valid hourly rate";
    } else if (parseFloat(jobData.payPerHour) > 1000) {
      newErrors.payPerHour =
        "Hourly rate seems to high. Please check the amount";
    }

    if (!jobData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const skillsArray = jobData.skillsRequired
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

      const postData = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        skillsRequired: skillsArray,
        skills: skillsArray, // Add this for backend compatibility
        salary: `$${parseFloat(jobData.payPerHour)}/hour`, // Convert payPerHour to salary
        payPerHour: parseFloat(jobData.payPerHour), // Keep original field too
        budget: `$${parseFloat(jobData.payPerHour)}/hour`, // Add budget field
        experienceLevel: jobData.experienceLevel,
        experience: jobData.experienceLevel.toLowerCase().replace(" level", ""), // Map to backend enum
        location: "Remote", // Add default location since it's required
        jobType: "freelance", // Add default job type
      };

      console.log("Posting job data:", postData);
      console.log("Using token:", token ? "Token present" : "No token");

      const response = await axios.post(
        "http://localhost:8000/api/jobs/create",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Job posted successfully:", response.data);
      alert("Job posted successfully!");
      navigate("/company-dashboard"); // Navigate to dashboard instead of jobs list
    } catch (err) {
      console.error("Post job error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.error || "Failed to post job. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== "company") {
    return null; // Component will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 p-6">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Dark Emerald Container */}
        <div className="bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-500/20 p-8 hover:shadow-emerald-500/20 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-emerald-500/10"
              title="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 shadow-lg mr-4 border border-emerald-500/30">
                <FaBuilding className="text-emerald-400 text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-200">Post a Job</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10"
              title="Cancel"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-6 backdrop-blur-2xl">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <FaBriefcase />
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                placeholder="e.g. Full Stack Developer, UI/UX Designer"
                maxLength="100"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <FaTimes className="text-xs" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {jobData.title.length}/100 characters
              </p>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <FaFileAlt />
                Job Description *
              </label>
              <textarea
                name="description"
                value={jobData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 bg-slate-700/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300 resize-none"
                placeholder="Describe the job requirements, responsibilities, and what you're looking for..."
                maxLength="2000"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <FaTimes className="text-xs" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {jobData.description.length}/2000 characters
              </p>
            </div>

            {/* Skills Required */}
            <div>
              <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <FaCode />
                Skills Required
              </label>
              <input
                type="text"
                name="skillsRequired"
                value={jobData.skillsRequired}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                placeholder="JavaScript, React, Node.js, MongoDB (separated by commas)"
              />
              <p className="text-xs text-gray-400 mt-2 bg-slate-700/40 px-3 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/10">
                💡 Separate skills with commas. This helps freelancers find
                relevant jobs.
              </p>
            </div>

            {/* Pay Per Hour and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <FaDollarSign />
                  Pay Per Hour ($) *
                </label>
                <input
                  type="number"
                  name="payPerHour"
                  value={jobData.payPerHour}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                  placeholder="25.00"
                />
                {errors.payPerHour && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <FaTimes className="text-xs" />
                    {errors.payPerHour}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2 bg-emerald-500/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/20">
                  💰 Competitive rates attract better talent
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <FaUser />
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  value={jobData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 shadow-lg transition-all duration-300"
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Intermediate">Intermediate (2-5 years)</option>
                  <option value="Expert">Expert (5+ years)</option>
                </select>
                {errors.experienceLevel && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <FaTimes className="text-xs" />
                    {errors.experienceLevel}
                  </p>
                )}
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
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 disabled:from-emerald-300 disabled:to-teal-300 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-500/30 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Posting Job...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Post Job</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-2xl p-6 rounded-2xl border border-emerald-500/20">
            <h3 className="font-bold text-lg text-emerald-400 mb-3">
              💡 Tips for a Great Job Post
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>
                  Be specific about the skills and experience you need
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Include project timeline and expectations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Offer competitive rates to attract top talent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Provide clear project requirements and deliverables</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
