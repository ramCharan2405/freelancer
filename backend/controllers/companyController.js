const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for file uploads
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

// Register company
const registerCompany = async (req, res) => {
  try {
    console.log('🔄 Company registration attempt:', req.body);

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

    // Validation
    if (!companyName && !organization) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Use companyName or organization as the name
    const finalCompanyName = companyName || organization;

    // Create user
    const newUser = new User({
      fullName: finalCompanyName,
      email,
      password: hashedPassword,
      role: 'company'
    });

    const savedUser = await newUser.save();

    // Create company profile
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

    const savedCompany = await newCompany.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Company registered successfully:', finalCompanyName);

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
    console.error('❌ Error registering company:', error);

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

// Login company
const loginCompany = async (req, res) => {
  try {
    console.log('🔄 Company login attempt:', req.body.email);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email and role
    const user = await User.findOne({ email, role: 'company' });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Find company profile
    const company = await Company.findOne({ user: user._id });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Company login successful:', user.fullName);

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
    console.error('❌ Error during company login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get company profile
const getCompanyProfile = async (req, res) => {
  try {
    console.log('🔄 Fetching company profile for user:', req.user.userId);

    const company = await Company.findOne({ user: req.user.userId })
      .populate('user', 'email fullName');

    if (!company) {
      console.log('❌ Company profile not found, creating new one...');

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
      console.log('✅ Created new company profile');

      return res.json({
        success: true,
        // FIXED: Map to expected field names for EditCompanyProfile
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

    console.log('✅ Company profile found:', company.companyName);

    res.json({
      success: true,
      // FIXED: Map to expected field names for EditCompanyProfile
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
    console.error('❌ Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
  try {
    console.log('🔄 Updating company profile for user:', req.user.userId);
    console.log('📥 Update data received:', req.body);

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

    // FIXED: Map frontend field names to backend field names
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

    // Update user email if provided
    if (email) {
      await User.findByIdAndUpdate(req.user.userId, {
        email,
        fullName: organization || company.companyName
      });
    }

    console.log('✅ Company profile updated successfully');

    // FIXED: Return data in expected format
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
    console.error('❌ Error updating company profile:', error);

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

// Upload company logo
const uploadLogo = async (req, res) => {
  try {
    console.log('🔄 Uploading company logo for user:', req.user.userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
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

    // Update company profile with new logo URL
    const company = await Company.findOneAndUpdate(
      { user: req.user.userId },
      { profilePicture: result.secure_url },
      { new: true, upsert: true }
    );

    console.log('✅ Logo uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: result.secure_url,
      profilePicture: result.secure_url
    });

  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// Get all companies
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
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching companies',
      error: error.message
    });
  }
};

// Get company by ID
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
    console.error('❌ Error fetching company:', error);
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



