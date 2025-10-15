import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaCalendarAlt,
  FaTrophy,
  FaTimesCircle,
  FaExclamationCircle,
  FaTimes,
  FaUpload,
  FaLink,
  FaFileAlt,
  FaLightbulb,
  FaEye,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaVideo,
  FaMapMarkerAlt,
  FaDollarSign,
  FaChartLine,
  FaUserCheck,
  FaEnvelope,
  FaPhone,
  FaFire, 
  FaExternalLinkAlt, 
} from "react-icons/fa";

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    qualifiedApplications: 0,
    assignmentsPending: 0,
    interviewsScheduled: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'submit-assignment', 'interview', 'details', 'rejection-reason'
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for assignment submission
  const [assignmentSubmission, setAssignmentSubmission] = useState({
    submissionUrl: "",
    submissionNotes: "",
  });

  // Job detail modal state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8000/api/applications/freelancer",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        const apps = data.applications || [];
        setApplications(apps);

        // Calculate stats
        const stats = {
          totalApplications: apps.length,
          pendingApplications: apps.filter(
            (a) =>
              a.status === "pending" ||
              a.status === "under-review" ||
              a.status === "qualified" ||
              a.status === "in-review"
          ).length,
          qualifiedApplications: apps.filter((a) => a.status === "qualified")
            .length,
          assignmentsPending: apps.filter((a) => a.status === "assignment-sent")
            .length,
          interviewsScheduled: apps.filter(
            (a) => a.status === "interview-scheduled"
          ).length,
          acceptedApplications: apps.filter((a) => a.status === "accepted")
            .length,
          rejectedApplications: apps.filter(
            (a) => a.status === "rejected" || a.status === "auto-rejected"
          ).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "auto-rejected": "bg-red-500/20 text-red-400 border-red-500/30",
      "under-review": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      qualified: "bg-green-500/20 text-green-400 border-green-500/30",
      "in-review": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "assignment-sent":
        "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "assignment-submitted": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "interview-scheduled":
        "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "interview-completed": "bg-teal-500/20 text-teal-400 border-teal-500/30",
      accepted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock />,
      "auto-rejected": <FaTimesCircle />,
      "under-review": <FaChartLine />,
      qualified: <FaCheckCircle />,
      "in-review": <FaEye />,
      "assignment-sent": <FaClipboardList />,
      "assignment-submitted": <FaFileAlt />,
      "interview-scheduled": <FaCalendarAlt />,
      "interview-completed": <FaUserCheck />,
      accepted: <FaTrophy />,
      rejected: <FaTimes />,
    };
    return icons[status] || <FaClock />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Under Review",
      "auto-rejected": "Auto-Rejected",
      "under-review": "Under Review",
      qualified: "Qualified ✨",
      "in-review": "In Review",
      "assignment-sent": "Assignment Received",
      "assignment-submitted": "Assignment Submitted",
      "interview-scheduled": "Interview Scheduled",
      "interview-completed": "Interview Completed",
      accepted: "Accepted 🎉",
      rejected: "Not Selected",
    };
    return labels[status] || status;
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending:
        "Your application is being reviewed. We'll notify you of any updates.",
      "auto-rejected":
        "Unfortunately, your skills don't match the required criteria.",
      "under-review": "Your application is under manual review by the company.",
      qualified:
        "Great! Your skills are a strong match. The company will review your application soon.",
      "in-review": "The company is reviewing your application in detail.",
      "assignment-sent":
        "You've received an assignment! Complete it before the deadline.",
      "assignment-submitted":
        "Your assignment has been submitted. Awaiting company review.",
      "interview-scheduled":
        "You have an interview scheduled. Check details below.",
      "interview-completed":
        "Interview completed! Awaiting final decision from the company.",
      accepted:
        "Congratulations! You've been selected for this position. Check your messages for next steps.",
      rejected:
        "Thank you for your interest. The company has decided to move forward with other candidates.",
    };
    return messages[status] || "Application status updated.";
  };

  const handleSubmitAssignment = async () => {
    if (!assignmentSubmission.submissionUrl) {
      alert("Please provide a submission URL");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${selectedApplication._id}/assignment/submit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentSubmission),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Assignment submitted successfully!");
        setShowModal(null);
        setAssignmentSubmission({ submissionUrl: "", submissionNotes: "" });
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Error submitting assignment");
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Application withdrawn successfully");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to withdraw application");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("Error withdrawing application");
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active")
      return ![
        "accepted",
        "rejected",
        "auto-rejected",
        "interview-completed",
      ].includes(app.status);
    if (filterStatus === "completed")
      return ["accepted", "rejected", "auto-rejected"].includes(app.status);
    return app.status === filterStatus;
  });

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = Math.round((deadlineDate - now) / (1000 * 60 * 60));
    const daysLeft = Math.round(hoursLeft / 24);

    if (hoursLeft < 0) {
      return {
        status: "expired",
        text: "Expired",
        color: "text-red-500",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
        icon: "⏰",
      };
    } else if (hoursLeft < 24) {
      return {
        status: "urgent",
        text: `${hoursLeft}h left`,
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/30",
        icon: "🔥",
      };
    } else if (daysLeft <= 3) {
      return {
        status: "soon",
        text: `${daysLeft}d left`,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/30",
        icon: "⚠️",
      };
    } else {
      return {
        status: "normal",
        text: `${daysLeft}d left`,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/30",
        icon: "✅",
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* ✅ ADD BREADCRUMB */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <button
              onClick={() => navigate("/")}
              className="hover:text-emerald-400 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-emerald-400">Freelancer Dashboard</span>
          </div>

          {/* Existing Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Freelancer Dashboard
            </h1>
            <p className="text-gray-400">
              Track your applications and manage assignments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FaBriefcase className="text-2xl text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-white">
                  {stats.totalApplications}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm">Total Applications</h3>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingApplications} active
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FaCheckCircle className="text-2xl text-green-400" />
                </div>
                <span className="text-3xl font-bold text-white">
                  {stats.qualifiedApplications}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm">Qualified</h3>
              <p className="text-xs text-gray-500 mt-1">High skill match</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <FaClipboardList className="text-2xl text-orange-400" />
                </div>
                <span className="text-3xl font-bold text-white">
                  {stats.assignmentsPending}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm">Assignments Pending</h3>
              <p className="text-xs text-gray-500 mt-1">Action required</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <FaCalendarAlt className="text-2xl text-indigo-400" />
                </div>
                <span className="text-3xl font-bold text-white">
                  {stats.interviewsScheduled}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm">Interviews Scheduled</h3>
              <p className="text-xs text-gray-500 mt-1">Upcoming</p>
            </div>
          </div>

          {/* Success/Rejection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500/20 rounded-xl">
                  <FaTrophy className="text-3xl text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">
                    {stats.acceptedApplications}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Successful Applications
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-500/20">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-500/20 rounded-xl">
                  <FaTimesCircle className="text-3xl text-gray-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-400">
                    {stats.rejectedApplications}
                  </p>
                  <p className="text-gray-500 text-sm">Not Selected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {["overview", "active", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "active") setFilterStatus("active");
                  else if (tab === "completed") setFilterStatus("completed");
                  else setFilterStatus("all");
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-800/60 text-gray-400 hover:bg-slate-700/60"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Filter Dropdown for Overview */}
          {activeTab === "overview" && (
            <div className="mb-6 bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-4">
                <label className="text-gray-400 text-sm">
                  Filter by status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">New/Pending</option>
                  <option value="qualified">Qualified</option>
                  <option value="assignment-sent">Assignment Received</option>
                  <option value="assignment-submitted">
                    Assignment Submitted
                  </option>
                  <option value="interview-scheduled">
                    Interview Scheduled
                  </option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-12 border border-emerald-500/20 text-center">
              <FaExclamationCircle className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">
                {activeTab === "overview"
                  ? "No applications found"
                  : activeTab === "active"
                  ? "No active applications"
                  : "No completed applications"}
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
              >
                <FaBriefcase /> Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((app) => {
                const assignmentDeadline = app.assignment?.deadline
                  ? getDeadlineStatus(app.assignment.deadline)
                  : null;

                const interviewTime = app.interview?.scheduledDate
                  ? getDeadlineStatus(app.interview.scheduledDate)
                  : null;

                return (
                  <div
                    key={app._id}
                    className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border transition-all hover:scale-[1.01] ${
                      app.status === "accepted"
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : app.status === "assignment-sent"
                        ? "border-orange-500/40 bg-orange-500/5 shadow-lg shadow-orange-500/20"
                        : app.status === "interview-scheduled"
                        ? "border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/20"
                        : "border-emerald-500/20"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Job Info */}
                      <div className="flex-1">
                        {/* Header with Job Title and Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3
                                className="text-xl font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedJobId(app.job?._id);
                                  setShowJobDetailModal(true);
                                }}
                              >
                                {app.job?.title || "Job Title"}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusIcon(app.status)}
                                {getStatusLabel(app.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <FaBriefcase />
                                {app.job?.company?.organization || "Company"}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaClock />
                                Applied{" "}
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Message */}
                        <div
                          className={`mb-4 p-4 rounded-xl ${
                            app.status === "accepted"
                              ? "bg-emerald-500/20 border border-emerald-500/30"
                              : app.status === "auto-rejected" ||
                                app.status === "rejected"
                              ? "bg-red-500/20 border border-red-500/30"
                              : app.status === "assignment-sent"
                              ? "bg-orange-500/20 border border-orange-500/30"
                              : app.status === "interview-scheduled"
                              ? "bg-indigo-500/20 border border-indigo-500/30"
                              : "bg-blue-500/20 border border-blue-500/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {app.status === "accepted" ? (
                                <FaTrophy className="text-emerald-400 text-xl" />
                              ) : app.status === "assignment-sent" ? (
                                <FaFire className="text-orange-400 text-xl animate-pulse" />
                              ) : app.status === "interview-scheduled" ? (
                                <FaFire className="text-indigo-400 text-xl animate-pulse" />
                              ) : (
                                <FaLightbulb
                                  className={`text-xl ${
                                    app.status === "auto-rejected" ||
                                    app.status === "rejected"
                                      ? "text-red-400"
                                      : "text-blue-400"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  app.status === "accepted"
                                    ? "text-emerald-300"
                                    : app.status === "auto-rejected" ||
                                      app.status === "rejected"
                                    ? "text-red-300"
                                    : "text-gray-300"
                                }`}
                              >
                                {getStatusMessage(app.status)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Skill Match Score */}
                        {app.skillMatchScore !== undefined && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">
                                Skill Match Score
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  app.skillMatchScore >= 75
                                    ? "text-green-400"
                                    : app.skillMatchScore >= 50
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {app.skillMatchScore}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-900/60 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  app.skillMatchScore >= 75
                                    ? "bg-green-500"
                                    : app.skillMatchScore >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${app.skillMatchScore}%` }}
                              ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {app.matchedSkills?.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Matched Skills:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.matchedSkills
                                      .slice(0, 3)
                                      .map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
                                        >
                                          ✓ {skill}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {app.missingSkills?.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Missing Skills:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.missingSkills
                                      .slice(0, 2)
                                      .map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
                                        >
                                          ✗ {skill}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Auto-Rejection Reason */}
                        {app.autoRejectionReason && (
                          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <div className="flex items-start gap-2">
                              <FaTimesCircle className="text-red-400 mt-1" />
                              <div>
                                <p className="text-sm font-semibold text-red-400 mb-1">
                                  Rejection Reason:
                                </p>
                                <p className="text-sm text-gray-300">
                                  {app.autoRejectionReason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Assignment Section */}
                        {app.assignment && (
                          <div className="mb-4 bg-slate-900/40 p-4 rounded-xl border border-orange-500/30">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FaClipboardList className="text-orange-400 text-xl" />
                                <span className="font-semibold text-orange-400">
                                  Assignment
                                </span>
                              </div>
                              {app.status === "assignment-sent" && (
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold animate-pulse">
                                  Action Required
                                </span>
                              )}
                            </div>
                            <h4 className="text-white font-semibold mb-2">
                              {app.assignment.title}
                            </h4>
                            <p className="text-sm text-gray-300 mb-3">
                              {app.assignment.description}
                            </p>
                            {app.assignment.deadline && (
                              <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                                <FaClock />
                                Deadline:{" "}
                                {new Date(
                                  app.assignment.deadline
                                ).toLocaleDateString()}{" "}
                                {new Date(
                                  app.assignment.deadline
                                ).toLocaleTimeString()}
                              </p>
                            )}
                            {app.assignment.submissionUrl && (
                              <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                <p className="text-xs text-gray-400 mb-2">
                                  Your Submission:
                                </p>
                                <a
                                  href={app.assignment.submissionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm"
                                >
                                  <FaGithub />
                                  {app.assignment.submissionUrl}
                                  <FaExternalLinkAlt className="text-xs" />
                                </a>
                                {app.assignment.submissionNotes && (
                                  <p className="text-sm text-gray-300 mt-2">
                                    Notes: {app.assignment.submissionNotes}
                                  </p>
                                )}
                                {app.assignment.submittedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Submitted on:{" "}
                                    {new Date(
                                      app.assignment.submittedAt
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {app.assignment.isReviewed &&
                              app.assignment.reviewNotes && (
                                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-blue-400">
                                      Company Review
                                    </p>
                                    {app.assignment.reviewScore !==
                                      undefined && (
                                      <span className="text-lg font-bold text-blue-400">
                                        {app.assignment.reviewScore}/100
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-300">
                                    {app.assignment.reviewNotes}
                                  </p>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Interview Section */}
                        {app.interview && (
                          <div className="mb-4 bg-slate-900/40 p-4 rounded-xl border border-indigo-500/30">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-indigo-400 text-xl" />
                                <span className="font-semibold text-indigo-400">
                                  Interview
                                </span>
                              </div>
                              {app.status === "interview-scheduled" && (
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold animate-pulse">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            {app.interview.scheduledDate && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-400 mb-1">
                                  Date & Time:
                                </p>
                                <p className="text-white font-semibold">
                                  📅{" "}
                                  {new Date(
                                    app.interview.scheduledDate
                                  ).toLocaleDateString()}{" "}
                                  at {app.interview.scheduledTime}
                                </p>
                                {app.interview.duration && (
                                  <p className="text-sm text-gray-400">
                                    Duration: {app.interview.duration}
                                  </p>
                                )}
                              </div>
                            )}
                            {app.interview.meetingLink && (
                              <a
                                href={app.interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-semibold mb-3"
                              >
                                <FaExternalLinkAlt />
                                Join Interview Meeting
                              </a>
                            )}
                            {app.interview.notes && (
                              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">
                                  Interview Notes:
                                </p>
                                <p className="text-sm text-gray-300">
                                  {app.interview.notes}
                                </p>
                              </div>
                            )}
                            {app.interview.isCompleted &&
                              app.interview.feedbackNotes && (
                                <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-teal-400">
                                      Interview Feedback
                                    </p>
                                    {app.interview.rating && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <FaStar
                                            key={i}
                                            className={
                                              i < app.interview.rating
                                                ? "text-yellow-400"
                                                : "text-gray-600"
                                            }
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-300">
                                    {app.interview.feedbackNotes}
                                  </p>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Company Response */}
                        {app.response && (
                          <div
                            className={`p-4 rounded-xl ${
                              app.status === "accepted"
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-slate-900/40 border border-gray-700"
                            }`}
                          >
                            <p className="text-sm text-gray-400 mb-1">
                              Company Response:
                            </p>
                            <p className="text-gray-300 text-sm">
                              {app.response}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-col gap-2 lg:w-64">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowModal("details");
                          }}
                          className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaEye /> View Timeline
                        </button>

                        {app.status === "assignment-sent" && (
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowModal("submit-assignment");
                            }}
                            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold animate-pulse"
                          >
                            <FaUpload /> Submit Assignment
                          </button>
                        )}

                        {app.status === "interview-scheduled" &&
                          app.interview?.meetingLink && (
                            <a
                              href={app.interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                              <FaExternalLinkAlt /> Join Interview
                            </a>
                          )}

                        {app.status === "accepted" && (
                          <button
                            onClick={() => navigate("/messages")}
                            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                          >
                            <FaEnvelope /> Message Company
                          </button>
                        )}

                        {![
                          "accepted",
                          "rejected",
                          "auto-rejected",
                          "interview-completed",
                        ].includes(app.status) && (
                          <button
                            onClick={() => handleWithdrawApplication(app._id)}
                            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <FaTimes /> Withdraw
                          </button>
                        )}

                        {(app.status === "rejected" ||
                          app.status === "auto-rejected") && (
                          <div className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm text-center">
                            Application Closed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ ADD DEADLINE INDICATOR */}
                    {app.status === "assignment-sent" && assignmentDeadline && (
                      <div
                        className={`mt-4 p-4 rounded-xl ${assignmentDeadline.bgColor} border ${assignmentDeadline.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-300 mb-1">
                              {assignmentDeadline.icon} Assignment Deadline
                            </p>
                            <p
                              className={`text-lg font-bold ${assignmentDeadline.color}`}
                            >
                              {assignmentDeadline.text}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                app.assignment.deadline
                              ).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAssignmentApp(app);
                              setShowAssignmentModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                          >
                            <FaUpload />
                            Submit Now
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ✅ ADD INTERVIEW REMINDER */}
                    {app.status === "interview-scheduled" && interviewTime && (
                      <div
                        className={`mt-4 p-4 rounded-xl ${interviewTime.bgColor} border ${interviewTime.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-300 mb-1">
                              {interviewTime.icon} Interview Scheduled
                            </p>
                            <p
                              className={`text-lg font-bold ${interviewTime.color}`}
                            >
                              {interviewTime.text}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                app.interview.scheduledDate
                              ).toLocaleString()}
                            </p>
                          </div>
                          <a
                            href={app.interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                          >
                            <FaVideo />
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Submit Assignment Modal */}
      {showModal === "submit-assignment" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-orange-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaUpload className="text-orange-400" />
                Submit Assignment
              </h2>
              <button
                onClick={() => {
                  setShowModal(null);
                  setAssignmentSubmission({
                    submissionUrl: "",
                    submissionNotes: "",
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900/60 rounded-xl">
              <h3 className="text-white font-semibold mb-2">
                {selectedApplication.assignment?.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                {selectedApplication.assignment?.description}
              </p>
              {selectedApplication.assignment?.deadline && (
                <p className="text-xs text-orange-400 flex items-center gap-2">
                  <FaClock />
                  Deadline:{" "}
                  {new Date(
                    selectedApplication.assignment.deadline
                  ).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaLink />
                  Submission URL * (GitHub, Live Demo, Google Drive, etc.)
                </label>
                <input
                  type="url"
                  value={assignmentSubmission.submissionUrl}
                  onChange={(e) =>
                    setAssignmentSubmission({
                      ...assignmentSubmission,
                      submissionUrl: e.target.value,
                    })
                  }
                  placeholder="https://github.com/username/project or https://demo.example.com"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Make sure your repository/demo is public and
                  well-documented
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaFileAlt />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={assignmentSubmission.submissionNotes}
                  onChange={(e) =>
                    setAssignmentSubmission({
                      ...assignmentSubmission,
                      submissionNotes: e.target.value,
                    })
                  }
                  placeholder="Explain your approach, technologies used, challenges faced, etc."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-300 flex items-start gap-2">
                  <FaLightbulb className="mt-1" />
                  <span>
                    The company will review your submission. Make sure to
                    include:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Working demo or repository link</li>
                      <li>Clear README with setup instructions</li>
                      <li>Any credentials needed for testing</li>
                    </ul>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmitAssignment}
                disabled={!assignmentSubmission.submissionUrl}
                className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FaUpload />
                Submit Assignment
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  setAssignmentSubmission({
                    submissionUrl: "",
                    submissionNotes: "",
                  });
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Timeline Modal */}
      {showModal === "details" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Application Timeline
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900/60 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedApplication.job?.title}
              </h3>
              <p className="text-gray-400">
                {selectedApplication.job?.company?.organization}
              </p>
            </div>

            {/* Timeline */}
            {selectedApplication.timeline &&
              selectedApplication.timeline.length > 0 && (
                <div className="space-y-4">
                  {selectedApplication.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            idx === 0 ? "bg-emerald-500" : "bg-gray-600"
                          }`}
                        ></div>
                        {idx < selectedApplication.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div
                          className={`p-4 rounded-xl ${
                            idx === 0
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-slate-900/60 border border-gray-700"
                          }`}
                        >
                          <p
                            className={`font-semibold mb-1 ${
                              idx === 0 ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {event.status}
                          </p>
                          {event.notes && (
                            <p className="text-sm text-gray-400 mb-2">
                              {event.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            <button
              onClick={() => setShowModal(null)}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
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
    </>
  );
};

export default FreelancerDashboard;
