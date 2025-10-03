import React, { useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUserTie,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

const LoginModal = ({ isOpen, onClose, userType }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔄 Login attempt:", {
        email: loginData.email,
        userType,
        endpoint:
          userType === "Company"
            ? "/api/companies/login"
            : "/api/freelancers/login",
      });

      const endpoint =
        userType === "Company"
          ? "/api/companies/login"
          : "/api/freelancers/login";

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const userData = {
          id: data.user?.id || data.user?._id,
          email: data.user?.email,
          role: data.user?.role || userType.toLowerCase(),
          fullName:
            data.user?.fullName ||
            data.user?.companyName ||
            data.user?.organization ||
            data.user?.name,
          companyName: data.user?.companyName || data.user?.organization,
          name: data.user?.name || data.user?.fullName,
          ...data.user,
        };

        const loginSuccess = login(userData, data.token);

        if (loginSuccess) {
          onClose();

          setLoginData({ email: "", password: "" });

          if (userData.role === "company") {
            navigate("/company-dashboard");
          } else if (userData.role === "freelancer") {
            navigate("/jobs");
          } else {
            navigate("/");
          }
        } else {
          setError("Failed to process login. Please try again.");
        }
      } else {
        setError(
          data.error ||
            data.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoginData({ email: "", password: "" });
    setError("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 p-6">
          {}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                {userType === "Company" ? (
                  <FaBuilding className="text-white text-lg" />
                ) : (
                  <FaUserTie className="text-white text-lg" />
                )}
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Sign in as {userType}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 transition-colors p-1"
              disabled={loading}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="pl-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  disabled={loading}
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-1">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-emerald-400 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  className="pl-9 pr-9 w-full px-3 py-2.5 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="Enter your password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-emerald-400 hover:text-emerald-300 text-sm"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 text-sm" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FreelancerRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // ADD THIS LINE

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePictureFile: null,
    profilePicture: null,

    phone: "",
    gender: "",
    dob: "",
    address: "",
    hourlyRate: "",
    availability: "",

    skills: [],
    experience: "",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
    resumeFile: null,
    resume: null,
  });

  const handleChange = (data) => {
    setFormData((prevData) => {
      const newData = { ...prevData, ...data };

      return newData;
    });
  };

  const nextStep = () => {
    const currentPath = location.pathname;

    if (currentPath.includes("/step1")) {
      navigate("/register/freelancer/step2");
    } else if (currentPath.includes("/step2")) {
      navigate("/register/freelancer/step3");
    }
  };

  const prevStep = () => {
    const currentPath = location.pathname;

    if (currentPath.includes("/step3")) {
      navigate("/register/freelancer/step2");
    } else if (currentPath.includes("/step2")) {
      navigate("/register/freelancer/step1");
    } else {
      navigate("/register");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.fullName || !formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      if (!formData.skills || formData.skills.length === 0) {
        alert("Please add at least one skill");
        return;
      }

      if (!formData.experience) {
        alert("Please specify your experience");
        return;
      }

      if (!formData.bio || formData.bio.length < 50) {
        alert("Please add a bio (minimum 50 characters)");
        return;
      }

      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || "",
        address: formData.address || "",
        dob: formData.dob || "",
        gender: formData.gender || "",
        bio: formData.bio,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        experience: formData.experience,
        github: formData.github || "",
        linkedin: formData.linkedin || "",
        portfolio: formData.portfolio || "",
        hourlyRate: formData.hourlyRate || "",
        availability: formData.availability || "",
      };

      const response = await fetch(
        "http://localhost:8000/api/freelancers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const token = result.token;

        (async () => {
          try {
            if (formData.profilePictureFile) {
              const profileFormData = new FormData();
              profileFormData.append(
                "profilePicture",
                formData.profilePictureFile
              );

              await fetch(
                "http://localhost:8000/api/freelancers/upload/profile-picture",
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: profileFormData,
                }
              );
            }

            if (formData.resumeFile) {
              const resumeFormData = new FormData();
              resumeFormData.append("resume", formData.resumeFile);

              await fetch(
                "http://localhost:8000/api/freelancers/upload/resume",
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: resumeFormData,
                }
              );
            }
          } catch (uploadError) {
            console.warn(
              "⚠️ File upload failed, but registration succeeded:",
              uploadError
            );
          }
        })();

        if (result.token && result.user) {
          const userData = {
            id: result.user.id || result.user._id,
            email: result.user.email,
            role: "freelancer",
            fullName: result.user.fullName,
            ...result.user,
          };

          const loginSuccess = login(userData, result.token);

          if (loginSuccess) {
            alert("Registration successful! Welcome to FreelanceHub!");

            setTimeout(() => {
              navigate("/");
            }, 500);
          } else {
            alert("Registration successful! Please login to continue.");
            navigate("/register");
          }
        } else {
          alert("Registration successful! Please login to continue.");
          navigate("/register");
        }
      } else {
        alert(`Error: ${result.message || "Registration failed"}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection and try again.");
    }
  };

  return (
    <Routes>
      <Route
        path="step1"
        element={
          <Step1
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        }
      />
      <Route
        path="step2"
        element={
          <Step2
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        }
      />
      <Route
        path="step3"
        element={
          <Step3
            formData={formData}
            handleChange={handleChange}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        }
      />
      <Route
        path="*"
        element={
          <Step1
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        }
      />
    </Routes>
  );
};

const CompanyRegistration = () => {
  return (
    <Routes>
      <Route path="step1" element={<Step1 />} />
      <Route path="step2" element={<Step2 />} />
      <Route path="step3" element={<Step3 />} />
      <Route path="*" element={<Step1 />} />
    </Routes>
  );
};

const ParentRegistration = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loginUserType, setLoginUserType] = useState("");

  const handleFreelancerClick = () => {
    navigate("/register/freelancer/step1");
  };

  const handleCompanyClick = () => {
    navigate("/company-registration");
  };

  const handleFreelancerLogin = () => {
    setLoginUserType("Freelancer");
    setShowLogin(true);
  };

  const handleCompanyLogin = () => {
    setLoginUserType("Company");
    setShowLogin(true);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setLoginUserType("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 overflow-hidden">
      {}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full animate-spin-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-lime-400/5 to-emerald-400/5 rounded-full animate-spin-slow-reverse"></div>
      </div>

      <div className="relative z-10 flex items-center min-h-screen p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-500/20 p-8 hover:shadow-emerald-500/20 transition-all duration-300">
            {}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-200 mb-4">
                Join{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
                  FreelanceHub
                </span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Choose your account type to start your journey with us
              </p>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {}
              <div className="group bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-400/40 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
                <div className="text-center">
                  {}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl">
                    <FaUserTie className="text-3xl" />
                  </div>

                  {}
                  <h2 className="text-2xl font-bold text-gray-200 mb-4 group-hover:text-emerald-400 transition-colors">
                    I'm a Freelancer
                  </h2>

                  {}
                  <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                    Find projects that match your skills and build your career
                  </p>

                  {}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-emerald-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-emerald-400" />
                      Browse Jobs
                    </div>
                    <div className="text-emerald-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-emerald-400" />
                      Build Portfolio
                    </div>
                    <div className="text-emerald-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-emerald-400" />
                      Connect Clients
                    </div>
                    <div className="text-emerald-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-emerald-400" />
                      Secure Payments
                    </div>
                  </div>

                  {}
                  <div className="space-y-3">
                    <button
                      onClick={handleFreelancerClick}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 flex items-center justify-center border border-emerald-500/30"
                    >
                      Sign Up as Freelancer
                      <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={handleFreelancerLogin}
                      className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40"
                    >
                      Already a freelancer? Sign In
                    </button>
                  </div>
                </div>
              </div>

              {}
              <div className="group bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 hover:border-teal-400/40 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500">
                <div className="text-center">
                  {}
                  <div className="bg-gradient-to-r from-teal-500 to-lime-500 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl">
                    <FaBuilding className="text-3xl" />
                  </div>

                  {}
                  <h2 className="text-2xl font-bold text-gray-200 mb-4 group-hover:text-teal-400 transition-colors">
                    I'm a Company
                  </h2>

                  {}
                  <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                    Hire skilled freelancers and grow your business efficiently
                  </p>

                  {}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-teal-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-teal-400" />
                      Post Projects
                    </div>
                    <div className="text-teal-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-teal-400" />
                      Access Talent
                    </div>
                    <div className="text-teal-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-teal-400" />
                      Manage Team
                    </div>
                    <div className="text-teal-400 flex items-center text-sm">
                      <FaCheckCircle className="mr-3 text-teal-400" />
                      Track Progress
                    </div>
                  </div>

                  {}
                  <div className="space-y-3">
                    <button
                      onClick={handleCompanyClick}
                      className="w-full bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-400 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/40 transform hover:scale-105 flex items-center justify-center border border-teal-500/30"
                    >
                      Sign Up as Company
                      <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={handleCompanyLogin}
                      className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40"
                    >
                      Already a company? Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-2">
                  1000+
                </div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
                <div className="text-3xl lg:text-4xl font-bold text-teal-400 mb-2">
                  500+
                </div>
                <div className="text-gray-400 text-sm">Projects Done</div>
              </div>
              <div className="text-center bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/20">
                <div className="text-3xl lg:text-4xl font-bold text-lime-400 mb-2">
                  4.8★
                </div>
                <div className="text-gray-400 text-sm">Average Rating</div>
              </div>
            </div>

            {}
            <div className="text-center">
              <div className="bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400" />
                    Free to join
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400" />
                    Secure platform
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400" />
                    24/7 support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <LoginModal
        isOpen={showLogin}
        onClose={closeLogin}
        userType={loginUserType}
      />

      {}
      <style>
        {`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes spin-slow-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }

          .animate-spin-slow-reverse {
            animation: spin-slow-reverse 25s linear infinite;
          }

          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </div>
  );
};

export { CompanyRegistration, FreelancerRegistration };
export default ParentRegistration;
