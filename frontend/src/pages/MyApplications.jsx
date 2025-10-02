import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

const MyApplications = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated or not a freelancer
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "freelancer") {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch applications
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
        console.log("✅ Applications fetched:", data);

        // Ensure applications is always an array
        const applicationsArray = data.applications || data.data || [];
        setApplications(
          Array.isArray(applicationsArray) ? applicationsArray : []
        );
      } else {
        console.error("❌ Failed to fetch applications:", response.status);
        setError("Failed to fetch applications");
        setApplications([]);
      }
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      setError("Error fetching applications");
      setApplications([]);
    } finally {
      setLoading(false);
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

  // Filter applications by status
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-gray-400 mt-2">
            Track the status of your job applications
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
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

        {/* Applications List */}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6">
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
                  className="bg-slate-700/50 border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Job Info */}
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

                      {/* Company Info */}
                      {application.job?.company && (
                        <div className="flex items-center text-gray-400 mb-3">
                          <FaBuilding className="mr-2" />
                          <span>
                            {application.job.company.companyName ||
                              application.job.company.organization}
                          </span>
                        </div>
                      )}

                      {/* Job Details */}
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

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-gray-300 text-sm bg-slate-800/50 p-3 rounded line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Response */}
                      {application.response && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-1">
                            Company Response:
                          </p>
                          <p className="text-gray-300 text-sm bg-slate-800/50 p-3 rounded">
                            {application.response}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6">
                      <button
                        onClick={() =>
                          navigate(`/jobs/${application.job?._id}`)
                        }
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <FaEye />
                        <span>View Job</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
