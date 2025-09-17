import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ModalPopup from "./modalPopup";

const ProfileWindow = ({ isOpen, onClose }) => {
  const [fullName, setName] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedIn] = useState("");
  const [about, setAbout] = useState("");
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const userId = localStorage.getItem("userId");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [existingData, setExistingData] = useState("");

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:8000/api/freelancers/${userId}`)
        .then((res) => {
          const data = res.data;
          setName(data.fullName || "");
          setAbout(data.about || "");
          setEducation(data.education || []);
          setSkills(data.skills || []);
          setCertifications(data.certifications || []);
          setGithub(data.github || "");
          setLinkedIn(data.linkedin || "");
        })
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [userId]);

  const updateProfile = async (updateData) => {
    try {
      await axios.put(
        `http://localhost:8000/api/freelancers/${userId}`,
        updateData
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newCerts = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      const updatedCerts = [...certifications, ...newCerts];
      setCertifications(updatedCerts);
      updateProfile({ certifications: updatedCerts });
    }
  };

  const handleSave = (data) => {
    let update = {};
    if (modalType === "about") {
      setAbout(data);
      update = { about: data };
    } else if (modalType === "education") {
      const updatedEducation = [...education, data];
      setEducation(updatedEducation);
      update = { education: updatedEducation };
    } else if (modalType === "skills") {
      const updatedSkills = [...skills, data];
      setSkills(updatedSkills);
      update = { skills: updatedSkills };
    }
    updateProfile(update);
    setModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-green-200 transition-all duration-300 w-72 p-5 text-sm">
      {/* Header */}
      <div className="flex items-center mb-4">
        <img
          src="https://tse1.mm.bing.net/th?id=OIP.GHGGLYe7gDfZUzF_tElxiQHaHa&pid=Api&P=0&h=180"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-green-400 shadow"
        />
        <div className="ml-3">
          <div className="font-bold text-green-700 truncate">
            {fullName || "User"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-green-500 hover:text-red-500 text-xl font-bold transition"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex space-x-3 mb-4 justify-center">
        <a
          href={github.startsWith("http") ? github : `https://${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition"
          title="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>
      </div>

      {/* About */}
      <div className="mb-3">
        <div className="font-semibold text-green-700 mb-1">About</div>
        <div className="text-xs text-gray-700 mb-1">
          {about || "No details yet."}
        </div>
        <button
          className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition text-xs font-semibold"
          onClick={() => {
            setModalType("about");
            setExistingData(about);
            setModalOpen(true);
          }}
        >
          {about ? "Edit" : "+ Add"}
        </button>
      </div>

      {/* Education */}
      <div className="mb-3">
        <div className="font-semibold text-green-700 mb-1">Education</div>
        {education.length > 0 ? (
          <ul className="list-disc list-inside text-xs text-gray-700 mb-1">
            {education.map((edu, idx) => (
              <li key={idx}>{edu}</li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-gray-700 mb-1">None</div>
        )}
        <button
          className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition text-xs font-semibold"
          onClick={() => {
            setModalType("education");
            setModalOpen(true);
          }}
        >
          + Add
        </button>
      </div>

      {/* Skills */}
      <div className="mb-3">
        <div className="font-semibold text-green-700 mb-1">Skills</div>
        {skills.length > 0 ? (
          <ul className="list-disc list-inside text-xs text-gray-700 mb-1">
            {skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-gray-700 mb-1">None</div>
        )}
        <button
          className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition text-xs font-semibold"
          onClick={() => {
            setModalType("skills");
            setModalOpen(true);
          }}
        >
          + Add
        </button>
      </div>

      {/* Certifications */}
      <div>
        <div className="font-semibold text-green-700 mb-1">Certifications</div>
        {certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-1">
            {certifications.map((cert, idx) => (
              <img
                key={idx}
                src={cert}
                alt={`Cert ${idx}`}
                className="w-8 h-8 object-cover rounded border border-green-200"
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-700 mb-1">None</div>
        )}
        <label className="block">
          <span className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-1 px-2 rounded-lg cursor-pointer transition text-xs font-semibold inline-block">
            Upload
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </span>
        </label>
      </div>

      {/* Modal */}
      <ModalPopup
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        title={`Add ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
        existingData={existingData}
        placeholder={`Enter ${modalType}`}
      />
    </div>
  );
};

export default ProfileWindow;
