const Freelancer = require('../models/Freelancer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const https = require('https');
const http = require('http');
const url = require('url');
const mongoose = require('mongoose'); // Add at top


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter check:', {
      fieldname: file.fieldname,
      mimetype: file.mimetype,
      originalname: file.originalname
    });

    if (file.fieldname === 'profilePicture') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile picture'), false);
      }
    } else if (file.fieldname === 'resume') {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume'), false);
      }
    } else {
      cb(new Error('Invalid file field'), false);
    }
  }
});


const registerFreelancer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {


    const {
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      address,
      dob,
      gender,
      bio,
      skills,
      experience,
      hourlyRate,
      portfolio,
    } = req.body;


    if (!fullName || !email || !password) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password !== confirmPassword) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }


    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      dob: dob || null,
      gender: gender ? gender.toLowerCase() : "", // NORMALIZE HERE
      role: "freelancer",
    });

    const savedUser = await newUser.save({ session });



    const newFreelancer = new Freelancer({
      user: savedUser._id,
      fullName,
      bio: bio || "",
      skills: skills || [],
      experience: experience || "",
      hourlyRate: hourlyRate || null,
      portfolio: portfolio || null,
      profilePicture: "",
      rating: 0,
      completedProjects: 0,
    });

    const savedFreelancer = await newFreelancer.save({ session });



    await session.commitTransaction();
    session.endSession();


    const token = jwt.sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );



    res.status(201).json({
      success: true,
      message: "Freelancer registered successfully",
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        fullName: savedUser.fullName,
      },
      freelancer: {
        id: savedFreelancer._id,
        fullName: savedFreelancer.fullName,
        bio: savedFreelancer.bio,
        skills: savedFreelancer.skills,
        experience: savedFreelancer.experience,
        hourlyRate: savedFreelancer.hourlyRate,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();



    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};


const loginFreelancer = async (req, res) => {
  try {


    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }


    const user = await User.findOne({ email, role: 'freelancer' });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }


    const freelancer = await Freelancer.findOne({ user: user._id });


    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );



    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        gender: user.gender
      },
      freelancer: freelancer ? {
        id: freelancer._id,
        bio: freelancer.bio,
        skills: freelancer.skills,
        experience: freelancer.experience,
        github: freelancer.github,
        linkedin: freelancer.linkedin,
        portfolio: freelancer.portfolio,
        profilePicture: freelancer.profilePicture,
        resume: freelancer.resume
      } : null
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};


