import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clientIcon from "../assets/company.png";
import freelancerIcon from "../assets/freelancer.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    localStorage.setItem("role", role);
  };

  const handleCreateAccount = () => {
    if (!selectedRole) {
      toast.success("Please select a role first.");
      return;
    }
    if (selectedRole === "client") {
      navigate("/company-registration");
    } else if (selectedRole === "freelancer") {
      navigate("/freelancer-registration");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 justify-center items-center px-4">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-100 p-10 mt-10">
        <h2 className="text-3xl font-extrabold text-green-700 text-center mb-8">
          Join as a client or freelancer
        </h2>

        {/* Role Selection */}
        <div className="flex justify-center gap-10 mb-10">
          <div
            className={`flex flex-col items-center border-2 p-7 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
              selectedRole === "client"
                ? "border-green-500 bg-green-50 scale-105"
                : "border-gray-200 bg-white hover:bg-green-50"
            }`}
            onClick={() => handleRoleSelection("client")}
          >
            <img
              src={clientIcon}
              alt="Client"
              className="mb-4 h-20 w-20 object-contain"
            />
            <p className="text-center font-semibold text-green-700">
              I’m a client, hiring for project
            </p>
          </div>

          <div
            className={`flex flex-col items-center border-2 p-7 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
              selectedRole === "freelancer"
                ? "border-green-500 bg-green-50 scale-105"
                : "border-gray-200 bg-white hover:bg-green-50"
            }`}
            onClick={() => handleRoleSelection("freelancer")}
          >
            <img
              src={freelancerIcon}
              alt="Freelancer"
              className="mb-4 h-20 w-20 object-contain"
            />
            <p className="text-center font-semibold text-green-700">
              I’m a freelancer, looking for work
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center">
          <button
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 hover:scale-105 transition duration-300 w-full"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
          <p className="mt-6 text-lg text-center">
            Already have an account?{" "}
            <span
              className="text-green-600 font-semibold cursor-pointer hover:underline"
              onClick={() => {
                if (!selectedRole) {
                  toast.success("Please select a role first.");
                  return;
                } else {
                  navigate(`/login/${selectedRole}`);
                }
              }}
            >
              Log In
            </span>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
