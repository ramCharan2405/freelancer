import { useState } from "react";
import {
  FaCode,
  FaUpload,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaPlus,
  FaTrash,
  FaFilePdf,
  FaFileWord,
  FaFile,
  FaTimes,
  FaGithub,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Step3 = ({ formData, handleChange, prevStep, handleSubmit }) => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState(formData.skills || [""]);
  const [experience, setExperience] = useState(formData.experience || "");
  const [bio, setBio] = useState(formData.bio || "");
  const [github, setGithub] = useState(formData.github || "");
  const [linkedin, setLinkedin] = useState(formData.linkedin || "");
  const [portfolio, setPortfolio] = useState(formData.portfolio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [resumeFile, setResumeFile] = useState(formData.resumeFile || null);

  const addSkill = () => setSkills([...skills, ""]);

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
    updateFormData();
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
    updateFormData();
  };

  const updateFormData = () => {
    handleChange({
      skills: skills.filter((skill) => skill.trim() !== ""),
      experience,
      bio,
      github,
      linkedin,
      portfolio,
      resumeFile,
    });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please select a PDF, DOC, or DOCX file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setResumeFile(file);
      handleChange({ resumeFile: file });
      console.log("📄 Resume selected:", file.name);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    handleChange({ resumeFile: null });

    const fileInput = document.getElementById("resume");
    if (fileInput) fileInput.value = "";
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="text-red-400" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-400" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const validSkills = skills.filter((skill) => skill.trim() !== "");

    if (validSkills.length === 0) {
      newErrors.skills = "At least one skill is required";
    }
    if (!experience) {
      newErrors.experience = "Experience is required";
    }
    if (!bio || bio.trim().length < 50) {
      newErrors.bio = "Bio is required (minimum 50 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    updateFormData(); // Ensure formData is updated

    try {
      await handleSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 flex items-center justify-center p-4">
      {}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 p-6">
          {}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <FaCode className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Skills & Portfolio
            </h2>
            <p className="text-gray-400 text-sm">
              Step 3 of 3 - Professional Details & Resume
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full w-full"></div>
            </div>
          </div>

          {}
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {}
              <div className="space-y-4">
                {}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Skills *
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) =>
                            handleSkillChange(index, e.target.value)
                          }
                          placeholder="e.g., JavaScript, React"
                          disabled={isSubmitting}
                          className="flex-1 px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          disabled={isSubmitting || skills.length === 1}
                          className="text-red-400 hover:text-red-300 transition p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={isSubmitting}
                    className="mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm border border-emerald-500/30"
                  >
                    <FaPlus className="text-xs" />
                    Add Skill
                  </button>
                  {errors.skills && (
                    <p className="text-red-400 text-xs mt-1">{errors.skills}</p>
                  )}
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Years of experience"
                    disabled={isSubmitting}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                  />
                  {errors.experience && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.experience}
                    </p>
                  )}
                </div>

                {}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-1 flex items-center gap-2">
                      <FaGithub className="text-xs" />
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-1 flex items-center gap-2">
                      <FaLinkedin className="text-xs" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-1 flex items-center gap-2">
                      <FaGlobe className="text-xs" />
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-4">
                {}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-1">
                    Professional Bio *
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself, your expertise, and what makes you unique as a freelancer..."
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm resize-none"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{bio.length} characters</span>
                    <span>Minimum 50 characters</span>
                  </div>
                  {errors.bio && (
                    <p className="text-red-400 text-xs mt-1">{errors.bio}</p>
                  )}
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-emerald-400 mb-2">
                    Resume/CV (Optional)
                  </label>
                  <div className="border-2 border-dashed border-emerald-500/30 rounded-lg p-4 text-center">
                    {resumeFile ? (
                      <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(resumeFile.name)}
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">
                              {resumeFile.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeResume}
                          className="text-red-400 hover:text-red-300 transition p-1 rounded-lg hover:bg-red-500/10"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FaUpload className="text-emerald-400 text-2xl mx-auto mb-2" />
                        <p className="text-gray-400 text-sm mb-2">
                          Upload your resume (PDF, DOC, DOCX)
                        </p>
                        <label
                          htmlFor="resume"
                          className="cursor-pointer bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/30 transition-all duration-200"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Accepted formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="flex justify-between pt-4 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-600/60 transition-all duration-200 border border-emerald-500/20 text-sm disabled:opacity-50"
              >
                <FaArrowLeft className="text-xs" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Step3;
