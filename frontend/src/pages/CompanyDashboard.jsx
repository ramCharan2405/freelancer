import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApplicationDetailModal from "../components/ApplicationDetailModal";

import {
  FaPlus,
  FaBriefcase,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaSpinner,
  FaChartLine,
  FaFileAlt,
  FaUserTie,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaUser,
  FaPhone,
  FaGlobe,
  FaInfoCircle,
  FaDownload,
  FaGraduationCap,
  FaCode,
  FaBuilding,
} from "react-icons/fa";

const CompanyDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [processingApplications, setProcessingApplications] = useState(
    new Set()
  );
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "company") {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "company") {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const formatSalary = (salary) => {
    if (!salary || salary === null || salary === undefined) {
      return "Not specified";
    }

    if (typeof salary === "string") {
      if (
        salary.includes("$") ||
        salary.includes("€") ||
        salary.includes("£")
      ) {
        return salary;
      }

      const numValue = parseFloat(salary.replace(/[^\d.-]/g, ""));
      if (!isNaN(numValue)) {
        return `$${numValue.toLocaleString()}`;
      }

      return salary;
    }

    if (typeof salary === "number") {
      return `$${salary.toLocaleString()}`;
    }

    return "Not specified";
  };

  const getExperienceIcon = (experience) => {
    if (!experience || typeof experience !== "string") {
      return <FaUser className="text-gray-400" />;
    }

    const exp = experience.toLowerCase();
    if (exp.includes("entry") || exp.includes("beginner")) {
      return <FaGraduationCap className="text-green-400" />;
    } else if (exp.includes("mid") || exp.includes("intermediate")) {
      return <FaCode className="text-blue-400" />;
    } else if (exp.includes("senior") || exp.includes("expert")) {
      return <FaStar className="text-yellow-400" />;
    }
    return <FaUser className="text-gray-400" />;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const jobsResponse = await fetch(
        "http://localhost:8000/api/jobs/company/my-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();

        const jobsList = jobsData.jobs || jobsData.data || jobsData || [];
        setJobs(Array.isArray(jobsList) ? jobsList : []);

        const allApplications = Array.isArray(jobsList)
          ? jobsList.flatMap((job) => job.applications || [])
          : [];
        setApplications(allApplications);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setError("Failed to load dashboard data");
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(
      (job) => job.status === "active" || job.isActive !== false
    ).length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (app) => app.status === "pending"
    ).length;

    setStats({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
    });
  }, [jobs, applications]);

  const handleApplicationStatus = async (
    applicationId,
    status,
    response = ""
  ) => {
    try {
      setProcessingApplications((prev) => new Set([...prev, applicationId]));

      const token = localStorage.getItem("token");
      const updateResponse = await fetch(
        `http://localhost:8000/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, response }),
        }
      );

      if (updateResponse.ok) {
        const result = await updateResponse.json();

        await fetchDashboardData();

        alert(`Application ${status} successfully!`);

        if (showDetailModal) {
          setShowDetailModal(false);
          setSelectedApplication(null);
        }
      } else {
        const errorData = await updateResponse.json();

        alert(
          `Failed to update application status: ${
            errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      alert("Error updating application status");
    } finally {
      setProcessingApplications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      } else {
        alert("Failed to delete job");
      }
    } catch (error) {
      alert("Error deleting job");
    }
  };

  const toggleJobExpansion = (jobId) => {
    setExpandedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const openDetailModal = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedApplication(null);
    setShowDetailModal(false);
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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "Not provided";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
            Company Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.companyName || user?.organization || "Company"}
            !
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {stats.totalJobs}
                </p>
              </div>
              <FaBriefcase className="text-emerald-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-teal-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-teal-400">
                  {stats.activeJobs}
                </p>
              </div>
              <FaChartLine className="text-teal-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.totalApplications}
                </p>
              </div>
              <FaUsers className="text-blue-400 text-3xl" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-2xl border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.pendingApplications}
                </p>
              </div>
              <FaFileAlt className="text-yellow-400 text-3xl" />
            </div>
          </div>
        </div>

        {}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate("/post-job")}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus />
            <span>Post New Job</span>
          </button>

          <button
            onClick={() => navigate("/edit-company-profile")}
            className="flex items-center space-x-2 bg-slate-700 text-white px-6 py-3 rounded-xl hover:bg-slate-600 transition-all duration-300"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        </div>

        {}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Posted Jobs & Applications
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <FaBriefcase className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No jobs posted yet</p>
              <button
                onClick={() => navigate("/post-job")}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-slate-700/50 border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/40 transition-all duration-300"
                >
                  {}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {job.title || "Untitled Job"}
                      </h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {job.description || "No description available"}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <FaDollarSign className="text-emerald-400" />
                          <span>{formatSalary(job.salary || job.budget)}</span>
                        </div>

                        {job.location && (
                          <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="text-teal-400" />
                            <span>{job.location}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="text-blue-400" />
                          <span>Posted: {formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      {}
                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => navigate(`/edit-job/${job._id}`)}
                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        title="Edit Job"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete Job"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-600/30">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === "active" || job.isActive !== false
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {job.status === "active" || job.isActive !== false
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Total: {job.applicationCount || 0}</span>
                        <span className="text-yellow-400">
                          Pending: {job.pendingCount || 0}
                        </span>
                        <span className="text-green-400">
                          Accepted: {job.acceptedCount || 0}
                        </span>
                        <span className="text-red-400">
                          Rejected: {job.rejectedCount || 0}
                        </span>
                      </div>
                    </div>

                    {}
                    {job.applications && job.applications.length > 0 ? (
                      <button
                        onClick={() => toggleJobExpansion(job._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                      >
                        <span>
                          View Applications ({job.applications.length})
                        </span>
                        {expandedJobs.has(job._id) ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        No applications yet
                      </div>
                    )}
                  </div>

                  {}
                  {expandedJobs.has(job._id) &&
                    job.applications &&
                    job.applications.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-600/30">
                        <h4 className="text-lg font-semibold text-white mb-4">
                          Applications for "{job.title}" (
                          {job.applications.length} total)
                        </h4>

                        {}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {job.applications.map((application) => (
                            <div
                              key={application._id}
                              className="bg-slate-600/30 rounded-lg p-5 border border-gray-600/20 hover:border-gray-500/40 transition-all duration-200"
                            >
                              {}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                    {application.freelancer?.profilePicture ? (
                                      <img
                                        src={
                                          application.freelancer.profilePicture
                                        }
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <FaUserTie className="text-white text-lg" />
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="text-white font-semibold">
                                      {application.freelancer?.fullName ||
                                        "Unknown Freelancer"}
                                    </h5>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                      {getExperienceIcon(
                                        application.freelancer?.experience
                                      )}
                                      <span>
                                        {application.freelancer?.experience ||
                                          "Not specified"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    application.status
                                  )}`}
                                >
                                  {application.status?.charAt(0).toUpperCase() +
                                    application.status?.slice(1)}
                                </span>
                              </div>

                              {}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-400">
                                  <FaEnvelope className="mr-2" />
                                  <span>
                                    {application.freelancer?.email ||
                                      "No email"}
                                  </span>
                                </div>

                                {application.freelancer?.location && (
                                  <div className="flex items-center text-sm text-gray-400">
                                    <FaMapMarkerAlt className="mr-2" />
                                    <span>
                                      {application.freelancer.location}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center text-sm text-gray-400">
                                  <FaClock className="mr-2" />
                                  <span>
                                    Applied: {formatDate(application.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {}
                              {application.freelancer?.skills &&
                                application.freelancer.skills.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                      {application.freelancer.skills
                                        .slice(0, 3)
                                        .map((skill, index) => (
                                          <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                      {application.freelancer.skills.length >
                                        3 && (
                                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                          +
                                          {application.freelancer.skills
                                            .length - 3}{" "}
                                          more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {}
                              {application.coverLetter && (
                                <div className="mb-4">
                                  <p className="text-gray-400 text-xs mb-1">
                                    Cover Letter:
                                  </p>
                                  <p className="text-gray-300 text-sm bg-slate-700/30 p-2 rounded">
                                    {truncateText(application.coverLetter, 80)}
                                  </p>
                                </div>
                              )}

                              {}
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => openDetailModal(application)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                                >
                                  <FaInfoCircle />
                                  <span>View Details</span>
                                </button>

                                {application.status === "pending" && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          application._id,
                                          "accepted"
                                        )
                                      }
                                      disabled={processingApplications.has(
                                        application._id
                                      )}
                                      className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                                    >
                                      {processingApplications.has(
                                        application._id
                                      ) ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaCheck />
                                      )}
                                      <span>Accept</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          application._id,
                                          "rejected"
                                        )
                                      }
                                      disabled={processingApplications.has(
                                        application._id
                                      )}
                                      className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
                                    >
                                      {processingApplications.has(
                                        application._id
                                      ) ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaTimes />
                                      )}
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {}
      </div>

      {}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={closeDetailModal}
          onStatusChange={handleApplicationStatus}
          processing={processingApplications.has(selectedApplication._id)}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
