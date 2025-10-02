const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String, // Cloudinary URL
    default: null
  },
  resume: {
    type: String, // Cloudinary URL
    default: null
  },
  resumeOriginalName: {
    type: String,
    default: null
  },
  portfolio: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes for better performance
freelancerSchema.index({ user: 1 });
freelancerSchema.index({ skills: 1 });
freelancerSchema.index({ location: 1 });
freelancerSchema.index({ isAvailable: 1 });
freelancerSchema.index({ rating: -1 });

// Virtual for average rating
freelancerSchema.virtual('averageRating').get(function () {
  return this.reviewCount > 0 ? (this.rating / this.reviewCount).toFixed(1) : 0;
});

module.exports = mongoose.model('Freelancer', freelancerSchema);