const getFreelancerProfile = async (req, res) => {
  try {


    const freelancer = await Freelancer.findOne({ user: req.user.userId })
      .populate('user', 'email fullName phone address dob gender');

    if (!freelancer) {


      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const newFreelancer = new Freelancer({
        user: req.user.userId,
        fullName: user.fullName || 'User',
        phone: user.phone || '',
        location: user.address || '',
        skills: [],
        experience: '0',
        bio: '',
        github: '',
        linkedin: '',
        portfolio: '',
        profilePicture: '',
        resume: '',
        resumeOriginalName: ''
      });

      await newFreelancer.save();


      return res.json({
        success: true,
        freelancer: {
          _id: newFreelancer._id,
          fullName: newFreelancer.fullName,
          email: user.email,
          phone: newFreelancer.phone,
          location: newFreelancer.location,
          bio: newFreelancer.bio,
          skills: newFreelancer.skills,
          experience: newFreelancer.experience,
          github: newFreelancer.github,
          linkedin: newFreelancer.linkedin,
          portfolio: newFreelancer.portfolio,
          profilePicture: newFreelancer.profilePicture,
          resume: newFreelancer.resume,
          resumeOriginalName: newFreelancer.resumeOriginalName,
          rating: 0,
          reviewCount: 0,
          createdAt: newFreelancer.createdAt,
          updatedAt: newFreelancer.updatedAt
        }
      });
    }



    res.json({
      success: true,
      freelancer: {
        _id: freelancer._id,
        fullName: freelancer.fullName,
        email: freelancer.user?.email,
        phone: freelancer.phone,
        location: freelancer.location,
        bio: freelancer.bio,
        skills: freelancer.skills,
        experience: freelancer.experience,
        github: freelancer.github,
        linkedin: freelancer.linkedin,
        portfolio: freelancer.portfolio,
        profilePicture: freelancer.profilePicture,
        resume: freelancer.resume,
        resumeOriginalName: freelancer.resumeOriginalName,
        rating: freelancer.rating || 0,
        reviewCount: freelancer.reviewCount || 0,
        createdAt: freelancer.createdAt,
        updatedAt: freelancer.updatedAt
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};


const updateFreelancerProfile = async (req, res) => {
  try {



    const {
      fullName,
      email,
      phone,
      location,
      bio,
      skills,
      experience,
      github,
      linkedin,
      portfolio
    } = req.body;

    let freelancer = await Freelancer.findOne({ user: req.user.userId });

    if (!freelancer) {
      freelancer = new Freelancer({
        user: req.user.userId,
        fullName: fullName || 'User',
        skills: [],
        experience: '0',
        bio: '',
        location: '',
        phone: '',
        github: '',
        linkedin: '',
        portfolio: ''
      });
    }

    const updateData = {
      fullName: fullName || freelancer.fullName,
      phone: phone || freelancer.phone,
      location: location || freelancer.location,
      bio: bio || freelancer.bio,
      skills: Array.isArray(skills) ? skills : freelancer.skills,
      experience: experience || freelancer.experience,
      github: github || freelancer.github,
      linkedin: linkedin || freelancer.linkedin,
      portfolio: portfolio || freelancer.portfolio,
      updatedAt: Date.now()
    };

    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      freelancer._id,
      updateData,
      { new: true, runValidators: true, upsert: true }
    );

    if (email) {
      await User.findByIdAndUpdate(req.user.userId, { email });
    }



    res.json({
      success: true,
      message: 'Profile updated successfully',
      freelancer: updatedFreelancer
    });

  } catch (error) {


    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};


const uploadProfilePicture = async (req, res) => {
  try {


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      freelancer = new Freelancer({
        user: req.user.userId,
        fullName: 'User',
        skills: []
      });
      await freelancer.save();
    }

    if (freelancer.profilePicture) {
      try {
        const urlParts = freelancer.profilePicture.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        const folderPath = `freelancers/profiles/${publicId}`;
        await cloudinary.uploader.destroy(folderPath);
      } catch (deleteError) {

      }
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'freelancers/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    freelancer.profilePicture = uploadResult.secure_url;
    await freelancer.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: uploadResult.secure_url
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error uploading profile picture',
      error: error.message
    });
  }
};


const uploadResume = async (req, res) => {
  try {

    console.log('📎 File details:', {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      freelancer = new Freelancer({
        user: req.user.userId,
        fullName: 'User',
        skills: []
      });
      await freelancer.save();
    }

    if (freelancer.resume) {
      try {
        const urlParts = freelancer.resume.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        const folderPath = `freelancers/resumes/${publicId}`;
        await cloudinary.uploader.destroy(folderPath, { resource_type: 'raw' });
      } catch (deleteError) {

      }
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'freelancers/resumes',
          public_id: `${freelancer._id}_resume_${Date.now()}`,
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) {

            reject(error);
          } else {

            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    freelancer.resume = uploadResult.secure_url;
    freelancer.resumeOriginalName = req.file.originalname;
    await freelancer.save();



    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: uploadResult.secure_url,
      resumeOriginalName: req.file.originalname
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error uploading resume',
      error: error.message
    });
  }
};


const downloadResume = async (req, res) => {
  try {



    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer || !freelancer.resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }




    try {

      const resumeUrl = new URL(freelancer.resume);
      const isHttps = resumeUrl.protocol === 'https:';


      const httpModule = isHttps ? https : http;


      const request = httpModule.get(freelancer.resume, (response) => {



        if (response.statusCode !== 200) {

          return res.status(500).json({
            success: false,
            message: 'Failed to download resume from storage'
          });
        }


        const fileName = freelancer.resumeOriginalName || 'resume.pdf';
        const fileExtension = fileName.split('.').pop().toLowerCase();


        let contentType = 'application/octet-stream';
        switch (fileExtension) {
          case 'pdf':
            contentType = 'application/pdf';
            break;
          case 'doc':
            contentType = 'application/msword';
            break;
          case 'docx':
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          default:
            contentType = 'application/octet-stream';
        }


        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');


        response.pipe(res);



        response.on('end', () => {

        });

        response.on('error', (streamError) => {

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error streaming resume file'
            });
          }
        });
      });

      request.on('error', (requestError) => {

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to fetch resume from storage'
          });
        }
      });

      request.setTimeout(30000, () => {

        request.destroy();
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Download request timed out'
          });
        }
      });

    } catch (downloadError) {

      return res.status(500).json({
        success: false,
        message: 'Error downloading resume from storage',
        error: downloadError.message
      });
    }

  } catch (error) {

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error during resume download',
        error: error.message
      });
    }
  }
};


const getResumeInfo = async (req, res) => {
  try {


    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    res.json({
      success: true,
      hasResume: !!freelancer.resume,
      resumeOriginalName: freelancer.resumeOriginalName,
      resumeUrl: freelancer.resume
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error getting resume info',
      error: error.message
    });
  }
};


const deleteResume = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer || !freelancer.resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found to delete'
      });
    }

    try {
      const urlParts = freelancer.resume.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];
      const folderPath = `freelancers/resumes/${publicId}`;
      await cloudinary.uploader.destroy(folderPath, { resource_type: 'raw' });
    } catch (deleteError) {

    }

    freelancer.resume = null;
    freelancer.resumeOriginalName = null;
    await freelancer.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error deleting resume',
      error: error.message
    });
  }
};


const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: freelancers.length,
      freelancers
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching freelancers',
      error: error.message
    });
  }
};


const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id)
      .populate('user', 'email');

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found'
      });
    }

    res.json({
      success: true,
      freelancer
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching freelancer',
      error: error.message
    });
  }
};

module.exports = {
  registerFreelancer,
  loginFreelancer,
  getFreelancerProfile,
  updateFreelancerProfile,
  uploadProfilePicture,
  uploadResume,
  deleteResume,
  downloadResume,
  getResumeInfo,
  getAllFreelancers,
  getFreelancerById,
  upload
};
