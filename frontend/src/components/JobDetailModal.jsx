import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaCode,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaExternalLinkAlt,
  FaSpinner,
  FaUserTie,
  FaGraduationCap,
  FaClipboardList,
  FaLightbulb,
} from "react-icons/fa";

const JobDetailModal = ({ jobId, isOpen, onClose, onApply }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
      document.body.style.overflow = "hidden";
    } else if (!isOpen) {
      setJob(null);
      setError("");
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setJob(data.job);
        // Check if user has already applied
        checkApplicationStatus(data.job._id);
      } else {
        setError(data.message || "Failed to load job details");
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async (jobId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/applications/freelancer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        const applied = data.applications.some((app) => app.job?._id === jobId);
        setHasApplied(applied);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
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

  const formatSalary = (amount) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleApplyClick = () => {
    if (onApply && job) {
      onApply(job);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn bg-slate-900/80 backdrop-blur-2xl"
      onClick={handleBackdropClick}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div
        className="relative w-full max-w-5xl max-h-[95vh] animate-scaleIn z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-800/95 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-2xl text-white overflow-hidden border-b border-emerald-500/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-400/20 to-teal-600/20"></div>
            </div>

            <button
              onClick={onClose}
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
                Job Details
              </h2>
              <p className="text-emerald-100 text-lg">
                Complete job description & requirements
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <FaSpinner className="animate-spin text-emerald-400 text-5xl mb-6" />
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <span className="text-gray-200 text-xl font-medium">
                  Loading job details...
                </span>
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-8 py-6 rounded-2xl text-center backdrop-blur-2xl">
                  <div className="text-red-400 text-5xl mb-4">⚠️</div>
                  <p className="font-semibold text-xl mb-3">
                    Unable to Load Job Details
                  </p>
                  <p className="mb-6 text-red-300">{error}</p>
                  <div className="space-x-4">
                    <button
                      onClick={fetchJobDetails}
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
            ) : job ? (
              <div className="p-8 space-y-8">
                {/* Job Header */}
                <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-200 mb-3">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-300 mb-4">
                        <div className="flex items-center">
                          <FaBuilding className="mr-2 text-emerald-400" />
                          <span className="font-medium">
                            {job.company?.organization ||
                              job.company?.companyName ||
                              "Company"}
                          </span>
                        </div>
                        {job.location && (
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-emerald-400" />
                            <span>{job.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {hasApplied && (
                      <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                        ✓ Applied
                      </span>
                    )}
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {job.budget && (
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center mb-2">
                          <FaDollarSign className="text-emerald-400 mr-2" />
                          <span className="text-sm text-gray-400">Budget</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-400">
                          {formatSalary(job.budget)}
                        </p>
                      </div>
                    )}

                    {job.duration && (
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center mb-2">
                          <FaClock className="text-teal-400 mr-2" />
                          <span className="text-sm text-gray-400">
                            Duration
                          </span>
                        </div>
                        <p className="text-xl font-bold text-teal-400">
                          {job.duration}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-700/50 rounded-xl p-4 border border-emerald-500/20">
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="text-lime-400 mr-2" />
                        <span className="text-sm text-gray-400">Posted</span>
                      </div>
                      <p className="text-xl font-bold text-lime-400">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                {job.description && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <FaClipboardList className="mr-3 text-emerald-400" />
                      Job Description
                    </h4>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                )}

                {/* Required Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <FaCode className="mr-3 text-emerald-400" />
                      Required Skills ({job.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-300 flex items-center"
                        >
                          <FaCheckCircle className="mr-2 text-xs" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience & Qualifications */}
                {(job.experienceRequired || job.qualifications) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {job.experienceRequired && (
                      <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                        <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                          <FaUserTie className="mr-3 text-teal-400" />
                          Experience Required
                        </h4>
                        <p className="text-2xl font-bold text-teal-400 mb-2">
                          {job.experienceRequired}
                        </p>
                        <p className="text-sm text-gray-400">
                          {job.experienceRequired === "Entry Level"
                            ? "0-2 years of experience"
                            : job.experienceRequired === "Intermediate"
                            ? "2-5 years of experience"
                            : job.experienceRequired === "Expert"
                            ? "5+ years of experience"
                            : "Experience level required"}
                        </p>
                      </div>
                    )}

                    {job.qualifications && (
                      <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                        <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                          <FaGraduationCap className="mr-3 text-lime-400" />
                          Qualifications
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {job.qualifications}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Type & Category */}
                {(job.jobType || job.category) && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {job.jobType && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">
                            Job Type
                          </h4>
                          <span className="inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30">
                            {job.jobType}
                          </span>
                        </div>
                      )}
                      {job.category && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">
                            Category
                          </h4>
                          <span className="inline-block bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30">
                            {job.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Company Info */}
                {job.company && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <FaBuilding className="mr-3 text-emerald-400" />
                      About the Company
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        {job.company.logo && (
                          <img
                            src={job.company.logo}
                            alt={job.company.organization}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/30"
                          />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-gray-200">
                            {job.company.organization ||
                              job.company.companyName}
                          </p>
                          {job.company.industry && (
                            <p className="text-sm text-gray-400">
                              {job.company.industry}
                            </p>
                          )}
                        </div>
                      </div>
                      {job.company.description && (
                        <p className="text-gray-300 mt-3">
                          {job.company.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {job.additionalInfo && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-2xl">
                    <div className="flex items-start gap-3">
                      <FaLightbulb className="text-blue-400 text-xl mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">
                          Additional Information
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {job.additionalInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Status Info */}
                {hasApplied && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-2xl text-center">
                    <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-3" />
                    <p className="text-green-400 font-semibold text-lg mb-2">
                      You have already applied for this job
                    </p>
                    <p className="text-gray-300 text-sm">
                      Check your applications page to track the status
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-6 pt-8 border-t border-emerald-500/20">
                  {!hasApplied && onApply && (
                    <button
                      onClick={handleApplyClick}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-500/30"
                    >
                      <FaBriefcase className="mr-3" />
                      Apply for this Job
                    </button>
                  )}
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
                <div className="text-gray-400 text-5xl mb-4">💼</div>
                <p className="text-gray-300 text-xl">No job data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
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

export default JobDetailModal;
