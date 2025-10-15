import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBriefcase,
  FaUsers,
  FaStar,
  FaPlus,
  FaUserTie,
  FaBuilding,
  FaChartLine,
  FaHandshake,
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Login from "./login";

const Hero = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginUserType, setLoginUserType] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const isLoggedIn = isAuthenticated;
  const userRole = user?.role || "";
  const userName = user?.fullName || user?.companyName || user?.name || "";

  const handleLoginClick = (userType) => {
    setLoginUserType(userType);
    setShowLogin(true);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setLoginUserType("");
  };

  const getHeroContent = () => {
    if (!isLoggedIn) {
      return {
        title: "Find The Perfect Freelance Services For Your Business",
        subtitle:
          "Connect with talented freelancers or find your next project. Our platform makes it easy to work together and achieve great results.",
        primaryCTA: {
          text: "Get Started",
          action: () => navigate("/register"),
        },
        secondaryCTA: { text: "Browse Jobs", action: () => navigate("/jobs") },
        stats: [
          { number: "1000+", label: "Active Jobs", color: "text-emerald-400" },
          { number: "500+", label: "Freelancers", color: "text-teal-400" },
          { number: "4.8★", label: "Average Rating", color: "text-lime-400" },
        ],
      };
    } else if (userRole === "freelancer") {
      return {
        title: `Welcome back, ${userName.split(" ")[0] || "Freelancer"}!`,
        subtitle:
          "Ready to find your next exciting project? Browse available jobs or check your applications.",
        primaryCTA: {
          text: "Browse New Jobs",
          action: () => navigate("/jobs"),
        },
        secondaryCTA: {
          text: "My Applications",
          action: () => navigate("/my-applications"),
        },
        stats: [
          {
            number: "1000+",
            label: "Available Jobs",
            color: "text-emerald-400",
          },
          { number: "95%", label: "Success Rate", color: "text-teal-400" },
          { number: "24/7", label: "Support", color: "text-lime-400" },
        ],
      };
    } else if (userRole === "company") {
      return {
        title: `Welcome back, ${userName || "Company"}!`,
        subtitle:
          "Ready to find talented freelancers for your projects? Post a new job or manage your existing listings.",
        primaryCTA: {
          text: "Post New Job",
          action: () => navigate("/post-job"),
        },
        secondaryCTA: {
          text: "Company Dashboard",
          action: () => navigate("/company-dashboard"),
        },
        stats: [
          {
            number: "500+",
            label: "Skilled Freelancers",
            color: "text-emerald-400",
          },
          {
            number: "48hrs",
            label: "Avg. Response Time",
            color: "text-teal-400",
          },
          { number: "98%", label: "Project Success", color: "text-lime-400" },
        ],
      };
    } else {
      // ✅ DEFAULT FALLBACK for unexpected roles (like 'user')
      return {
        title: `Welcome back, ${userName || "User"}!`,
        subtitle:
          "Complete your profile to get started. Choose your role as a freelancer or company to unlock all features.",
        primaryCTA: {
          text: "Complete Profile",
          action: () => navigate("/register"),
        },
        secondaryCTA: { text: "Browse Jobs", action: () => navigate("/jobs") },
        stats: [
          { number: "1000+", label: "Active Jobs", color: "text-emerald-400" },
          { number: "500+", label: "Freelancers", color: "text-teal-400" },
          { number: "4.8★", label: "Average Rating", color: "text-lime-400" },
        ],
      };
    }
  };

  const heroContent = getHeroContent();

  const getQuickActions = () => {
    if (!isLoggedIn) {
      return [
        {
          title: "For Freelancers",
          description: "Find projects that match your skills",
          icon: <FaUserTie className="text-emerald-400 text-2xl" />,
          action: () => handleLoginClick("Freelancer"),
          actionText: "Sign in as Freelancer",
        },
        {
          title: "For Companies",
          description: "Hire talented professionals",
          icon: <FaBuilding className="text-teal-400 text-2xl" />,
          action: () => handleLoginClick("Company"),
          actionText: "Sign in as Company",
        },
      ];
    } else if (userRole === "freelancer") {
      return [
        {
          title: "Find Projects",
          description: "Browse available opportunities",
          icon: <FaSearch className="text-emerald-400 text-2xl" />,
          action: () => navigate("/jobs"),
          actionText: "Browse Jobs",
        },
        {
          title: "My Dashboard", // ✅ CHANGE THIS
          description: "Track applications & assignments", // ✅ CHANGE THIS
          icon: <FaBriefcase className="text-teal-400 text-2xl" />,
          action: () => navigate("/freelancer-dashboard"), // ✅ CHANGE THIS
          actionText: "View Dashboard", // ✅ CHANGE THIS
        },
      ];
    } else if (userRole === "company") {
      return [
        {
          title: "Post Jobs",
          description: "Create new job listings",
          icon: <FaPlus className="text-emerald-400 text-2xl" />,
          action: () => navigate("/post-job"),
          actionText: "Create Job",
        },
        {
          title: "Manage Projects",
          description: "View applications & hire talent",
          icon: <FaChartLine className="text-teal-400 text-2xl" />,
          action: () => navigate("/company-dashboard"),
          actionText: "Dashboard",
        },
      ];
    } else {
      // ✅ DEFAULT FALLBACK for unexpected roles
      return [
        {
          title: "Browse Jobs",
          description: "Explore available opportunities",
          icon: <FaSearch className="text-emerald-400 text-2xl" />,
          action: () => navigate("/jobs"),
          actionText: "View Jobs",
        },
        {
          title: "Complete Profile",
          description: "Set up your account",
          icon: <FaUserTie className="text-teal-400 text-2xl" />,
          action: () => navigate("/register"),
          actionText: "Get Started",
        },
      ];
    }
  };

  const quickActions = getQuickActions();

  // ✅ Safety check before rendering
  if (!heroContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full animate-spin-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-lime-400/5 to-emerald-400/5 rounded-full animate-spin-slow-reverse"></div>
        </div>

        <div className="relative z-10 flex items-center min-h-screen">
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {isLoggedIn && (
                  <div className="bg-slate-800/60 backdrop-blur-2xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
                        {userRole === "company" ? (
                          <FaBuilding className="text-white text-xl" />
                        ) : (
                          <FaUserTie className="text-white text-xl" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">
                          {userRole === "company"
                            ? "Company Account"
                            : userRole === "freelancer"
                            ? "Freelancer Account"
                            : "User Account"}
                        </p>
                        <p className="font-semibold text-gray-200 text-lg">
                          {userName ||
                            (userRole === "company" ? "Company User" : "User")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-200 leading-tight">
                    {isLoggedIn ? (
                      heroContent.title
                    ) : (
                      <>
                        Find The Perfect
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent block">
                          Freelance Services
                        </span>
                        For Your Business
                      </>
                    )}
                  </h1>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    {heroContent.subtitle}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={heroContent.primaryCTA.action}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 text-center flex items-center justify-center gap-3 border border-emerald-500/30"
                  >
                    {heroContent.primaryCTA.text}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={heroContent.secondaryCTA.action}
                    className="bg-slate-800/60 backdrop-blur-2xl border border-emerald-500/20 text-gray-300 hover:bg-slate-700/60 hover:border-emerald-400/40 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 transform hover:scale-105 text-center"
                  >
                    {heroContent.secondaryCTA.text}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8">
                  {heroContent.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="text-center bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <div
                        className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}
                      >
                        {stat.number}
                      </div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map((action, index) => (
                      <div
                        key={index}
                        className="group bg-slate-800/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/20 border border-emerald-500/20 hover:border-emerald-400/40 cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-500"
                        onClick={action.action}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl">
                            {action.icon}
                          </div>
                          <span className="font-semibold text-gray-200 text-lg">
                            {action.title}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                          {action.description}
                        </p>
                        <button className="text-emerald-400 font-semibold text-sm flex items-center gap-3 group-hover:gap-4 transition-all">
                          {action.actionText}
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isLoggedIn && (
                    <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl">
                          <FaCheckCircle className="text-emerald-400 text-2xl" />
                        </div>
                        <span className="font-semibold text-gray-200 text-lg">
                          {userRole === "company"
                            ? "Recent Success"
                            : "Success Story"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {userRole === "company"
                          ? "Over 98% of companies find qualified freelancers within 48 hours."
                          : "Join thousands of freelancers earning an average of $50/hour on our platform."}
                      </p>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-2xl p-8 rounded-3xl text-gray-200 border border-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                      <h3 className="font-bold text-xl mb-4">
                        Why Choose FreelanceHub?
                      </h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-3">
                          <FaCheckCircle className="text-emerald-400" />
                          <span>Verified freelancers and companies</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <FaCheckCircle className="text-emerald-400" />
                          <span>Secure payment processing</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <FaCheckCircle className="text-emerald-400" />
                          <span>24/7 customer support</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                  <FaStar className="text-white text-2xl" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full shadow-2xl flex items-center justify-center animate-pulse">
                  {userRole === "company" ? (
                    <FaUsers className="text-white text-2xl" />
                  ) : (
                    <FaHandshake className="text-white text-2xl" />
                  )}
                </div>
              </div>
            </div>

            {isLoggedIn &&
              (userRole === "freelancer" || userRole === "company") && (
                <div className="mt-20 bg-slate-800/60 backdrop-blur-2xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl">
                  <h3 className="font-bold text-2xl text-gray-200 mb-6 text-center">
                    Quick Navigation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {userRole === "freelancer" ? (
                      <>
                        <Link
                          to="/freelancer-dashboard"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaChartLine className="text-2xl text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Dashboard
                          </span>
                        </Link>
                        <Link
                          to="/jobs"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-teal-500/20 to-lime-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaBriefcase className="text-2xl text-teal-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Browse Jobs
                          </span>
                        </Link>
                        <Link
                          to="/my-applications"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaClipboardList className="text-2xl text-lime-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Applications
                          </span>
                        </Link>
                        <Link
                          to="/edit-freelancer-profile"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaUserTie className="text-2xl text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Profile
                          </span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/post-job"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaPlus className="text-2xl text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Post Job
                          </span>
                        </Link>
                        <Link
                          to="/company-dashboard"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-teal-500/20 to-lime-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaChartLine className="text-2xl text-teal-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Dashboard
                          </span>
                        </Link>
                        <Link
                          to="/jobs"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaUsers className="text-2xl text-lime-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Browse Talent
                          </span>
                        </Link>
                        <Link
                          to="/edit-company-profile"
                          className="group flex flex-col items-center p-6 rounded-2xl hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                            <FaBuilding className="text-2xl text-emerald-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-200">
                            Profile
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <Login isOpen={showLogin} onClose={closeLogin} userType={loginUserType} />

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
        `}
      </style>
    </>
  );
};

export default Hero;
