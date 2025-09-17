import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRegistration } from "../context/RegistrationContext";

const Step2 = () => {
  const navigate = useNavigate();
  const { registrationData, setRegistrationData } = useRegistration();
  const [formData, setFormData] = useState({
    fullName: registrationData.fullName || "",
    email: registrationData.email || "",
    phone: registrationData.phone || "",
    gender: registrationData.gender || "",
    dob: registrationData.dob || null,
    address: registrationData.address || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Mobile number must be 10 digits";
    }
    if (!formData.gender) newErrors.gender = "Please select gender";
    if (!formData.dob) newErrors.dob = "Please select your birth date";
    if (!formData.address) newErrors.address = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dob: date });
  };

  const handleNext = () => {
    if (validate()) {
      setRegistrationData({ ...registrationData, ...formData });
      navigate("/freelancer-skills", { state: { formData } }); // Pass updated data to Step3
    }
  };
  const handleBack = () => {
    navigate("/freelancer-registration");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-green-100 p-10 w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 rounded-full p-4 shadow mb-2 flex items-center justify-center">
            <span className="text-green-600 font-bold text-2xl tracking-tight">
              👤
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-green-700 mb-1">
            Personal Details
          </h2>
        </div>
        <hr className="border-green-200 mb-6" />

        <div className="space-y-5">
          <div>
            <label className="font-semibold text-green-700 block mb-2">
              Fullname
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-green-700 block mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-green-700 block mb-2">
              Mobile No
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Mobile No"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-green-700 block mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-green-700 block mb-2">
              DOB
            </label>
            <DatePicker
              selected={formData.dob}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              placeholderText="Select your birth date"
            />
            {errors.dob && (
              <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-green-700 block mb-2">
              Location
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your Location"
              className="w-full px-4 py-3 border border-green-200 rounded-xl shadow focus:outline-none focus:border-green-500 transition bg-white text-green-700"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-green-50 text-green-700 px-6 py-2 rounded-xl shadow hover:bg-green-100 transition font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
