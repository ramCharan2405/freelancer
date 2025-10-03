import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaArrowLeft,
  FaCamera,
  FaUpload,
} from "react-icons/fa";

const Step1 = ({ formData, handleChange, nextStep }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(
    formData?.profilePicture || null
  );

  console.log("🔍 Step1 received props:", {
    formData,
    handleChange: typeof handleChange,
    nextStep: typeof nextStep,
  });

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      if (typeof nextStep === "function") {
        nextStep();
      } else {
      }
    } else {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (typeof handleChange === "function") {
      handleChange({ [name]: value });
    } else {
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      handleChange({ profilePictureFile: file });
    }
  };

  const removeProfilePicture = () => {
    setProfilePreview(null);
    handleChange({ profilePictureFile: null, profilePicture: null });

    const fileInput = document.getElementById("profilePicture");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center p-4">
      {}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 p-6">
          {}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Account Setup
            </h2>
            <p className="text-gray-400 text-sm">
              Step 1 of 3 - Basic Information
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full w-1/3"></div>
            </div>
          </div>

          {}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {}
            <div className="text-center mb-4">
              <label className="block text-sm font-medium text-emerald-400 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full border-2 border-emerald-500/30 overflow-hidden bg-slate-700/50 flex items-center justify-center mx-auto">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-emerald-400 text-2xl" />
                  )}
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 rounded-lg text-xs border border-emerald-500/30 transition-all duration-200 flex items-center gap-1"
                  >
                    <FaCamera className="text-xs" />
                    {profilePreview ? "Change" : "Upload"}
                  </label>
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-xs border border-red-500/30 transition-all duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type="text"
                  name="fullName"
                  value={formData?.fullName || ""}
                  onChange={handleInputChange}
                  className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="Enter your full name"
                  maxLength="50"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ""}
                  onChange={handleInputChange}
                  className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {}
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData?.password || ""}
                    onChange={handleInputChange}
                    className="pl-9 pr-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">
                  Confirm *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-emerald-400 text-sm" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData?.confirmPassword || ""}
                    onChange={handleInputChange}
                    className="pl-9 pr-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    placeholder="Confirm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {}
            <div className="flex justify-between pt-4 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => navigate("/register")}
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

export default Step1;
