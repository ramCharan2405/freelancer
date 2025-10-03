import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";

const Jobs = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applying, setApplying] = useState(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated && user?.role === "freelancer") {
      fetchAppliedJobs();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, locationFilter, experienceFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/jobs/all", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        setJobs(data.jobs || []);
      } else {
        setError("Failed to load jobs");
      }
    } catch (error) {
      setError("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

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
        const appliedJobIds = new Set(
          data.applications?.map((app) => app.job?._id).filter(Boolean) || []
        );
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {}
  };

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (experienceFilter) {
      filtered = filtered.filter((job) => job.experience === experienceFilter);
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        break;
    }

    setFilteredJobs(filtered);
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    if (typeof salary === "string" && salary.includes("$")) return salary;
    if (typeof salary === "number") return `$${salary.toLocaleString()}`;
    return salary;
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

  const getTimeSincePosted = (dateString) => {
    try {
      const posted = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - posted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return "Recently posted";
    }
  };

  const openApplicationModal = (job) => {
    if (!isAuthenticated) {
      alert("Please login to apply for jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "freelancer") {
      alert("Only freelancers can apply for jobs");
      return;
    }

    if (appliedJobs.has(job._id)) {
      alert("You have already applied for this job");
      return;
    }

    setSelectedJob(job);
    setCoverLetter("");
    setShowApplicationModal(true);
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setCoverLetter("");
  };

  const handleApplyForJob = async () => {
    if (!selectedJob) return;

    try {
      setApplying((prev) => new Set([...prev, selectedJob._id]));

      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/applications/apply",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: selectedJob._id,
            coverLetter: coverLetter.trim(),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();

        setAppliedJobs((prev) => new Set([...prev, selectedJob._id]));

        alert("Application submitted successfully!");
        closeApplicationModal();
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to submit application");
      }
    } catch (error) {
      alert("Error submitting application");
    } finally {
      setApplying((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedJob._id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading jobs...</p>
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
            Browse Jobs
          </h1>
          <p className="text-gray-400 mt-2">
            Find your next opportunity from {filteredJobs.length} available jobs
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>

            {}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>

            {}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600/30 rounded-lg text-white focus:border-emerald-500/50 focus:outline-none"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Intermediate</option>
              <option value="senior">Senior</option>
            </select>

            {}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600/30 rounded-lg text-white focus:border-emerald-500/50 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>

        {}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <FaBriefcase className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No jobs found matching your criteria
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-slate-800/60 backdrop-blur-2xl border border-gray-600/30 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {job.title || "Untitled Job"}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center space-x-1">
                            <FaBuilding className="text-emerald-400" />
                            <span>
                              {job.company?.companyName ||
                                job.company?.organization ||
                                "Unknown Company"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaClock className="text-blue-400" />
                            <span>{getTimeSincePosted(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {}
                      {appliedJobs.has(job._id) && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          <FaCheckCircle />
                          <span>Applied</span>
                        </div>
                      )}
                    </div>

                    {}
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {job.description || "No description available"}
                    </p>

                    {}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
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

                      {job.experience && (
                        <div className="flex items-center space-x-1">
                          <FaBriefcase className="text-purple-400" />
                          <span className="capitalize">
                            {job.experience} Level
                          </span>
                        </div>
                      )}
                    </div>

                    {}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 6).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 6 && (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                              +{job.skills.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {}
                <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>

                    {isAuthenticated && user?.role === "freelancer" && (
                      <button
                        onClick={() => openApplicationModal(job)}
                        disabled={
                          appliedJobs.has(job._id) || applying.has(job._id)
                        }
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-300 ${
                          appliedJobs.has(job._id)
                            ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                            : applying.has(job._id)
                            ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105"
                        }`}
                      >
                        {applying.has(job._id) ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : appliedJobs.has(job._id) ? (
                          <>
                            <FaCheckCircle />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <FaHeart />
                            <span>I'm Interested</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-400">
                    {job.jobType && (
                      <span className="capitalize bg-slate-700/50 px-3 py-1 rounded-full">
                        {job.jobType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {showApplicationModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {}
              <div className="sticky top-0 bg-slate-800 border-b border-gray-600/30 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Apply for {selectedJob.title}
                  </h2>
                  <p className="text-gray-400">
                    {selectedJob.company?.companyName ||
                      selectedJob.company?.organization ||
                      "Unknown Company"}
                  </p>
                </div>
                <button
                  onClick={closeApplicationModal}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {}
              <div className="p-6">
                {}
                <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Job Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FaDollarSign className="text-emerald-400" />
                      <span>
                        {formatSalary(selectedJob.salary || selectedJob.budget)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FaMapMarkerAlt className="text-teal-400" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FaBriefcase className="text-purple-400" />
                      <span className="capitalize">
                        {selectedJob.experience} Level
                      </span>
                    </div>
                  </div>
                </div>

                {}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're the right fit for this job..."
                    className="w-full h-32 p-4 bg-slate-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/50 focus:outline-none resize-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {coverLetter.length}/500 characters
                  </p>
                </div>

                {}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <FaExclamationCircle className="text-blue-400 mt-1" />
                    <div>
                      <p className="text-blue-400 font-semibold">
                        Application Notice
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Your profile information will be shared with the
                        employer. Make sure your profile is complete and
                        up-to-date.
                      </p>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex space-x-4">
                  <button
                    onClick={handleApplyForJob}
                    disabled={applying.has(selectedJob._id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying.has(selectedJob._id) ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FaHeart />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={closeApplicationModal}
                    className="px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
