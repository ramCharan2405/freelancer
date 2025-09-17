import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../context/RegistrationContext";
import { FaUserTie } from "react-icons/fa";

const Step1 = () => {
  const navigate = useNavigate();
  const { registrationData, setRegistrationData } = useRegistration();
  // Form State
  const [formData, setFormData] = useState({
    fullName: registrationData.fullName || "",
    email: registrationData.email || "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on input
  };

  // Validate Form
  const validate = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Fullname is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Next Button
  const handleNext = (e) => {
    e.preventDefault();
    setRegistrationData({ ...registrationData, ...formData });
    if (validate()) {
      navigate("/freelancer-personal-details", { state: { formData } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl p-10 shadow-2xl rounded-2xl border border-green-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 rounded-full p-4 shadow mb-2 flex items-center justify-center">
            <FaUserTie className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-green-700 mb-1">
            Freelancer Registration
          </h1>
        </div>
        <hr className="border-green-200 my-4" />

        <form>
          {/* Fullname */}
          <div className="mb-5">
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Fullname
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
              value={formData.email.toLowerCase()}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Your Password"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="absolute right-4 top-10 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition font-bold"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step1;
