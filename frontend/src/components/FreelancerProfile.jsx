import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalPopup from "./modalPopup";
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaCode,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FreelancerProfile = ({ isOpen, onClose }) => {
  const [freelancer, setFreelancer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    about: "",
    skills: [],
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [existingData, setExistingData] = useState("");
  const freelancerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (freelancerId && token) {
      fetchFreelancerData();
    }
  }, [freelancerId, token]);

  const fetchFreelancerData = async () => {
    try {
      setLoading(true);
      setError("");

      // Try the general getFreelancers endpoint first
      const response = await axios.get(
        `http://localhost:8000/api/freelancers/getFreelancers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("All freelancers response:", response.data);

      // Find the current user from the freelancers list
      const currentFreelancer = response.data.find(
        (freelancer) => freelancer._id === freelancerId
      );

      if (currentFreelancer) {
        console.log("Found current freelancer:", currentFreelancer);
        setFreelancer(currentFreelancer);
      } else {
        setError("Freelancer profile not found");
      }
    } catch (err) {
      console.error("Error fetching freelancer data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const updateFreelancer = async (updateData) => {
    try {
      await axios.put(
        `http://localhost:8000/api/freelancers/update/${freelancerId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSave = (data) => {
    const updated = { ...freelancer };
    if (modalType === "about") updated.about = data;
    else if (modalType === "skills")
      updated.skills = data.split(",").map((s) => s.trim());

    setFreelancer(updated);
    updateFreelancer(updated);
    setModalOpen(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/freelancers/upload/avatar/${freelancerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFreelancer((prev) => ({
        ...prev,
        profileImage: res.data.profileImage,
      }));
    } catch (err) {
      console.error("Avatar upload failed", err);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="w-72 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-green-200 p-4">
        <div className="animate-pulse text-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-72 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-red-200 p-4">
        <div className="text-center text-red-600">
          <p className="font-semibold text-sm">Error Loading Profile</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            onClick={fetchFreelancerData}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-green-200 transition-all duration-300 text-sm">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-t-xl border-b border-green-200">
        <label className="cursor-pointer mr-3">
          <div className="relative">
            <img
              src={freelancer.profileImage || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-green-400 shadow"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 text-xs shadow">
              <FaEdit size={8} />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </label>
        <div className="flex flex-col ml-2 flex-1">
          <h2 className="text-sm font-bold text-green-700 truncate">
            {freelancer.fullName || "Freelancer"}
          </h2>
          <p className="text-xs text-gray-600 truncate">{freelancer.email}</p>
        </div>
        <button
          onClick={onClose}
          className="text-green-500 hover:text-red-500 text-lg font-bold transition"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Contact Info */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FaEnvelope className="text-green-500" />
          <span className="truncate">{freelancer.email}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FaPhone className="text-green-500" />
          <span>{freelancer.phone || "No phone"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FaMapMarkerAlt className="text-green-500" />
          <span className="truncate">
            {freelancer.address || "No location"}
          </span>
        </div>

        {/* Experience */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FaBriefcase className="text-green-500" />
          <span>
            {freelancer.experience
              ? `${freelancer.experience} years exp`
              : "Experience not specified"}
          </span>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <FaCode className="text-green-500 text-xs" />
            <h3 className="text-xs font-semibold text-green-700">Skills</h3>
          </div>
          {freelancer.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {freelancer.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{freelancer.skills.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No skills added</p>
          )}
        </div>

        {/* About Section */}
        {freelancer.about && (
          <div className="border-t border-green-100 pt-2">
            <h3 className="text-xs font-semibold text-green-700 mb-1">About</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {freelancer.about}
            </p>
          </div>
        )}

        {/* Social Links */}
        {(freelancer.github || freelancer.linkedin || freelancer.portfolio) && (
          <div className="flex gap-3 justify-center pt-2 border-t border-green-100">
            {freelancer.github && (
              <a
                href={freelancer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition"
                title="GitHub"
              >
                <FaGithub size={16} />
              </a>
            )}
            {freelancer.linkedin && (
              <a
                href={freelancer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition"
                title="LinkedIn"
              >
                <FaLinkedin size={16} />
              </a>
            )}
            {freelancer.portfolio && (
              <a
                href={freelancer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition"
                title="Portfolio"
              >
                <FaGlobe size={16} />
              </a>
            )}
          </div>
        )}

        {/* Edit Profile Button */}
        <div className="pt-2 border-t border-green-100">
          <button
            onClick={() => {
              onClose();
              navigate("/edit-freelancer-profile");
            }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold text-sm flex items-center justify-center space-x-2"
          >
            <FaEdit size={12} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <ModalPopup
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        title={`${modalType === "about" ? "Edit Bio" : "Edit Skills"}`}
        existingData={existingData}
        placeholder={
          modalType === "skills"
            ? "Enter skills separated by commas"
            : "Enter bio"
        }
      />
    </div>
  );
};

export default FreelancerProfile;
