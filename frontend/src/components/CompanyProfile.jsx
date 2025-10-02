import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalPopup from "./modalPopup";
import { FaGlobe, FaBuilding, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CompanyProfile = ({ isOpen, onClose }) => {
  const [company, setCompany] = useState({
    organization: "",
    email: "",
    contact: "",
    address: "",
    about: "",
    website: "",
    logo: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [existingData, setExistingData] = useState("");
  const companyId = localStorage.getItem("userId");
  const navigate = useNavigate();

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
    else if (modalType === "website") updated.website = data;

    setCompany(updated);
    updateCompany(updated);
    setModalOpen(false);
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
    <div className="w-72 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-green-200 transition-all duration-300 text-sm">
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
        <div className="flex flex-col ml-2 flex-1">
          <h2 className="text-sm font-bold text-green-700 truncate">
            {company.organization || "Company Name"}
          </h2>
          <p className="text-xs text-gray-600 truncate">{company.email}</p>
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
          <FaPhone className="text-green-500" />
          <span>{company.contact || "No contact"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FaMapMarkerAlt className="text-green-500" />
          <span className="truncate">{company.address || "No address"}</span>
        </div>

        {/* Website */}
        {company.website && (
          <div className="flex items-center gap-2">
            <FaGlobe className="text-green-500" />
            <a
              href={
                company.website?.startsWith("http")
                  ? company.website
                  : `https://${company.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 transition truncate"
            >
              {company.website}
            </a>
          </div>
        )}

        {/* About */}
        <div>
          <h3 className="text-xs font-semibold text-green-700 mb-1">About</h3>
          <p className="text-xs text-gray-700 line-clamp-2">
            {company.about || "No company description available."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white py-1.5 px-2 rounded-lg hover:from-green-500 hover:to-green-600 transition font-semibold text-xs"
            onClick={() => {
              setModalType("about");
              setExistingData(company.about);
              setModalOpen(true);
            }}
          >
            Edit About
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-1.5 px-2 rounded-lg hover:from-blue-500 hover:to-blue-600 transition font-semibold text-xs"
            onClick={() => {
              setModalType("website");
              setExistingData(company.website);
              setModalOpen(true);
            }}
          >
            {company.website ? "Edit Website" : "Add Website"}
          </button>
        </div>

        {/* Edit Profile Button */}
        <div className="pt-2 border-t border-green-100 mt-3">
          <button
            onClick={() => navigate("/edit-company-profile")}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold text-sm flex items-center justify-center space-x-2"
          >
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <ModalPopup
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        title={`${modalType === "about" ? "Edit About" : "Add Website"}`}
        existingData={existingData}
        placeholder={`Enter ${modalType}`}
      />
    </div>
  );
};

export default CompanyProfile;
