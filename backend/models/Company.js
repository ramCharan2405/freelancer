const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, "Industry cannot exceed 50 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Website must be a valid URL",
      },
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [20, "Contact cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    employees: {
      type: Number,
      default: 1,
      min: [1, "Employees must be at least 1"],
    },
    founded: {
      type: Number,
      min: [1800, "Founded year must be after 1800"],
      max: [new Date().getFullYear(), "Founded year cannot be in the future"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
companySchema.index({
  companyName: "text",
  industry: "text",
  location: "text",
});

// Virtual for display name
companySchema.virtual("displayName").get(function () {
  return this.organization || this.companyName;
});

// Ensure virtual fields are serialized
companySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Company", companySchema);
