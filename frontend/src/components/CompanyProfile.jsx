import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalPopup from "./modalPopup";
import { FaGlobe, FaBuilding } from "react-icons/fa";

const CompanyProfile = ({ isOpen, onClose }) => {
  const [company, setCompany] = useState({
    organization: "",
    email: "",
    contact: "",
    address: "",
    about: "",
    website: "",
    logo: "",
    projects: [],
    certifications: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [existingData, setExistingData] = useState("");
  const companyId = localStorage.getItem("userId");

  useEffect(() => {
    if (companyId) {
      axios
        .get(`http://localhost:8000/api/companies/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setCompany(res.data))
        .catch((err) => console.error("Error fetching company data", err));
    }
  }, [companyId]);

  const updateCompany = async (updateData) => {
    try {
      await axios.put(
        `http://localhost:8000/api/companies/update`,
        updateData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSave = (data) => {
    const updated = { ...company };
    if (modalType === "about") updated.about = data;
    else if (modalType === "projects") updated.projects.push(data);
    else if (modalType === "website") updated.website = data;

    setCompany(updated);
    updateCompany(updated);
    setModalOpen(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map((file) =>
      URL.createObjectURL(file)
    );
    const updatedCerts = [...company.certifications, ...files];
    setCompany({ ...company, certifications: updatedCerts });
    updateCompany({ certifications: updatedCerts });
  };

  if (!isOpen) return null;

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/companies/upload/logo`,
        formData
      );
      setCompany((prev) => ({ ...prev, logo: res.data.logo }));
    } catch (err) {
      console.error("Logo upload failed", err);
    }
  };

  return (
    <div className="absolute top-16 right-10 w-80 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-green-200 z-[100] transition-all duration-300 text-sm">
      {/* Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-t-xl border-b border-green-200">
        <label className="cursor-pointer mr-3">
          <div className="relative">
            <img
              src={company.logo || "https://via.placeholder.com/150"}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-green-400 shadow"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 text-xs shadow">
              <FaBuilding />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </label>
        <div className="flex flex-col ml-2">
          <h2 className="text-base font-bold text-green-700 truncate">
            {company.organization}
          </h2>
          <p className="text-xs text-gray-600">{company.email}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-green-500 hover:text-red-500 text-xl font-bold transition"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* About */}
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-1">About</h3>
          <p className="text-xs text-gray-700">
            {company.about || "No info yet."}
          </p>
          <button
            className="mt-2 w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition font-semibold text-xs"
            onClick={() => {
              setModalType("about");
              setExistingData(company.about);
              setModalOpen(true);
            }}
          >
            {company.about ? "Edit" : "+ Add About"}
          </button>
        </div>

        {/* Website */}
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-1">Website</h3>
          <a
            href={
              company.website?.startsWith("http")
                ? company.website
                : `https://${company.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition"
          >
            <FaGlobe /> {company.website || "No website added"}
          </a>
          <button
            className="mt-2 w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition font-semibold text-xs"
            onClick={() => {
              setModalType("website");
              setExistingData(company.website);
              setModalOpen(true);
            }}
          >
            {company.website ? "Edit" : "+ Add Website"}
          </button>
        </div>

        {/* Projects */}
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-1">
            Projects
          </h3>
          {company.projects?.length > 0 ? (
            <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
              {company.projects.map((proj, i) => (
                <li key={i}>{proj}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-700">No projects added yet.</p>
          )}
          <button
            className="mt-2 w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-1 rounded-lg hover:from-green-500 hover:to-green-600 transition font-semibold text-xs"
            onClick={() => {
              setModalType("projects");
              setModalOpen(true);
            }}
          >
            + Add Project
          </button>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-1">
            Certifications
          </h3>
          {company.certifications?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {company.certifications.map((cert, i) => (
                <img
                  key={i}
                  src={cert}
                  className="w-10 h-10 object-cover rounded border border-green-200 shadow"
                  alt={`cert-${i}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-700">No certifications yet.</p>
          )}
          <label className="block mt-2">
            <span className="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-lg cursor-pointer hover:from-green-500 hover:to-green-600 transition font-semibold text-xs shadow">
              Upload Certificate
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </span>
          </label>
        </div>
      </div>

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

export default CompanyProfile;
