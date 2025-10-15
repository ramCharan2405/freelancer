import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Update the import statement at the top (around line 3-18)
import {
  FaBriefcase,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaChartLine,
  FaUserCheck,
  FaClipboardList,
  FaCalendarAlt,
  FaEnvelope,
  FaStar,
  FaGithub,
  FaExternalLinkAlt,
  FaFilter,
  FaSearch,
  FaFileAlt,
  FaTimesCircle,
  FaExclamationCircle,
  FaVideo, 
  FaUpload,   
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    qualifiedApplications: 0,
    assignmentsSent: 0,
    interviewsScheduled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'assignment', 'interview', 'review', 'details'
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    meetingLink: "",
    duration: "30 minutes",
    notes: "",
  });
  const [reviewForm, setReviewForm] = useState({
    reviewNotes: "",
    reviewScore: 50,
    decision: "approve",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch jobs
      const jobsRes = await fetch(
        "http://localhost:8000/api/jobs/company/my-jobs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const jobsData = await jobsRes.json();

      // Fetch applications
      const appsRes = await fetch(
        "http://localhost:8000/api/applications/company",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const appsData = await appsRes.json();

      if (jobsData.success) {
        setJobs(jobsData.jobs || []);
      }

      if (appsData.success) {
        const apps = appsData.applications || [];
        setApplications(apps);

        // Calculate stats
        const stats = {
          totalJobs: jobsData.jobs?.length || 0,
          activeJobs:
            jobsData.jobs?.filter((j) => j.status === "active").length || 0,
          totalApplications: apps.length,
          pendingApplications: apps.filter(
            (a) => a.status === "pending" || a.status === "under-review"
          ).length,
          qualifiedApplications: apps.filter((a) => a.status === "qualified")
            .length,
          assignmentsSent: apps.filter(
            (a) =>
              a.status === "assignment-sent" ||
              a.status === "assignment-submitted"
          ).length,
          interviewsScheduled: apps.filter(
            (a) => a.status === "interview-scheduled"
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
      "under-review": <FaSearch />,
      qualified: <FaCheckCircle />,
      "in-review": <FaEye />,
      "assignment-sent": <FaClipboardList />,
      "assignment-submitted": <FaFileAlt />,
      "interview-scheduled": <FaCalendarAlt />,
      "interview-completed": <FaUserCheck />,
      accepted: <FaCheckCircle />,
      rejected: <FaTimes />,
    };
    return icons[status] || <FaClock />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "New Application",
      "auto-rejected": "Auto-Rejected",
      "under-review": "Under Review",
      qualified: "Qualified",
      "in-review": "In Review",
      "assignment-sent": "Assignment Sent",
      "assignment-submitted": "Assignment Submitted",
      "interview-scheduled": "Interview Scheduled",
      "interview-completed": "Interview Done",
      accepted: "Hired",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const handleSendAssignment = async () => {
    if (
      !assignmentForm.title ||
      !assignmentForm.description ||
      !assignmentForm.deadline
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${selectedApplication._id}/assignment/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentForm),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Assignment sent successfully!");
        setShowModal(null);
        setAssignmentForm({ title: "", description: "", deadline: "" });
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to send assignment");
      }
    } catch (error) {
      console.error("Error sending assignment:", error);
      alert("Error sending assignment");
    }
  };

  const handleScheduleInterview = async () => {
    if (
      !interviewForm.scheduledDate ||
      !interviewForm.scheduledTime ||
      !interviewForm.meetingLink
    ) {
      alert("Please fill required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${selectedApplication._id}/interview/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(interviewForm),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Interview scheduled successfully!");
        setShowModal(null);
        setInterviewForm({
          scheduledDate: "",
          scheduledTime: "",
          meetingLink: "",
          duration: "30 minutes",
          notes: "",
        });
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Error scheduling interview");
    }
  };

  const handleReviewAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${selectedApplication._id}/assignment/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewForm),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(
          reviewForm.decision === "approve"
            ? "Assignment approved!"
            : "Assignment rejected"
        );
        setShowModal(null);
        setReviewForm({
          reviewNotes: "",
          reviewScore: 50,
          decision: "approve",
        });
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to review assignment");
      }
    } catch (error) {
      console.error("Error reviewing assignment:", error);
      alert("Error reviewing assignment");
    }
  };

  const handleCompleteInterview = async () => {
    const feedbackNotes = prompt("Enter interview feedback:");
    const rating = prompt("Rate the interview (1-5):");

    if (!feedbackNotes || !rating || rating < 1 || rating > 5) {
      alert("Invalid input");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${selectedApplication._id}/interview/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            feedbackNotes,
            rating: parseInt(rating),
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Interview marked as completed!");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to complete interview");
      }
    } catch (error) {
      console.error("Error completing interview:", error);
      alert("Error completing interview");
    }
  };

  const handleUpdateStatus = async (
    applicationId,
    newStatus,
    response = ""
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus, response }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Status updated successfully!");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      app.freelancer?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = Math.round((deadlineDate - now) / (1000 * 60 * 60));
    const daysLeft = Math.round(hoursLeft / 24);
    
    if (hoursLeft < 0) {
      return {
        status: 'expired',
        text: 'Expired',
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        icon: '⏰'
      };
    } else if (hoursLeft < 24) {
      return {
        status: 'urgent',
        text: `${hoursLeft}h left`,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        icon: '🔥'
      };
    } else if (daysLeft <= 3) {
      return {
        status: 'soon',
        text: `${daysLeft}d left`,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        icon: '⚠️'
      };
    } else {
      return {
        status: 'normal',
        text: `${daysLeft}d left`,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        icon: '✅'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Company Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your jobs and recruitment pipeline
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <FaBriefcase className="text-2xl text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-white">
                {stats.activeJobs}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">Active Jobs</h3>
            <p className="text-xs text-gray-500 mt-1">
              of {stats.totalJobs} total
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FaUsers className="text-2xl text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-white">
                {stats.totalApplications}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Applications</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingApplications} pending review
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FaUserCheck className="text-2xl text-green-400" />
              </div>
              <span className="text-3xl font-bold text-white">
                {stats.qualifiedApplications}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">Qualified Candidates</h3>
            <p className="text-xs text-gray-500 mt-1">High skill match</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FaCalendarAlt className="text-2xl text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-white">
                {stats.interviewsScheduled}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">Interviews Scheduled</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats.assignmentsSent} assignments out
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {["overview", "applications", "jobs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by freelancer or job..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">New Applications</option>
                    <option value="qualified">Qualified</option>
                    <option value="under-review">Under Review</option>
                    <option value="assignment-sent">Assignment Sent</option>
                    <option value="assignment-submitted">
                      Assignment Submitted
                    </option>
                    <option value="interview-scheduled">
                      Interview Scheduled
                    </option>
                    <option value="interview-completed">
                      Interview Completed
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-12 border border-emerald-500/20 text-center">
                <FaExclamationCircle className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const assignmentDeadline =
                    app.assignment?.deadline && !app.assignment?.submittedAt
                      ? getDeadlineStatus(app.assignment.deadline)
                      : null;

                  return (
                    <div
                      key={app._id}
                      className="bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Freelancer Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                              {app.freelancer?.fullName?.charAt(0) || "F"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">
                                  {app.freelancer?.fullName || "Unknown"}
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
                              <p className="text-gray-400 text-sm mb-2">
                                Applied for:{" "}
                                <span className="text-emerald-400 font-semibold">
                                  {app.job?.title}
                                </span>
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FaClock />
                                  {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaEnvelope />
                                  {app.freelancer?.email}
                                </span>
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
                              <div className="w-full bg-slate-900/60 rounded-full h-2">
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
                              <div className="flex gap-2 mt-2">
                                {app.matchedSkills?.length > 0 && (
                                  <div className="flex-1">
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
                                  <div className="flex-1">
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

                          {/* Cover Letter */}
                          {app.coverLetter && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">
                                Cover Letter:
                              </p>
                              <p className="text-gray-300 text-sm bg-slate-900/40 p-3 rounded-lg">
                                {app.coverLetter.substring(0, 150)}
                                {app.coverLetter.length > 150 && "..."}
                              </p>
                            </div>
                          )}

                          {/* Assignment Info */}
                          {app.assignment && (
                            <div className="mb-4 bg-slate-900/40 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <FaClipboardList className="text-orange-400" />
                                <span className="text-sm font-semibold text-orange-400">
                                  Assignment
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">
                                {app.assignment.title}
                              </p>
                              {app.assignment.submissionUrl && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FaGithub className="text-gray-400" />
                                  <a
                                    href={app.assignment.submissionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                  >
                                    View Submission{" "}
                                    <FaExternalLinkAlt className="text-xs" />
                                  </a>
                                </div>
                              )}
                              {app.assignment.deadline && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Deadline:{" "}
                                  {new Date(
                                    app.assignment.deadline
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Interview Info */}
                          {app.interview && (
                            <div className="mb-4 bg-slate-900/40 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <FaCalendarAlt className="text-indigo-400" />
                                <span className="text-sm font-semibold text-indigo-400">
                                  Interview
                                </span>
                              </div>
                              {app.interview.scheduledDate && (
                                <p className="text-sm text-gray-300 mb-1">
                                  📅{" "}
                                  {new Date(
                                    app.interview.scheduledDate
                                  ).toLocaleDateString()}{" "}
                                  at {app.interview.scheduledTime}
                                </p>
                              )}
                              {app.interview.meetingLink && (
                                <a
                                  href={app.interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                                >
                                  Join Meeting{" "}
                                  <FaExternalLinkAlt className="text-xs" />
                                </a>
                              )}
                              {app.interview.rating && (
                                <div className="flex items-center gap-1 mt-2">
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
                            <FaEye /> View Details
                          </button>

                          {(app.status === "pending" ||
                            app.status === "under-review" ||
                            app.status === "qualified") && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowModal("assignment");
                                }}
                                className="w-full px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaClipboardList /> Send Assignment
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowModal("interview");
                                }}
                                className="w-full px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaCalendarAlt /> Schedule Interview
                              </button>
                            </>
                          )}

                          {app.status === "assignment-submitted" && (
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowModal("review");
                              }}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                            >
                              Review Assignment
                            </button>
                          )}

                          {app.status === "interview-scheduled" && (
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                handleCompleteInterview();
                              }}
                              className="w-full px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors flex items-center justify-center gap-2"
                            >
                              <FaUserCheck /> Complete Interview
                            </button>
                          )}

                          {(app.status === "interview-completed" ||
                            app.status === "in-review" ||
                            app.status === "qualified") && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    app._id,
                                    "accepted",
                                    "Congratulations! You have been selected."
                                  )
                                }
                                className="w-full px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaCheckCircle /> Accept & Hire
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    "Enter rejection reason (optional):"
                                  );
                                  handleUpdateStatus(
                                    app._id,
                                    "rejected",
                                    reason || "Thank you for your interest."
                                  );
                                }}
                                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaTimes /> Reject
                              </button>
                            </>
                          )}

                          {app.status === "auto-rejected" && (
                            <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm text-center">
                              Auto-rejected due to skill mismatch
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ✅ SHOW ASSIGNMENT STATUS TO COMPANY */}
                      {app.status === "assignment-sent" && assignmentDeadline && (
                        <div
                          className={`mt-4 p-4 rounded-xl ${assignmentDeadline.bgColor} border ${assignmentDeadline.borderColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-300">
                                {assignmentDeadline.icon} Assignment Status
                              </p>
                              <p
                                className={`text-lg font-bold ${assignmentDeadline.color}`}
                              >
                                {assignmentDeadline.status === "expired"
                                  ? "Deadline Expired - Not Submitted"
                                  : `Deadline: ${assignmentDeadline.text}`}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Due:{" "}
                                {new Date(app.assignment.deadline).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ✅ SHOW SUBMITTED ASSIGNMENTS */}
                      {app.status === "assignment-submitted" && (
                        <div className="mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-300">
                                ✅ Assignment Submitted
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Submitted:{" "}
                                {new Date(app.assignment.submittedAt).toLocaleString()}
                              </p>
                              <a
                                href={app.assignment.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
                              >
                                View Submission →
                              </a>
                            </div>
                            {/* ✅ FIXED BUTTON - Remove the duplicate */}
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowModal("review");
                              }}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                            >
                              Review Assignment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ✅ SHOW UPCOMING INTERVIEWS */}
                      {app.status === "interview-scheduled" && (
                        <div className="mt-4 p-4 rounded-xl bg-purple-500/20 border border-purple-500/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-300">
                                📅 Interview Scheduled
                              </p>
                              <p className="text-lg font-bold text-purple-400">
                                {new Date(app.interview.scheduledDate).toLocaleDateString()}{" "}
                                at {app.interview.scheduledTime}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Duration: {app.interview.duration}
                              </p>
                            </div>
                            <a
                              href={app.interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold flex items-center gap-2"
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
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Job Postings
              </h2>
              <button
                onClick={() => navigate("/post-job")}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <FaBriefcase /> Post New Job
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-12 border border-emerald-500/20 text-center">
                <FaBriefcase className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-4">No jobs posted yet</p>
                <button
                  onClick={() => navigate("/post-job")}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <FaBriefcase /> Post Your First Job
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {job.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            job.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills?.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaUsers />
                          {job.applicationsCount || 0} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:w-48">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-job/${job._id}`)}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Overview Tab - KEEP ONLY THIS ONE */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-emerald-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recruitment Pipeline
              </h2>

              {/* Pipeline visualization */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-900/60 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.pendingApplications}
                  </div>
                  <p className="text-sm text-gray-400">New Applications</p>
                </div>
                <div className="text-center p-4 bg-slate-900/60 rounded-xl">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {stats.qualifiedApplications}
                  </div>
                  <p className="text-sm text-gray-400">Qualified</p>
                </div>
                <div className="text-center p-4 bg-slate-900/60 rounded-xl">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {stats.assignmentsSent}
                  </div>
                  <p className="text-sm text-gray-400">Assignments</p>
                </div>
                <div className="text-center p-4 bg-slate-900/60 rounded-xl">
                  <div className="text-3xl font-bold text-indigo-400 mb-2">
                    {stats.interviewsScheduled}
                  </div>
                  <p className="text-sm text-gray-400">Interviews</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-emerald-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Applications
              </h2>
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {app.freelancer?.fullName?.charAt(0) || "F"}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {app.freelancer?.fullName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {app.job?.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals section starts here */}
      {/* Send Assignment Modal */}
      {showModal === "assignment" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaClipboardList className="text-orange-400" />
                Send Assignment
              </h2>
              <button
                onClick={() => {
                  setShowModal(null);
                  setAssignmentForm({
                    title: "",
                    description: "",
                    deadline: "",
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900/60 rounded-xl">
              <p className="text-sm text-gray-400">Sending to:</p>
              <p className="text-white font-semibold">
                {selectedApplication.freelancer?.fullName}
              </p>
              <p className="text-sm text-gray-400">
                for {selectedApplication.job?.title}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Build a Todo App"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the assignment requirements, deliverables, and evaluation criteria..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={assignmentForm.deadline}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      deadline: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSendAssignment}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                Send Assignment
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  setAssignmentForm({
                    title: "",
                    description: "",
                    deadline: "",
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

      {/* Schedule Interview Modal */}
      {showModal === "interview" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-400" />
                Schedule Interview
              </h2>
              <button
                onClick={() => {
                  setShowModal(null);
                  setInterviewForm({
                    scheduledDate: "",
                    scheduledTime: "",
                    meetingLink: "",
                    duration: "30 minutes",
                    notes: "",
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900/60 rounded-xl">
              <p className="text-sm text-gray-400">Interviewing:</p>
              <p className="text-white font-semibold">
                {selectedApplication.freelancer?.fullName}
              </p>
              <p className="text-sm text-gray-400">
                for {selectedApplication.job?.title}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={interviewForm.scheduledDate}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        scheduledDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={interviewForm.scheduledTime}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Meeting Link * (Google Meet, Zoom, etc.)
                </label>
                <input
                  type="url"
                  value={interviewForm.meetingLink}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      meetingLink: e.target.value,
                    })
                  }
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={interviewForm.duration}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      duration: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Any additional information or topics to discuss..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleScheduleInterview}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  setInterviewForm({
                    scheduledDate: "",
                    scheduledTime: "",
                    meetingLink: "",
                    duration: "30 minutes",
                    notes: "",
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

      {/* Review Assignment Modal */}
      {showModal === "review" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaFileAlt className="text-cyan-400" />
                Review Assignment
              </h2>
              <button
                onClick={() => {
                  setShowModal(null);
                  setReviewForm({
                    reviewNotes: "",
                    reviewScore: 50,
                    decision: "approve",
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div className="p-4 bg-slate-900/60 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Assignment:</p>
                <p className="text-white font-semibold mb-2">
                  {selectedApplication.assignment?.title}
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  {selectedApplication.assignment?.description}
                </p>

                {selectedApplication.assignment?.submissionUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Submission:
                    </p>
                    <a
                      href={selectedApplication.assignment.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <FaGithub />
                      {selectedApplication.assignment.submissionUrl}
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                )}

                {selectedApplication.assignment?.submissionNotes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Notes from freelancer:
                    </p>
                    <p className="text-gray-300 text-sm">
                      {selectedApplication.assignment.submissionNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reviewForm.reviewScore}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      reviewScore: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>0</span>
                  <span className="text-2xl font-bold text-white">
                    {reviewForm.reviewScore}
                  </span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewForm.reviewNotes}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      reviewNotes: e.target.value,
                    })
                  }
                  placeholder="Provide detailed feedback on the submission..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setReviewForm({ ...reviewForm, decision: "approve" })
                    }
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      reviewForm.decision === "approve"
                        ? "bg-green-500 text-white"
                        : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      setReviewForm({ ...reviewForm, decision: "reject" })
                    }
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      reviewForm.decision === "reject"
                        ? "bg-red-500 text-white"
                        : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleReviewAssignment}
                className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-colors ${
                  reviewForm.decision === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  setReviewForm({
                    reviewNotes: "",
                    reviewScore: 50,
                    decision: "approve",
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

      {/* Application Details Modal */}
      {showModal === "details" && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Application Details
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Timeline */}
            {selectedApplication.timeline &&
              selectedApplication.timeline.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Application Timeline
                  </h3>
                  <div className="space-y-3">
                    {selectedApplication.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          {idx < selectedApplication.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-emerald-500/30 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-white font-semibold">
                            {event.status}
                          </p>
                          <p className="text-sm text-gray-400">{event.notes}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <button
              onClick={() => setShowModal(null)}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
