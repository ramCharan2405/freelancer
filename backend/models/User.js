const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    fullName: {  
      type: String,
      required: true, 
    },
    email: {
      type: String,
      required: true,  
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true  
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    dob: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },
    status: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ['freelancer', 'company', 'admin'],
      required: true
    }
  },
  {
    timestamps: true  
  }
);


UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
