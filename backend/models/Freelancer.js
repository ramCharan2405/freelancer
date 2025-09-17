const mongoose = require("mongoose");

const FreelancerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  skills: { type: [String], required: true },
  experience: { type: Number, required: true },
  github: { type: String },
  portfolio: { type: String },
  linkedin: { type: String },
  resume: { type: String },
  languages: { type: [String], required: true },
  projectCategories: { type: [String], required: true },
  status: { type: String, default: "active" },

  // 🔽 Optional profile fields (not required)
  about: { type: String, default: "" },
  education: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  profileImage: { type: String }
});

module.exports = mongoose.model("Freelancer", FreelancerSchema);
