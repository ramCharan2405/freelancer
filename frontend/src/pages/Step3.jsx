import { useState } from "react";
import { FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../context/RegistrationContext";

export default function Step3() {
  const navigate = useNavigate();
  const { registrationData } = useRegistration();
  const [skills, setSkills] = useState([""]);
  const [languages, setLanguages] = useState([""]);
  const [categories, setCategories] = useState([""]);
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [errors, setErrors] = useState({});

  const addSkill = () => setSkills([...skills, ""]);
  const addLanguage = () => setLanguages([...languages, ""]);
  const addCategory = () => setCategories([...categories, ""]);

  const handleChange = (setter, index, value) => {
    setter((prevList) => {
      const newList = [...prevList];
      newList[index] = value;
      return newList;
    });
  };

  const removeItem = (setter, index) => {
    setter((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    navigate("/freelancer-personal-details");
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setResume(reader.result);
      };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check skills - filter out empty strings and check if any remain
    const validSkills = skills.filter(skill => skill.trim() !== "");
    if (validSkills.length === 0) {
      newErrors.skills = "At least one skill is required.";
    }
    
    // Check experience
    if (!experience || experience.trim() === "") {
      newErrors.experience = "Experience is required.";
    }
    
    // Portfolio, GitHub, LinkedIn, and Resume are optional according to backend model
    // Remove these required validations
    
    // Check languages - filter out empty strings and check if any remain
    const validLanguages = languages.filter(language => language.trim() !== "");
    if (validLanguages.length === 0) {
      newErrors.languages = "At least one language is required.";
    }
    
    // Check categories - filter out empty strings and check if any remain
    const validCategories = categories.filter(category => category.trim() !== "");
    if (validCategories.length === 0) {
      newErrors.categories = "At least one category is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.error("Validation failed, errors: ", errors);
      return;
    }
    
    // Filter out empty strings from arrays
    const validSkills = skills.filter(skill => skill.trim() !== "");
    const validLanguages = languages.filter(language => language.trim() !== "");
    const validCategories = categories.filter(category => category.trim() !== "");
    
    console.log(registrationData);
    const freelancerData = {
      ...registrationData,
      skills: validSkills,
      experience: parseInt(experience),
      portfolio: portfolio.trim() || undefined,
      github: github.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      resume: resume || undefined,
      languages: validLanguages,
      projectCategories: validCategories,
    };
    // console.log("Submitting payload:", freelancerData);
    try {
      const response = await fetch(
        "http://localhost:8000/api/freelancers/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(freelancerData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Freelancer registered successfully!");
        navigate("/login");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 mb-16 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
        Freelancer Profile
      </h2>
      <hr className="border-green-200 mb-6" />

      {/* Skills */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700">
          Skills
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-50 border rounded-lg p-2"
            >
              <input
                type="text"
                value={skill}
                onChange={(e) => handleChange(setSkills, index, e.target.value)}
                placeholder="Enter a skill"
                className="flex-grow p-2 border-none bg-transparent focus:ring-0"
              />
              <button
                type="button"
                onClick={() => removeItem(setSkills, index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSkill}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Skill
        </button>
        {errors.skills && (
          <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
        )}
      </div>

      {/* Experience + Portfolio in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            Years of Experience
          </label>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Years of Experience"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
          )}
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            Portfolio Link
          </label>
          <input
            type="url"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="Portfolio Link"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {errors.portfolio && (
            <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>
          )}
        </div>
      </div>

      {/* Resume Upload */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700">
          Resume
        </label>
        <div className="flex items-center border p-3 rounded-lg cursor-pointer hover:bg-green-50 transition">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            id="resumeUpload"
            onChange={handleResumeUpload}
          />
          <label
            htmlFor="resumeUpload"
            className="flex items-center cursor-pointer w-full"
          >
            <FaUpload className="text-green-600 mr-3" />
            <span className="text-gray-600">
              {resumeName || "Upload Resume"}
            </span>
          </label>
        </div>
        {errors.resume && (
          <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
        )}
      </div>

      {/* GitHub + LinkedIn in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            GitHub Link
          </label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="GitHub Link"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            LinkedIn Link
          </label>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="LinkedIn Link"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Categories + Languages in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Project Categories */}
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            Project Categories
          </label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-50 border rounded-lg p-2"
              >
                <input
                  type="text"
                  value={category}
                  onChange={(e) =>
                    handleChange(setCategories, index, e.target.value)
                  }
                  placeholder="e.g. Web Development"
                  className="flex-grow p-2 border-none bg-transparent focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => removeItem(setCategories, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            + Add Category
          </button>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
          )}
        </div>

        {/* Languages */}
        <div>
          <label className="block text-lg font-semibold text-gray-700">
            Languages Spoken
          </label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {languages.map((language, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-50 border rounded-lg p-2"
              >
                <input
                  type="text"
                  value={language}
                  onChange={(e) =>
                    handleChange(setLanguages, index, e.target.value)
                  }
                  placeholder="Enter a language"
                  className="flex-grow p-2 border-none bg-transparent focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => removeItem(setLanguages, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLanguage}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            + Add Language
          </button>
          {errors.languages && (
            <p className="text-red-500 text-sm mt-1">{errors.languages}</p>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-6 space-y-2">
        <label className="flex items-center text-gray-700">
          <input
            type="checkbox"
            className="mr-2 rounded text-green-600 focus:ring-green-500"
          />{" "}
          I have read and agree to the Terms & Conditions.
        </label>
        <label className="flex items-center text-gray-700">
          <input
            type="checkbox"
            className="mr-2 rounded text-green-600 focus:ring-green-500"
          />{" "}
          I acknowledge that my personal data will be processed in accordance
          with the Privacy Policy.
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}
