import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ADD this import
import {
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaIndustry,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaSpinner,
} from "react-icons/fa";

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ADD this line
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: "",
    location: "",
    website: "",
    contact: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  // FIXED: Update the handleSubmit function with proper auth integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Company registration attempt:", {
        companyName: formData.companyName,
        email: formData.email,
      });

      const registrationData = {
        companyName: formData.companyName,
        organization: formData.companyName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword, // Add this
        industry: formData.industry,
        location: formData.location,
        website: formData.website,
        contact: formData.contact,
        description: formData.description,
      };

      const response = await fetch(
        "http://localhost:8000/api/companies/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const data = await response.json();
      console.log("📥 Company registration response:", data);

      if (response.ok && data.success) {
        console.log("✅ Company registration successful");
        setSuccess("Company registered successfully! Logging you in...");

        // FIXED: Better auto-login implementation
        if (data.token && data.user) {
          // Registration response includes token and user data
          const userData = {
            id: data.user.id,
            email: data.user.email,
            role: "company",
            fullName: data.user.companyName || data.user.organization,
            companyName: data.user.companyName,
            organization: data.user.organization,
            ...data.user,
          };

          const loginSuccess = login(userData, data.token);

          if (loginSuccess) {
            console.log("✅ Auto-login successful");

            // Clear form
            setFormData({
              companyName: "",
              email: "",
              password: "",
              confirmPassword: "",
              industry: "",
              location: "",
              website: "",
              contact: "",
              description: "",
            });

            // Redirect to dashboard
            setTimeout(() => {
              navigate("/company-dashboard");
            }, 1000);
          } else {
            // Fallback to manual login
            setSuccess("Registration successful! Please login to continue.");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          // Try auto-login with separate request
          try {
            const loginResponse = await fetch(
              "http://localhost:8000/api/companies/login",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: formData.email,
                  password: formData.password,
                }),
              }
            );

            const loginData = await loginResponse.json();

            if (loginResponse.ok && loginData.token && loginData.user) {
              const userData = {
                id: loginData.user.id,
                email: loginData.user.email,
                role: "company",
                fullName:
                  loginData.user.companyName || loginData.user.organization,
                companyName: loginData.user.companyName,
                organization: loginData.user.organization,
                ...loginData.user,
              };

              const loginSuccess = login(userData, loginData.token);

              if (loginSuccess) {
                console.log("✅ Auto-login successful");

                // Clear form
                setFormData({
                  companyName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  industry: "",
                  location: "",
                  website: "",
                  contact: "",
                  description: "",
                });

                // Redirect to dashboard
                setTimeout(() => {
                  navigate("/company-dashboard");
                }, 1000);
              } else {
                setSuccess(
                  "Registration successful! Please login to continue."
                );
                setTimeout(() => navigate("/login"), 2000);
              }
            } else {
              setSuccess("Registration successful! Please login to continue.");
              setTimeout(() => navigate("/login"), 2000);
            }
          } catch (loginError) {
            console.error("❌ Auto-login failed:", loginError);
            setSuccess("Registration successful! Please login to continue.");
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      } else {
        console.log("❌ Company registration failed:", data);
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Company registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-4 shadow-2xl">
              <FaBuilding className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
            Register Your Company
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            Join our platform and find the best freelancers
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6 bg-slate-800/60 backdrop-blur-2xl p-8 rounded-3xl border border-emerald-500/20 shadow-2xl"
          onSubmit={handleSubmit}
        >
          {/* Success Message */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Company Name *
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  required
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="pl-10 pr-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-emerald-400 hover:text-emerald-300"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="pl-10 pr-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-emerald-400 hover:text-emerald-300"
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Industry */}
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Industry
              </label>
              <div className="relative">
                <FaIndustry className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="e.g. Technology, Healthcare"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Location
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Website
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Contact Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-emerald-400" />
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  className="pl-10 w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contact}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Company Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              placeholder="Brief description of your company..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                "Register Company"
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
