const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  organization: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: "active" },
  // Extended fields
  about: { type: String },
  website: { type: String },
  logo: {
    data: Buffer,
    contentType: String,
  },
  projects: [{ type: String }],
  certifications: [{ type: String }],
});

module.exports = mongoose.model("Company", CompanySchema);
