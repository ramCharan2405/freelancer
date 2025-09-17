import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";
import { AuthContext } from "../context/AuthContext";
import ProfileWindow from "./FreelancerProfile";
import CompanyProfileWindow from "./CompanyProfile"; // 🆕 Import company profile

const Navbar = () => {
  const [enabled, setEnabled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, logout } = useContext(AuthContext);
  const userModel = localStorage.getItem("userModel"); // 🔥 Get user model

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userModel");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/loginPage");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-container")) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md rounded-b-2xl shadow-xl border-b border-green-200 mx-4 mt-4 transition-all duration-300 z-50 relative">
      <div className="flex items-center gap-3">
        <span className="material-icons text-green-500 text-4xl bg-green-100 rounded-full p-2 shadow">
          work
        </span>
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-green-700 hover:text-green-900 transition duration-200"
        >
          FreelanceHub
        </Link>
      </div>

      <ul className="hidden md:flex space-x-8 text-gray-800 font-medium">
        <li>
          <Link
            to="/"
            className="hover:text-green-600 transition duration-200 px-3 py-2 rounded-lg hover:bg-green-50"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/projects"
            className="hover:text-green-600 transition duration-200 px-3 py-2 rounded-lg hover:bg-green-50"
          >
            Projects
          </Link>
        </li>
      </ul>

      <div className="flex items-center space-x-5">
        {isLoggedIn ? (
          <div className="relative profile-container flex items-center space-x-3">
            <img
              src="https://tse1.mm.bing.net/th?id=OIP.GHGGLYe7gDfZUzF_tElxiQHaHa&pid=Api&P=0&h=180"
              alt="Profile"
              className="w-11 h-11 rounded-full cursor-pointer border-2 border-green-400 shadow-lg hover:scale-105 hover:border-green-600 transition duration-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            />
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 hover:scale-105 transition duration-200"
            >
              Logout
            </button>

            {/* Profile dropdown */}
            <div
              className={`absolute top-14 right-0 z-[100] transition-all duration-200 ${
                isProfileOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {userModel === "Freelancer" ? (
                <ProfileWindow
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                />
              ) : userModel === "Company" ? (
                <CompanyProfileWindow
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/loginPage")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-7 py-2 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 hover:scale-105 transition duration-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
