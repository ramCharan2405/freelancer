import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaChartLine } from "react-icons/fa";

import {
  FaSpinner,
  FaClock,
  FaCheck,
  FaTimes,
  FaEye,
  FaBuilding,
  FaDollarSign,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaComments,
  FaEnvelope,
  FaClipboardList,
  FaBriefcase,
} from "react-icons/fa";
import JobDetailModal from "../components/JobDetailModal";

const CoverLetterModal = ({ isOpen, onClose, coverLetter, jobTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-emerald-500/30 shadow-2xl animate-slideUp">
        {}
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <FaEnvelope className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Cover Letter</h2>
                <p className="text-gray-400 text-sm mt-1">{jobTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        {}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
              {coverLetter}
            </p>
          </div>
        </div>

        {}
        <div className="bg-slate-700/50 border-t border-gray-600/30 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyApplications = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "freelancer") {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "freelancer") {
      fetchApplications();
    }
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/applications/freelancer",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        const applicationsArray = data.applications || data.data || [];
        setApplications(
          Array.isArray(applicationsArray) ? applicationsArray : []
        );
      } else {
        setError("Failed to fetch applications");
        setApplications([]);
      }
    } catch (error) {
      setError("Error fetching applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const openCoverLetterModal = (coverLetter, jobTitle) => {
    setSelectedCoverLetter(coverLetter);
    setSelectedJobTitle(jobTitle);
    setIsModalOpen(true);
  };

  const closeCoverLetterModal = () => {
    setIsModalOpen(false);
    setSelectedCoverLetter(null);
    setSelectedJobTitle("");
  };

  const handleViewJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowJobDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-400" />;
      case "accepted":
        return <FaCheck className="text-green-400" />;
      case "rejected":
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    return typeof salary === "string" && salary.includes("$")
      ? salary
      : `$${salary}`;
  };

  const pendingApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === "pending")
    : [];
  const acceptedApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === "accepted")
    : [];
  const rejectedApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === "rejected")
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-gray-400 mt-2">
            Track the status of your job applications
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate("/freelancer-dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/40 hover:scale-105 flex items-center gap-2"
          >
            <FaChartLine />
            View Full Dashboard
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-2xl border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-blue-400">
                  {applications.length}
                </p>
              </div>
              <FaFileAlt className="text-blue-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {pendingApplications.length}
                </p>
              </div>
              <FaClock className="text-yellow-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="text-3xl font-bold text-green-400">
                  {acceptedApplications.length}
                </p>
              </div>
              <FaCheck className="text-green-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-400">
                  {rejectedApplications.length}
                </p>
              </div>
              <FaTimes className="text-red-400 text-3xl" />
            </div>
          </div>
        </div>

        {}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Application History
          </h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No applications yet</p>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border transition-all hover:scale-[1.01] ${
                    application.status === "accepted"
                      ? "border-emerald-500/40"
                      : application.status === "assignment-sent"
                      ? "border-orange-500/40 shadow-lg shadow-orange-500/20"
                      : "border-emerald-500/20"
                  }`}
                >
                  {/* Skill Match Progress Bar */}
                  {application.skillMatchScore !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Skill Match
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            application.skillMatchScore >= 75
                              ? "text-green-400"
                              : application.skillMatchScore >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {application.skillMatchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900/60 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            application.skillMatchScore >= 75
                              ? "bg-green-500"
                              : application.skillMatchScore >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${application.skillMatchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Assignment Alert */}
                  {application.status === "assignment-sent" && (
                    <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/40 rounded-xl flex items-center gap-3 animate-pulse">
                      <FaClipboardList className="text-orange-400 text-xl" />
                      <div>
                        <p className="text-orange-400 font-semibold text-sm">
                          Assignment Waiting!
                        </p>
                        <p className="text-xs text-gray-300">
                          Complete before:{" "}
                          {new Date(
                            application.assignment.deadline
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">
                          {application.job?.title || "Unknown Job"}
                        </h3>

                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status?.charAt(0).toUpperCase() +
                              application.status?.slice(1)}
                          </span>
                        </div>
                      </div>

                      {}
                      {application.job?.company && (
                        <div className="flex items-center text-gray-400 mb-3">
                          <FaBuilding className="mr-2" />
                          <span>
                            {application.job.company.companyName ||
                              application.job.company.organization}
                          </span>
                        </div>
                      )}

                      {}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                        <div className="flex items-center space-x-1">
                          <FaDollarSign className="text-emerald-400" />
                          <span>{formatSalary(application.job?.salary)}</span>
                        </div>

                        {application.job?.location && (
                          <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="text-teal-400" />
                            <span>{application.job.location}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="text-blue-400" />
                          <span>
                            Applied: {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>

                      {}
                      {application.coverLetter && (
                        <div className="mb-4">
                          <button
                            onClick={() =>
                              openCoverLetterModal(
                                application.coverLetter,
                                application.job?.title || "Unknown Job"
                              )
                            }
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all duration-300"
                          >
                            <FaEnvelope />
                            <span>View Cover Letter</span>
                          </button>
                        </div>
                      )}

                      {}
                      {application.response && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2 font-medium">
                            Company Response:
                          </p>
                          <div className="bg-slate-800/50 border border-gray-600/30 rounded-lg p-4">
                            <p className="text-gray-300 text-sm">
                              {application.response}
                            </p>
                          </div>
                        </div>
                      )}

                      {}
                      {application.status === "accepted" && (
                        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-green-400 mb-2">
                            <FaCheck className="text-lg" />
                            <p className="font-semibold">
                              Congratulations! Your application has been
                              accepted
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">
                            A chat has been created for you to discuss project
                            details with the company.
                          </p>
                          <button
                            onClick={() => navigate("/messages")}
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all duration-300"
                          >
                            <FaComments />
                            <span>Go to Messages</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="ml-6">
                      <button
                        onClick={() => handleViewJob(application.job?._id)}
                        className="w-full px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaBriefcase /> View Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <CoverLetterModal
        isOpen={isModalOpen}
        onClose={closeCoverLetterModal}
        coverLetter={selectedCoverLetter}
        jobTitle={selectedJobTitle}
      />

      {showJobDetailModal && (
        <JobDetailModal
          jobId={selectedJobId}
          isOpen={showJobDetailModal}
          onClose={() => {
            setShowJobDetailModal(false);
            setSelectedJobId(null);
          }}
        />
      )}

      {}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyApplications;
