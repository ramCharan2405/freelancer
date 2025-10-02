import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserTie,
  FaBuilding,
  FaSignOutAlt,
  FaUser,
  FaBriefcase,
  FaPlus,
  FaCog,
  FaEdit,
  FaChevronDown,
  FaUserCircle,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaClipboardList,
  FaProjectDiagram,
  FaHome,
  FaSearch,
  FaHeart,
  FaFileAlt,
  FaChartBar,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// Fixed Login Modal with proper centering
const LoginModal = ({ isOpen, onClose, userType, setUserType }) => {
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
      console.log("📥 Login response:", data);

      if (response.ok && data.success && data.token) {
        // Extract user data from response
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

        console.log("✅ Processed user data:", userData);

        // Login through AuthContext
        const loginSuccess = login(userData, data.token);

        if (loginSuccess) {
          console.log("✅ Login successful, redirecting...");

          // Close modal
          onClose();

          // Reset form
          setLoginData({ email: "", password: "" });

          // Redirect based on user role
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
        console.log("❌ Login failed:", data);
        setError(
          data.error ||
            data.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoginData({ email: "", password: "" });
    setError("");
    setShowPassword(false);
    setUserType("");
    onClose();
  };

  const handleBack = () => {
    if (userType) {
      // If user type is selected, go back to user type selection
      setUserType("");
      setError("");
      setLoginData({ email: "", password: "" });
    } else {
      // If on user type selection, close modal completely
      handleClose();
    }
  };

  const switchToFreelancer = () => {
    setUserType("Freelancer");
    setError("");
  };

  const switchToCompany = () => {
    setUserType("Company");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fixed backdrop with proper z-index and positioning */}
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        {/* Centered modal container */}
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Modal content */}
          <div
            className="relative w-full max-w-md"
            style={{
              maxWidth: "28rem",
              width: "100%",
            }}
          >
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 p-6 max-h-[85vh] overflow-y-auto">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {userType && (
                    <button
                      onClick={handleBack}
                      className="mr-3 text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10"
                      disabled={loading}
                    >
                      <FaArrowLeft size={16} />
                    </button>
                  )}
                  {/* <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-3 w-12 h-12 flex items-center justify-center">
                    {userType === "Company" ? (
                      <FaBuilding className="text-white text-lg" />
                    ) : userType === "Freelancer" ? (
                      <FaUserTie className="text-white text-lg" />
                    ) : (
                      <span className="text-white font-bold text-lg">F</span>
                    )}
                  </div> */}
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                  disabled={loading}
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {userType
                    ? `Sign in as ${userType}`
                    : "Sign in to FreelanceHub"}
                </h2>
                {userType && (
                  <p className="text-gray-400 text-sm mt-2">
                    Enter your credentials to continue
                  </p>
                )}
                {!userType && (
                  <p className="text-gray-400 text-sm mt-2">
                    Choose your account type to get started
                  </p>
                )}
              </div>

              {/* User Type Selection */}
              {!userType && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={switchToFreelancer}
                      className="flex flex-col items-center p-6 bg-slate-700/50 hover:bg-emerald-500/10 border border-emerald-500/30 rounded-xl transition-all duration-300 hover:border-emerald-400/50 hover:scale-105"
                    >
                      <FaUserTie className="text-emerald-400 text-3xl mb-3" />
                      <span className="text-gray-200 text-sm font-medium">
                        Freelancer
                      </span>
                      <span className="text-gray-500 text-xs mt-1">
                        Find projects
                      </span>
                    </button>
                    <button
                      onClick={switchToCompany}
                      className="flex flex-col items-center p-6 bg-slate-700/50 hover:bg-teal-500/10 border border-teal-500/30 rounded-xl transition-all duration-300 hover:border-teal-400/50 hover:scale-105"
                    >
                      <FaBuilding className="text-teal-400 text-3xl mb-3" />
                      <span className="text-gray-200 text-sm font-medium">
                        Company
                      </span>
                      <span className="text-gray-500 text-xs mt-1">
                        Hire talent
                      </span>
                    </button>
                  </div>

                  {/* Cancel Button for User Type Selection */}
                  {/* <div className="text-center">
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-700/50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div> */}
                </div>
              )}

              {/* Login Form - Only show when userType is selected */}
              {userType && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  {/* User Type Switch */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-slate-700/50 rounded-xl p-1 flex">
                      <button
                        type="button"
                        onClick={switchToFreelancer}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          userType === "Freelancer"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "text-gray-400 hover:text-emerald-400"
                        }`}
                        disabled={loading}
                      >
                        <FaUserTie className="text-xs" />
                        <span>Freelancer</span>
                      </button>
                      <button
                        type="button"
                        onClick={switchToCompany}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          userType === "Company"
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                            : "text-gray-400 hover:text-teal-400"
                        }`}
                        disabled={loading}
                      >
                        <FaBuilding className="text-xs" />
                        <span>Company</span>
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-2">
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

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-2">
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

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium ${
                        userType === "Company"
                          ? "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2 text-sm" />
                          Signing in...
                        </>
                      ) : (
                        `Sign in as ${userType}`
                      )}
                    </button>

                    {/* Cancel Button */}
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50 disabled:opacity-50"
                    >
                      <FaArrowLeft className="inline mr-2 text-xs" />
                      Back to Account Type
                    </button>
                  </div>
                </form>
              )}

              {/* Additional Links */}
              <div className="text-center mt-6 pt-4 border-t border-emerald-500/20">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      navigate("/register");
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginUserType, setLoginUserType] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use auth context
  const { user, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setLoginUserType("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
    // Force page reload to update all components
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isLoggedIn = isAuthenticated;
  const userRole = user?.role || "";
  const userName = user?.fullName || user?.companyName || user?.name || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest(".profile-dropdown")) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Define navigation items based on user role - SIMPLIFIED
  const getNavItems = () => {
    if (!isLoggedIn) {
      // Guest/Non-logged in users
      return [
        { name: "Home", path: "/", icon: FaHome },
        { name: "Browse Jobs", path: "/jobs", icon: FaBriefcase },
        { name: "Find Freelancers", path: "/freelancers", icon: FaUsers },
        { name: "How it Works", path: "/how-it-works", icon: FaProjectDiagram },
      ];
    } else if (userRole === "company") {
      // Company users - EXACTLY AS REQUESTED
      return [
        { name: "Home", path: "/", icon: FaHome },
        { name: "Post Job", path: "/post-job", icon: FaPlus },
        {
          name: "Dashboard",
          path: "/company-dashboard",
          icon: FaTachometerAlt,
        },
        { name: "Profile", path: "/edit-company-profile", icon: FaUser },
      ];
    } else if (userRole === "freelancer") {
      // Freelancer users - EXACTLY AS REQUESTED
      return [
        { name: "Home", path: "/", icon: FaHome },
        { name: "My Applications", path: "/my-applications", icon: FaFileAlt },
        { name: "Browse Jobs", path: "/jobs", icon: FaSearch },
        { name: "Profile", path: "/edit-freelancer-profile", icon: FaUser },
      ];
    }
    return [];
  };

  // Define profile dropdown items based on user role
  const getProfileDropdownItems = () => {
    if (userRole === "company") {
      return [
        {
          name: "Company Dashboard",
          path: "/company-dashboard",
          icon: FaTachometerAlt,
          action: () => {
            navigate("/company-dashboard");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Edit Profile",
          path: "/edit-company-profile",
          icon: FaEdit,
          action: () => {
            navigate("/edit-company-profile");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Post New Job",
          path: "/post-job",
          icon: FaPlus,
          action: () => {
            navigate("/post-job");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "My Jobs",
          path: "/company-dashboard",
          icon: FaBriefcase,
          action: () => {
            navigate("/company-dashboard");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Applications",
          path: "/company-applications",
          icon: FaClipboardList,
          action: () => {
            navigate("/company-applications");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Settings",
          path: "/settings",
          icon: FaCog,
          action: () => {
            navigate("/settings");
            setShowProfileDropdown(false);
          },
        },
      ];
    } else if (userRole === "freelancer") {
      return [
        {
          name: "My Profile",
          path: "/freelancer-profile",
          icon: FaUser,
          action: () => {
            navigate("/freelancer-profile");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Edit Profile",
          path: "/edit-freelancer-profile",
          icon: FaEdit,
          action: () => {
            navigate("/edit-freelancer-profile");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "My Applications",
          path: "/my-applications",
          icon: FaBriefcase,
          action: () => {
            navigate("/my-applications");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Saved Jobs",
          path: "/saved-jobs",
          icon: FaHeart,
          action: () => {
            navigate("/saved-jobs");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "My Projects",
          path: "/my-projects",
          icon: FaProjectDiagram,
          action: () => {
            navigate("/my-projects");
            setShowProfileDropdown(false);
          },
        },
        {
          name: "Settings",
          path: "/settings",
          icon: FaCog,
          action: () => {
            navigate("/settings");
            setShowProfileDropdown(false);
          },
        },
      ];
    }
    return [
      {
        name: "Settings",
        path: "/settings",
        icon: FaCog,
        action: () => {
          navigate("/settings");
          setShowProfileDropdown(false);
        },
      },
    ];
  };

  const navItems = getNavItems();
  const profileDropdownItems = getProfileDropdownItems();

  // Get user display info
  const getUserDisplayInfo = () => {
    if (userRole === "company") {
      return {
        name: user?.companyName || user?.organization || "Company",
        subtitle: user?.industry || "Company",
        email: user?.email,
        role: "Company Account",
      };
    } else if (userRole === "freelancer") {
      return {
        name: user?.fullName || user?.name || "Freelancer",
        subtitle: user?.skills?.[0] || "Freelancer",
        email: user?.email,
        role: "Freelancer Account",
      };
    }
    return {
      name: "User",
      subtitle: "User",
      email: user?.email || "",
      role: "User Account",
    };
  };

  const userDisplayInfo = getUserDisplayInfo();

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-2 shadow-xl border border-emerald-500/30 group-hover:scale-105 transition-all duration-300">
                {userRole === "company" ? (
                  <FaBuilding className="text-white text-xl" />
                ) : userRole === "freelancer" ? (
                  <FaUserTie className="text-white text-xl" />
                ) : (
                  <span className="text-white font-bold text-xl">F</span>
                )}
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
                FreelanceHub
                {userRole && (
                  <span className="ml-2 text-sm font-normal text-emerald-400 capitalize">
                    {userRole === "company"
                      ? "Business"
                      : userRole === "freelancer"
                      ? "Talent"
                      : ""}
                  </span>
                )}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                          : "text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      <IconComponent className="text-sm" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative profile-dropdown">
                  {/* User Profile Button */}
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl px-4 py-2 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 group"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                        userRole === "company"
                          ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                          : "bg-gradient-to-r from-emerald-400 to-teal-500"
                      }`}
                    >
                      {userRole === "company" ? (
                        <FaBuilding className="text-white text-sm" />
                      ) : (
                        <FaUserCircle className="text-white text-lg" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-200 text-sm font-semibold">
                        {userDisplayInfo.name}
                      </p>
                      <p
                        className={`text-xs ${
                          userRole === "company"
                            ? "text-blue-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {userDisplayInfo.subtitle}
                      </p>
                    </div>
                    <FaChevronDown
                      className={`text-gray-400 text-xs transition-transform duration-300 ${
                        showProfileDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-emerald-500/20">
                        <p className="text-gray-200 font-semibold">
                          {userDisplayInfo.name}
                        </p>
                        <p className="text-emerald-400 text-sm">
                          {userDisplayInfo.email}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {userDisplayInfo.role}
                        </p>
                      </div>

                      {/* Profile Actions */}
                      <div className="py-2">
                        {profileDropdownItems.map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={index}
                              onClick={item.action}
                              className="w-full text-left px-4 py-2 text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 flex items-center space-x-3"
                            >
                              <IconComponent className="text-emerald-400" />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-emerald-500/20 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center space-x-3"
                        >
                          <FaSignOutAlt className="text-red-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLoginClick}
                    className="text-gray-300 hover:text-emerald-400 px-6 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-6 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/40 border border-emerald-500/30"
                  >
                    Join Now
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-300 hover:text-emerald-400 p-2 rounded-xl transition-all duration-300 hover:bg-emerald-500/10"
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/98 backdrop-blur-2xl border-b border-emerald-500/20 shadow-2xl">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        closeMenu();
                      }}
                      className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                          : "text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      <IconComponent />
                      <span>{item.name}</span>
                    </button>
                  );
                })}

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-emerald-500/20">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <div className="px-4 py-3 bg-slate-800/60 rounded-xl">
                        <p className="text-gray-200 font-semibold">
                          {userDisplayInfo.name}
                        </p>
                        <p className="text-emerald-400 text-sm">
                          {userDisplayInfo.email}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {userDisplayInfo.role}
                        </p>
                      </div>

                      {/* Mobile Profile Actions */}
                      {profileDropdownItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              item.action();
                              closeMenu();
                            }}
                            className="flex items-center space-x-3 text-gray-300 hover:text-emerald-400 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-emerald-500/10"
                          >
                            <IconComponent className="text-emerald-400" />
                            <span>{item.name}</span>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-red-500/10"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleLoginClick();
                          closeMenu();
                        }}
                        className="text-gray-300 hover:text-emerald-400 block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-emerald-500/10 w-full text-left border border-emerald-500/20"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          navigate("/register");
                          closeMenu();
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 w-full text-center border border-emerald-500/30"
                      >
                        Join Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLogin}
          onClose={closeLogin}
          userType={loginUserType}
          setUserType={setLoginUserType}
        />

        {/* Click outside to close dropdown */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </nav>

      {/* Spacer div to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
