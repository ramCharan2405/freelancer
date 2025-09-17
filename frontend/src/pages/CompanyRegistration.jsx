import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.organization.trim())
      newErrors.organization = "Organization name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be 10 digits";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      console.error("Validation failed, errors: ", errors);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/api/companies/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Company registered successfully!");
        navigate("/loginPage");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-green-100 p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 rounded-full p-4 shadow-lg mb-2 flex items-center justify-center">
            <FaBuilding className="text-green-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-green-700 mb-1">
            Company Registration
          </h2>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Name of Organization"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Work Email Address"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
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
          <div>
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

          {/* Contact No */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Contact No
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Contact Number"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="reset"
              className="px-6 py-2 bg-green-50 text-green-700 rounded-xl shadow hover:bg-green-100 transition font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition font-bold"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
