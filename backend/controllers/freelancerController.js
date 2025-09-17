const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Freelancer = require("../models/Freelancer");


exports.registerFreelancer = async (req, res) => {
  try {
    const {
      fullName, email, password, gender, phone, dob, address,
      skills, experience, github, portfolio, linkedin, resume,
      languages, projectCategories
    } = req.body;

    // Check required fields only
    if (!fullName || !email || !password || !gender || !phone || !dob || !address) {
      return res.status(400).json({ message: "Basic information fields are required" });
    }

    // Check array fields - they should not be empty
    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: "At least one skill is required" });
    }

    if (!experience || experience < 0) {
      return res.status(400).json({ message: "Experience is required and must be a positive number" });
    }

    if (!languages || languages.length === 0) {
      return res.status(400).json({ message: "At least one language is required" });
    }

    if (!projectCategories || projectCategories.length === 0) {
      return res.status(400).json({ message: "At least one project category is required" });
    }

    const existingFreelancer = await Freelancer.findOne({ email });
    if (existingFreelancer) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFreelancer = new Freelancer({
      fullName, email, password: hashedPassword, gender, phone, dob, address,
      skills, experience, github, portfolio, linkedin, resume,
      languages, projectCategories
    });

    await newFreelancer.save();
    res.status(201).json({ message: "Freelancer registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.loginFreelancer = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  try {
    const { email, password } = req.body;
    const freelancer = await Freelancer.findOne({ email: email.toLowerCase() });

    if (!freelancer) return res.status(400).json({ error: "Freelancer not found" });

    const isMatch = await bcrypt.compare(password, freelancer.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: freelancer._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      role: "freelancer",
      model: "Freelancer",
      userId: freelancer._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






exports.getFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Not found" });
    res.status(200).json(freelancer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.json(Array.isArray(freelancers) ? freelancers : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateFreelancer = async (req, res) => {
  try {
    const allowedFields = ["about", "education", "skills", "certifications", "profileImage"];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedFreelancer) return res.status(404).json({ message: "Freelancer not found" });

    res.status(200).json(updatedFreelancer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

