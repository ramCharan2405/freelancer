import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ADD THIS
import {
  FaBuilding,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaEdit,
  FaUpload,
  FaIndustry,
} from "react-icons/fa";

const EditCompanyProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // ADD THIS
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errors, setErrors] = useState({});
  const [company, setCompany] = useState({
    organization: "",
    email: "",
    contact: "",
    address: "",
    about: "",
    website: "",
    logo: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("🔍 EditCompanyProfile - Auth check:", {
      isAuthenticated,
      user,
      userRole: user?.role,
      localStorageRole: localStorage.getItem("userRole"),
    });

    if (!isAuthenticated || !token) {
      alert("Please login to edit your profile");
      navigate("/");
      return;
    }

    if (user?.role !== "company") {
      alert("Only companies can access this page");
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, token, navigate]);

  useEffect(() => {
    if (user?.role === "company" && token) {
      fetchCompanyProfile();
    }
  }, [user, token]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/companies/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success === false) {
        alert(response.data.message || "Failed to load profile data");
        return;
      }

      setCompany({
        organization: response.data.organization || "",
        email: response.data.email || "",
        contact: response.data.contact || "",
        address: response.data.address || "",
        about: response.data.about || "",
        website: response.data.website || "",
        logo: response.data.logo || "",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load profile data";
      alert(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    setUploadingLogo(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/companies/upload/logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCompany((prev) => ({ ...prev, logo: response.data.logo }));
      alert("Company logo updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upload company logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!company.organization?.trim()) {
      newErrors.organization = "Organization name is required";
    } else if (company.organization.trim().length < 2) {
      newErrors.organization =
        "Organization name must be at least 2 characters";
    }

    if (!company.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      company.contact &&
      !/^\d{10}$/.test(company.contact.replace(/\D/g, ""))
    ) {
      newErrors.contact = "Contact must be 10 digits";
    }

    if (company.website && !/^https?:\/\/.+/.test(company.website)) {
      newErrors.website = "Please enter a valid website URL (with http/https)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/companies/update`,
        company,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Company profile updated successfully!");
        navigate(-1); // Go back to previous page
      } else {
        alert(response.data.message || "Update failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update profile. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== "company") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 p-6">
      {}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {}
        <div className="bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-500/20 p-8 hover:shadow-emerald-500/20 transition-all duration-300">
          {}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-emerald-400 transition-colors p-3 rounded-2xl hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40"
              title="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>

            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 shadow-lg mr-4 border border-emerald-500/30">
                <FaBuilding className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-200">
                  Edit Company Profile
                </h1>
                <p className="text-gray-400">Update your company information</p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-red-400 transition-colors p-3 rounded-2xl hover:bg-red-500/10 border border-emerald-500/20 hover:border-red-400/40"
              title="Cancel"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <FaBuilding className="text-emerald-400" />
                Company Logo
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={
                      company.logo ||
                      "https://via.placeholder.com/120x120/1f2937/10b981?text=Logo"
                    }
                    alt="Company Logo"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-500/30 shadow-2xl bg-slate-700"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/120x120/1f2937/10b981?text=Logo";
                    }}
                  />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <FaSpinner className="animate-spin text-emerald-400 text-2xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 border border-emerald-500/30 flex items-center gap-2 w-fit">
                      <FaUpload />
                      {uploadingLogo ? "Uploading..." : "Change Logo"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG up to 5MB. Recommended size: 400x400px square logo
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <FaEdit className="text-emerald-400" />
                Company Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaBuilding />
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={company.organization || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="Your company name"
                    maxLength="100"
                  />
                  {errors.organization && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.organization}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaEnvelope />
                    Company Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={company.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="company@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaPhone />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={company.contact || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="1234567890"
                    maxLength="15"
                  />
                  {errors.contact && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FaGlobe />
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={company.website || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                    placeholder="https://www.company.com"
                  />
                  {errors.website && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <FaTimes className="text-xs" />
                      {errors.website}
                    </p>
                  )}
                </div>
              </div>

              {}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Company Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={company.address || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300"
                  placeholder="Street Address, City, State, Country"
                  maxLength="200"
                />
              </div>
            </div>

            {}
            <div className="bg-slate-700/50 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <FaIndustry className="text-emerald-400" />
                Company Description
              </h3>

              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-3">
                  About Company
                </label>
                <textarea
                  name="about"
                  value={company.about || ""}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/40 text-gray-200 placeholder-gray-400 shadow-lg transition-all duration-300 resize-none"
                  placeholder="Describe your company, services, mission, values, and what makes you unique. This helps freelancers understand your business better..."
                  maxLength="2000"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400 bg-emerald-500/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/20">
                    💡 A detailed description helps attract the right talent for
                    your projects
                  </p>
                  <p className="text-xs text-gray-500">
                    {(company.about || "").length}/2000 characters
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="flex justify-between pt-8 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-slate-700/60 hover:bg-slate-600/60 text-gray-300 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 hover:border-emerald-400/40 backdrop-blur-2xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingLogo}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 disabled:from-emerald-300 disabled:to-teal-300 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-500/30 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {}
          <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-2xl p-6 rounded-2xl border border-emerald-500/20">
            <h3 className="font-bold text-lg text-emerald-400 mb-3">
              💡 Company Profile Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>
                  Use a professional company logo and clear description
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Include your company's mission and values</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Add contact information for better communication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Keep your company information up to date</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyProfile;
