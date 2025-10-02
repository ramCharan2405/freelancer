import React, { useState } from "react";
import {
  FaTimes,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaDownload,
  FaCheck,
  FaTimesCircle,
  FaSpinner,
  FaStar,
  FaGraduationCap,
  FaCode,
  FaClock,
  FaFileAlt,
  FaExternalLinkAlt,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

const ApplicationDetailModal = ({
  application,
  onClose,
  onStatusChange,
  processing,
}) => {
  const [response, setResponse] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [downloading, setDownloading] = useState(false);

  if (!application) return null;

  const freelancer = application.freelancer || {};

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
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

  const handleStatusUpdate = (status) => {
    if (showResponseInput) {
      onStatusChange(application._id, status, response);
      setShowResponseInput(false);
      setResponse("");
      setActionType(null);
    } else {
      setActionType(status);
      setShowResponseInput(true);
    }
  };

  const handleDownloadResume = async () => {
    if (!freelancer.resume) {
      alert("Resume not available for download");
      return;
    }

    try {
      setDownloading(true);
      console.log("🔄 Downloading resume from:", freelancer.resume);

      // Try to download directly from URL first
      const response = await fetch(freelancer.resume);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;

      // Use original filename if available, otherwise generate one
      const filename =
        freelancer.resumeOriginalName ||
        `${freelancer.fullName || "Resume"}_Resume.pdf`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Resume downloaded successfully");
    } catch (error) {
      console.error("❌ Resume download failed:", error);

      // Fallback: Open in new tab
      try {
        window.open(freelancer.resume, "_blank");
        console.log("✅ Resume opened in new tab as fallback");
      } catch (fallbackError) {
        console.error("❌ Fallback failed:", fallbackError);
        alert("Unable to download resume. Please try again later.");
      }
    } finally {
      setDownloading(false);
    }
  };

  // Render star rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-600" />);
      }
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/30">
          <h2 className="text-2xl font-bold text-white">Application Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Freelancer Profile Section */}
          <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  {freelancer.profilePicture ? (
                    <img
                      src={freelancer.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-2xl" />
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {freelancer.fullName || "Unknown Freelancer"}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-400 mt-1">
                      {getExperienceIcon(freelancer.experience)}
                      <span>{freelancer.experience || "Not specified"}</span>
                    </div>

                    {/* Rating Section */}
                    {freelancer.rating !== undefined && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex space-x-1">
                          {renderRating(freelancer.rating || 0)}
                        </div>
                        <span className="text-gray-400 text-sm">
                          ({freelancer.rating?.toFixed(1) || "0.0"}/5.0)
                        </span>
                        {freelancer.reviewCount > 0 && (
                          <span className="text-gray-500 text-sm">
                            • {freelancer.reviewCount} review
                            {freelancer.reviewCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status?.charAt(0).toUpperCase() +
                      application.status?.slice(1)}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Phone */}
                  {freelancer.phone && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FaPhone className="text-green-400" />
                      <span>{freelancer.phone}</span>
                    </div>
                  )}

                  {/* Location */}
                  {freelancer.location && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FaMapMarkerAlt className="text-red-400" />
                      <span>{freelancer.location}</span>
                    </div>
                  )}

                  {/* Portfolio */}
                  {freelancer.portfolio && (
                    <div className="flex items-center space-x-3">
                      <FaGlobe className="text-purple-400" />
                      <a
                        href={
                          freelancer.portfolio.startsWith("http")
                            ? freelancer.portfolio
                            : `https://${freelancer.portfolio}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Portfolio{" "}
                        <FaExternalLinkAlt className="inline ml-1 text-xs" />
                      </a>
                    </div>
                  )}

                  {/* GitHub */}
                  {freelancer.github && (
                    <div className="flex items-center space-x-3">
                      <FaGithub className="text-gray-400" />
                      <a
                        href={
                          freelancer.github.startsWith("http")
                            ? freelancer.github
                            : `https://github.com/${freelancer.github}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        GitHub Profile{" "}
                        <FaExternalLinkAlt className="inline ml-1 text-xs" />
                      </a>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {freelancer.linkedin && (
                    <div className="flex items-center space-x-3">
                      <FaLinkedin className="text-blue-500" />
                      <a
                        href={
                          freelancer.linkedin.startsWith("http")
                            ? freelancer.linkedin
                            : `https://linkedin.com/in/${freelancer.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        LinkedIn Profile{" "}
                        <FaExternalLinkAlt className="inline ml-1 text-xs" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Resume Download Button */}
                  {freelancer.resume && (
                    <button
                      onClick={handleDownloadResume}
                      disabled={downloading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaDownload />
                      )}
                      <span>
                        {downloading ? "Downloading..." : "Download Resume"}
                      </span>
                    </button>
                  )}

                  {/* Accept/Reject Buttons */}
                  {application.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate("accepted")}
                        disabled={processing}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {processing ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => handleStatusUpdate("rejected")}
                        disabled={processing}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {processing ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {freelancer.skills && freelancer.skills.length > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCode className="mr-2 text-blue-400" />
                Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio Section */}
          {freelancer.bio && (
            <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaUser className="mr-2 text-emerald-400" />
                About
              </h4>
              <p className="text-gray-300 leading-relaxed">{freelancer.bio}</p>
            </div>
          )}

          {/* Application Details */}
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-yellow-400" />
              Application Information
            </h4>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Applied for:</p>
                <p className="text-white font-semibold">
                  {application.job?.title || "Unknown Job"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Application Date:</p>
                <p className="text-gray-300">
                  {formatDate(application.createdAt)}
                </p>
              </div>

              {application.coverLetter && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Cover Letter:</p>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {application.responseDate && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Response Date:</p>
                  <p className="text-gray-300">
                    {formatDate(application.responseDate)}
                  </p>
                </div>
              )}

              {application.response && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Your Response:</p>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">
                      {application.response}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Input Section */}
          {showResponseInput && application.status === "pending" && (
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                {actionType === "accepted"
                  ? "Accept Application"
                  : "Reject Application"}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Message to Freelancer (Optional):
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder={
                      actionType === "accepted"
                        ? "Welcome message, next steps, contact information..."
                        : "Feedback about the application, reasons for rejection..."
                    }
                    className="w-full p-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
                    rows="4"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStatusUpdate(actionType)}
                    disabled={processing}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      actionType === "accepted"
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {processing ? (
                      <FaSpinner className="animate-spin" />
                    ) : actionType === "accepted" ? (
                      <FaCheck />
                    ) : (
                      <FaTimesCircle />
                    )}
                    <span>
                      Confirm {actionType === "accepted" ? "Accept" : "Reject"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowResponseInput(false);
                      setResponse("");
                      setActionType(null);
                    }}
                    className="px-6 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
