const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const mongoose = require('mongoose'); // ADD THIS LINE


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});


const registerCompany = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {


    const {
      companyName,
      organization,
      email,
      password,
      confirmPassword,
      industry,
      location,
      website,
      contact,
      description
    } = req.body;


    if (!companyName && !organization) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    if (!email || !password) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password !== confirmPassword) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }


    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const finalCompanyName = companyName || organization;


    const newUser = new User({
      fullName: finalCompanyName,
      email,
      password: hashedPassword,
      role: 'company'
    });

    const savedUser = await newUser.save({ session });



    const newCompany = new Company({
      user: savedUser._id,
      companyName: finalCompanyName,
      organization: finalCompanyName,
      industry: industry || '',
      location: location || '',
      website: website || '',
      contact: contact || '',
      description: description || '',
      profilePicture: '',
      employees: 1,
      founded: new Date().getFullYear()
    });

    const savedCompany = await newCompany.save({ session });



    await session.commitTransaction();
    session.endSession();


    const token = jwt.sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );



    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        companyName: finalCompanyName,
        organization: finalCompanyName,
        fullName: finalCompanyName
      },
      company: {
        id: savedCompany._id,
        companyName: savedCompany.companyName,
        organization: savedCompany.organization,
        industry: savedCompany.industry,
        location: savedCompany.location,
        website: savedCompany.website,
        contact: savedCompany.contact,
        description: savedCompany.description
      }
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();



    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};


const loginCompany = async (req, res) => {
  try {


    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }


    const user = await User.findOne({ email, role: 'company' });
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


    const company = await Company.findOne({ user: user._id });


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
        companyName: company?.companyName || user.fullName,
        organization: company?.organization || user.fullName,
        fullName: user.fullName
      },
      company: company ? {
        id: company._id,
        companyName: company.companyName,
        organization: company.organization,
        industry: company.industry,
        location: company.location,
        website: company.website,
        contact: company.contact,
        description: company.description
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


const getCompanyProfile = async (req, res) => {
  try {


    const company = await Company.findOne({ user: req.user.userId })
      .populate('user', 'email fullName');

    if (!company) {


      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const newCompany = new Company({
        user: req.user.userId,
        companyName: user.fullName || 'Company',
        organization: user.fullName || 'Company',
        industry: '',
        location: '',
        website: '',
        contact: '',
        description: '',
        profilePicture: ''
      });

      await newCompany.save();


      return res.json({
        success: true,

        organization: newCompany.companyName,
        email: user.email,
        contact: newCompany.contact,
        address: newCompany.location, // Map location to address
        about: newCompany.description, // Map description to about
        website: newCompany.website,
        logo: newCompany.profilePicture, // Map profilePicture to logo
        industry: newCompany.industry,
        employees: newCompany.employees,
        founded: newCompany.founded
      });
    }



    res.json({
      success: true,

      organization: company.companyName,
      email: company.user?.email,
      contact: company.contact,
      address: company.location, // Map location to address
      about: company.description, // Map description to about
      website: company.website,
      logo: company.profilePicture, // Map profilePicture to logo
      industry: company.industry,
      employees: company.employees,
      founded: company.founded,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};


const updateCompanyProfile = async (req, res) => {
  try {



    const {
      organization,
      email,
      contact,
      address, // Will map to location
      about,   // Will map to description
      website,
      industry,
      employees,
      founded
    } = req.body;

    let company = await Company.findOne({ user: req.user.userId });

    if (!company) {
      company = new Company({
        user: req.user.userId,
        companyName: organization || 'Company',
        organization: organization || 'Company'
      });
    }


    const updateData = {
      companyName: organization || company.companyName,
      organization: organization || company.organization,
      industry: industry || company.industry,
      location: address || company.location, // Map address to location
      website: website || company.website,
      contact: contact || company.contact,
      description: about || company.description, // Map about to description
      employees: employees || company.employees,
      founded: founded || company.founded,
      updatedAt: Date.now()
    };

    const updatedCompany = await Company.findByIdAndUpdate(
      company._id,
      updateData,
      { new: true, runValidators: true, upsert: true }
    );


    if (email) {
      await User.findByIdAndUpdate(req.user.userId, {
        email,
        fullName: organization || company.companyName
      });
    }




    res.json({
      success: true,
      message: 'Profile updated successfully',
      organization: updatedCompany.companyName,
      email: email || updatedCompany.user?.email,
      contact: updatedCompany.contact,
      address: updatedCompany.location,
      about: updatedCompany.description,
      website: updatedCompany.website,
      logo: updatedCompany.profilePicture,
      industry: updatedCompany.industry,
      employees: updatedCompany.employees,
      founded: updatedCompany.founded
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


const uploadLogo = async (req, res) => {
  try {


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }


    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'company-logos',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });


    const company = await Company.findOneAndUpdate(
      { user: req.user.userId },
      { profilePicture: result.secure_url },
      { new: true, upsert: true }
    );



    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: result.secure_url,
      profilePicture: result.secure_url
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};


const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: companies.length,
      companies
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching companies',
      error: error.message
    });
  }
};


const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('user', 'email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      company
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching company',
      error: error.message
    });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  getCompanyProfile,
  updateCompanyProfile,
  uploadLogo,
  upload, // Export multer middleware
  getAllCompanies,
  getCompanyById
};



