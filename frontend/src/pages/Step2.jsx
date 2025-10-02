import React, { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaArrowLeft,
  FaArrowRight,
  FaDollarSign,
  FaGlobe,
} from "react-icons/fa";

const Step2 = ({ formData, handleChange, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange({ [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const age =
        new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 p-6">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Personal Details
            </h2>
            <p className="text-gray-400 text-sm">
              Step 2 of 3 - Contact & Demographics
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full w-2/3"></div>
            </div>
          </div>

          {/* Compact Form */}
          <form className="space-y-4">
            {/* Phone and Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    placeholder="1234567890"
                    maxLength="15"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Gender *
                </label>
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="text-red-400 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Date of Birth *
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={handleInputChange}
                  max={
                    new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                />
              </div>
              {errors.dob && (
                <p className="text-red-400 text-xs mt-1">{errors.dob}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Address/Location *
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="City, State, Country"
                  maxLength="100"
                />
              </div>
              {errors.address && (
                <p className="text-red-400 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Additional Professional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Hourly Rate (USD)
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate || ""}
                    onChange={handleInputChange}
                    className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    placeholder="25"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Availability
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <select
                    name="availability"
                    value={formData.availability || ""}
                    onChange={handleInputChange}
                    className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  >
                    <option value="">Select Availability</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-600/60 transition-all duration-200 border border-emerald-500/20 text-sm"
              >
                <FaArrowLeft className="text-xs" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
              >
                <span>Next</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Step2;
