import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaCode,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaSpinner,
  FaBuilding,
  FaGraduationCap,
  FaFileDownload,
  FaFilePdf,
  FaFileWord,
  FaEye,
} from "react-icons/fa";

const FreelancerProfileModal = ({ freelancerId, isOpen, onClose }) => {
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && freelancerId) {
      console.log("🔍 Modal opened for freelancer ID:", freelancerId);
      fetchFreelancerProfile();
      document.body.style.overflow = "hidden";
    } else if (!isOpen) {
      setFreelancer(null);
      setError("");
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, freelancerId]);

  const fetchFreelancerProfile = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("📡 Fetching freelancer profile for ID:", freelancerId);

      const response = await axios.get(
        `http://localhost:8000/api/freelancers/${freelancerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Freelancer profile fetched:", response.data);
      setFreelancer(response.data);
    } catch (err) {
      console.error("❌ Error fetching freelancer profile:", err);
      let errorMessage = "Failed to load freelancer profile";

      if (err.response?.status === 404) {
        errorMessage = "Freelancer profile not found";
      } else if (err.response?.status === 401) {
        errorMessage = "Not authorized to view this profile";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async () => {
    if (!freelancer?.resume?.url) {
      alert("No resume available for this freelancer");
      return;
    }

    setResumeLoading(true);

    try {
      console.log("📄 Opening resume for freelancer:", freelancer.fullName);

      // Get resume info first
      const response = await axios.get(
        `http://localhost:8000/api/freelancers/resume/${freelancerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Open Cloudinary URL directly in new tab
      window.open(response.data.resumeUrl, "_blank");
    } catch (error) {
      console.error("❌ Error opening resume:", error);
      alert("Failed to open resume. Please try again.");
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!freelancer?.resume?.url) {
      alert("No resume available for this freelancer");
      return;
    }

    setResumeLoading(true);

    try {
      console.log("⬇️ Downloading resume for freelancer:", freelancer.fullName);

      // Get resume info
      const response = await axios.get(
        `http://localhost:8000/api/freelancers/resume/${freelancerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Create a temporary link to download from Cloudinary URL
      const link = document.createElement("a");
      link.href = response.data.resumeUrl;
      link.setAttribute("download", response.data.originalName || "resume.pdf");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Error downloading resume:", error);
      alert("Failed to download resume. Please try again.");
    } finally {
      setResumeLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) {
      return <FaFilePdf className="text-red-400" />;
    } else if (mimeType?.includes("word") || mimeType?.includes("document")) {
      return <FaFileWord className="text-blue-400" />;
    }
    return <FaFileDownload className="text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const calculateExperience = (startDate) => {
    if (!startDate) return "";
    try {
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);

      if (years > 0) {
        return `${years}y ${months}m`;
      } else if (months > 0) {
        return `${months}m`;
      } else {
        return "< 1m";
      }
    } catch (e) {
      return "";
    }
  };

  const isArray = (value) => Array.isArray(value);
  const safeArray = (value) => (isArray(value) ? value : []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn bg-slate-900/80 backdrop-blur-2xl"
      onClick={handleBackdropClick}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div
        className="relative w-full max-w-5xl max-h-[95vh] animate-scaleIn z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Emerald Modal Container */}
        <div className="bg-slate-800/95 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Dark Emerald Theme */}
          <div className="relative p-6 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-2xl text-white overflow-hidden border-b border-emerald-500/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-400/20 to-teal-600/20"></div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Close button clicked");
                onClose();
              }}
              className="absolute top-4 right-4 p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 transition-all duration-300 backdrop-blur-xl group z-50 border border-emerald-500/20 hover:border-emerald-400/40"
              type="button"
            >
              <FaTimes
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300 text-white"
              />
            </button>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-gray-100">
                Freelancer Profile
              </h2>
              <p className="text-emerald-100 text-lg">
                Complete professional details & resume
              </p>
            </div>
          </div>

          {/* Content with Dark Theme */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <FaSpinner className="animate-spin text-emerald-400 text-5xl mb-6" />
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <span className="text-gray-200 text-xl font-medium">
                  Loading profile...
                </span>
                <span className="text-gray-400 text-sm mt-2">
                  Fetching freelancer details
                </span>
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-8 py-6 rounded-2xl text-center backdrop-blur-2xl">
                  <div className="text-red-400 text-5xl mb-4">⚠️</div>
                  <p className="font-semibold text-xl mb-3">
                    Unable to Load Profile
                  </p>
                  <p className="mb-6 text-red-300">{error}</p>
                  <div className="space-x-4">
                    <button
                      onClick={fetchFreelancerProfile}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : freelancer ? (
              <div className="p-8 space-y-8">
                {/* Basic Info Section */}
                <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      {freelancer.profilePicture?.url ? (
                        <img
                          src={freelancer.profilePicture.url}
                          alt={freelancer.fullName}
                          className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-500/30 shadow-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-4 border-emerald-500/30 shadow-lg ${
                          freelancer.profilePicture?.url ? "hidden" : ""
                        }`}
                      >
                        <FaUser className="text-white text-4xl" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-200 mb-3">
                        {freelancer.fullName || "No name provided"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-3 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">
                            {freelancer.email || "No email provided"}
                          </span>
                        </div>

                        {freelancer.phone && (
                          <div className="flex items-center">
                            <FaPhone className="mr-3 text-emerald-400" />
                            <span>{freelancer.phone}</span>
                          </div>
                        )}

                        {(freelancer.location || freelancer.address) && (
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-3 text-emerald-400" />
                            <span>
                              {freelancer.location || freelancer.address}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-3 text-emerald-400" />
                          <span>Joined {formatDate(freelancer.createdAt)}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                        {freelancer.gender && (
                          <div>
                            <span className="font-medium text-emerald-400">
                              Gender:
                            </span>{" "}
                            <span className="text-gray-300">
                              {freelancer.gender}
                            </span>
                          </div>
                        )}

                        {freelancer.dob && (
                          <div>
                            <span className="font-medium text-emerald-400">
                              Date of Birth:
                            </span>{" "}
                            <span className="text-gray-300">
                              {formatDate(freelancer.dob)}
                            </span>
                          </div>
                        )}

                        {freelancer.experience && (
                          <div>
                            <span className="font-medium text-emerald-400">
                              Experience:
                            </span>{" "}
                            <span className="text-gray-300">
                              {freelancer.experience} years
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume Section */}
                {freelancer.resume?.url ? (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      {getFileIcon(freelancer.resume.mimeType)}
                      <span className="ml-3">Resume</span>
                    </h4>

                    <div className="flex items-center justify-between bg-slate-700/50 rounded-2xl p-4 backdrop-blur-sm border border-emerald-500/20">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          {getFileIcon(freelancer.resume.mimeType)}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-200">
                            {freelancer.resume.originalName}
                          </h5>
                          <p className="text-sm text-gray-400">
                            Uploaded on{" "}
                            {formatDate(freelancer.resume.uploadedAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {formatFileSize(freelancer.resume.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleViewResume}
                          disabled={resumeLoading}
                          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105"
                        >
                          {resumeLoading ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaEye className="mr-2" />
                          )}
                          View
                        </button>

                        <button
                          onClick={handleDownloadResume}
                          disabled={resumeLoading}
                          className="flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105"
                        >
                          {resumeLoading ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaFileDownload className="mr-2" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-6 shadow-xl text-center backdrop-blur-2xl">
                    <div className="text-orange-400 text-4xl mb-3">📄</div>
                    <p className="text-orange-300 font-medium">
                      No resume uploaded
                    </p>
                    <p className="text-orange-400 text-sm mt-1">
                      This freelancer hasn't uploaded their resume yet
                    </p>
                  </div>
                )}

                {/* Professional Summary */}
                {freelancer.bio && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-3">
                      Professional Summary
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {freelancer.bio}
                    </p>
                  </div>
                )}

                {/* Skills Section */}
                {freelancer.skills &&
                  safeArray(freelancer.skills).length > 0 && (
                    <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                        <FaCode className="mr-3 text-emerald-400" />
                        Skills & Expertise (
                        {safeArray(freelancer.skills).length})
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {safeArray(freelancer.skills).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Work Experience Section */}
                {freelancer.workExperience &&
                  safeArray(freelancer.workExperience).length > 0 && (
                    <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                        <FaBuilding className="mr-3 text-emerald-400" />
                        Work Experience
                      </h4>
                      <div className="space-y-4">
                        {safeArray(freelancer.workExperience).map(
                          (exp, index) => (
                            <div
                              key={index}
                              className="border-l-4 border-emerald-400/60 pl-6 bg-slate-700/50 rounded-r-2xl p-4 backdrop-blur-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold text-gray-200 text-lg">
                                  {exp.jobTitle ||
                                    exp.title ||
                                    exp.position ||
                                    "Position"}
                                </h5>
                                <span className="text-sm text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                  {calculateExperience(exp.startDate)}
                                </span>
                              </div>
                              {exp.company && (
                                <p className="text-gray-300 mb-2 font-medium">
                                  {exp.company}
                                </p>
                              )}
                              {(exp.startDate || exp.endDate) && (
                                <p className="text-gray-400 text-sm mb-3">
                                  {exp.startDate && formatDate(exp.startDate)}
                                  {exp.startDate && exp.endDate && " - "}
                                  {exp.endDate
                                    ? formatDate(exp.endDate)
                                    : exp.startDate && "Present"}
                                </p>
                              )}
                              {exp.description && (
                                <p className="text-gray-300 text-sm">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Education Section */}
                {freelancer.education &&
                  safeArray(freelancer.education).length > 0 && (
                    <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                        <FaGraduationCap className="mr-3 text-emerald-400" />
                        Education
                      </h4>
                      <div className="space-y-4">
                        {safeArray(freelancer.education).map((edu, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/50 rounded-2xl p-4 backdrop-blur-sm border border-emerald-500/10"
                          >
                            <h5 className="font-semibold text-gray-200 text-lg">
                              {edu.degree ||
                                edu.qualification ||
                                edu.course ||
                                "Degree"}
                            </h5>
                            {edu.institution && (
                              <p className="text-gray-300 font-medium">
                                {edu.institution}
                              </p>
                            )}
                            {edu.year && (
                              <p className="text-gray-400 text-sm">
                                {edu.graduationYear || edu.year
                                  ? `Graduated: ${
                                      edu.graduationYear || edu.year
                                    }`
                                  : ""}
                              </p>
                            )}
                            {edu.description && (
                              <p className="text-gray-300 text-sm mt-2">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Portfolio/Projects Section */}
                {freelancer.portfolio &&
                  safeArray(freelancer.portfolio).length > 0 && (
                    <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-gray-200 mb-4">
                        Portfolio & Projects
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safeArray(freelancer.portfolio).map(
                          (project, index) => (
                            <div
                              key={index}
                              className="bg-slate-700/50 border border-emerald-500/20 rounded-2xl p-5 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                            >
                              <h5 className="font-semibold text-gray-200 mb-3 text-lg">
                                {project.title ||
                                  project.name ||
                                  `Project ${index + 1}`}
                              </h5>
                              {project.description && (
                                <p className="text-gray-300 text-sm mb-4">
                                  {project.description}
                                </p>
                              )}
                              {project.technologies &&
                                safeArray(project.technologies).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {safeArray(project.technologies).map(
                                      (tech, techIndex) => (
                                        <span
                                          key={techIndex}
                                          className="bg-teal-500/20 text-teal-400 px-2 py-1 rounded-lg text-xs border border-teal-500/30"
                                        >
                                          {tech}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-lime-400 text-sm flex items-center font-medium hover:underline transition-colors"
                                >
                                  <FaExternalLinkAlt className="mr-2" />
                                  View Project
                                </a>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Rating Section */}
                {freelancer.rating && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-3 flex items-center">
                      <FaStar className="mr-3 text-lime-400" />
                      Rating & Reviews
                    </h4>
                    <div className="flex items-center">
                      <div className="flex items-center mr-6">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xl ${
                              i < Math.floor(freelancer.rating)
                                ? "text-lime-400"
                                : "text-gray-500"
                            }`}
                          />
                        ))}
                        <span className="ml-3 font-bold text-xl text-emerald-400">
                          {freelancer.rating.toFixed(1)}/5
                        </span>
                      </div>
                      {freelancer.reviewsCount && (
                        <span className="text-gray-400">
                          ({freelancer.reviewsCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex justify-center space-x-6 pt-8">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent("Job Opportunity");
                      const body = encodeURIComponent(`Hello ${
                        freelancer.fullName || "there"
                      },

I am interested in discussing a job opportunity with you. Please let me know if you would be available for a brief conversation.

Best regards`);
                      window.location.href = `mailto:${freelancer.email}?subject=${subject}&body=${body}`;
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-500/30"
                  >
                    <FaEnvelope className="mr-3" />
                    Contact Freelancer
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-slate-700/80 hover:bg-slate-600/80 text-gray-300 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-lg hover:scale-105 border border-emerald-500/20 hover:border-emerald-400/40 backdrop-blur-2xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">👤</div>
                <p className="text-gray-300 text-xl">
                  No profile data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FreelancerProfileModal;
