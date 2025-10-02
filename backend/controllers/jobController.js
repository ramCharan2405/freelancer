const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company'); // ADD THIS IMPORT

// Get jobs by company with detailed application data - FIXED
const getJobsByCompany = async (req, res) => {
  try {
    console.log('🔄 Fetching jobs for company user:', req.user.userId);

    // FIXED: Find company by user field, not direct user ID
    const company = await Company.findOne({ user: req.user.userId });

    if (!company) {
      console.log('❌ Company profile not found for user:', req.user.userId);
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.',
        jobs: []
      });
    }

    console.log('✅ Company found:', company._id);

    // Use company._id instead of req.user.userId
    const jobs = await Job.find({
      company: company._id // FIXED: Use company._id instead of req.user.userId
    })
      .populate('company', 'companyName organization email industry location')
      .sort({ createdAt: -1 });

    console.log('✅ Company jobs fetched:', jobs.length);

    // Get detailed application data for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        // FIXED: Fetch applications with ALL freelancer details including GitHub, LinkedIn, rating
        const applications = await Application.find({ job: job._id })
          .populate({
            path: 'freelancer',
            select: 'fullName phone location bio skills experience profilePicture portfolio github linkedin rating reviewCount resume resumeOriginalName hourlyRate completedProjects isAvailable' // ADDED MISSING FIELDS
          })
          .sort({ createdAt: -1 });

        const applicationCount = applications.length;
        const pendingCount = applications.filter(app => app.status === 'pending').length;
        const acceptedCount = applications.filter(app => app.status === 'accepted').length;
        const rejectedCount = applications.filter(app => app.status === 'rejected').length;

        console.log(`📊 Job "${job.title}": ${applicationCount} applications (${pendingCount} pending)`);

        return {
          ...job.toObject(),
          applications: applications.map(app => ({
            ...app.toObject(),
            // FIXED: Ensure ALL freelancer data is properly formatted
            freelancer: app.freelancer ? {
              _id: app.freelancer._id,
              fullName: app.freelancer.fullName || 'Unknown Name',
              phone: app.freelancer.phone || 'Not provided',
              location: app.freelancer.location || 'Not specified',
              bio: app.freelancer.bio || 'No bio available',
              skills: app.freelancer.skills || [],
              experience: app.freelancer.experience || 'Not specified',
              profilePicture: app.freelancer.profilePicture || null,
              portfolio: app.freelancer.portfolio || null,
              // ADDED: GitHub, LinkedIn, Rating, Resume fields
              github: app.freelancer.github || null,
              linkedin: app.freelancer.linkedin || null,
              rating: app.freelancer.rating || 0,
              reviewCount: app.freelancer.reviewCount || 0,
              resume: app.freelancer.resume || null,
              resumeOriginalName: app.freelancer.resumeOriginalName || null,
              hourlyRate: app.freelancer.hourlyRate || null,
              completedProjects: app.freelancer.completedProjects || 0,
              isAvailable: app.freelancer.isAvailable !== undefined ? app.freelancer.isAvailable : true
            } : null
          })),
          applicationCount,
          pendingCount,
          acceptedCount,
          rejectedCount
        };
      })
    );

    console.log('✅ Jobs with applications processed');

    res.json({
      success: true,
      count: jobsWithApplications.length,
      jobs: jobsWithApplications
    });

  } catch (error) {
    console.error('❌ Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching jobs',
      error: error.message,
      jobs: []
    });
  }
};

// Create a new job - FIXED
const createJob = async (req, res) => {
  try {
    console.log('🔄 Creating job with data:', req.body);
    console.log('🔄 User info:', req.user);

    // FIXED: Find company by user field first
    const company = await Company.findOne({ user: req.user.userId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.'
      });
    }

    console.log('✅ Company found for job creation:', company._id);

    // Handle both payPerHour and salary fields
    let salaryValue = 'Not specified';

    if (req.body.salary) {
      salaryValue = req.body.salary;
    } else if (req.body.payPerHour) {
      salaryValue = `$${parseFloat(req.body.payPerHour)}/hour`;
    } else if (req.body.budget) {
      salaryValue = req.body.budget;
    }

    // Handle skills field (both skillsRequired and skills)
    let skillsArray = [];
    if (req.body.skills && Array.isArray(req.body.skills)) {
      skillsArray = req.body.skills;
    } else if (req.body.skillsRequired && Array.isArray(req.body.skillsRequired)) {
      skillsArray = req.body.skillsRequired;
    } else if (typeof req.body.skillsRequired === 'string') {
      skillsArray = req.body.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    // Map experience level to backend enum
    let experienceLevel = 'entry';
    if (req.body.experienceLevel) {
      const expLevel = req.body.experienceLevel.toLowerCase();
      if (expLevel.includes('intermediate')) experienceLevel = 'mid';
      else if (expLevel.includes('expert') || expLevel.includes('senior')) experienceLevel = 'senior';
    } else if (req.body.experience) {
      experienceLevel = req.body.experience;
    }

    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location || 'Remote',
      salary: salaryValue,
      budget: req.body.budget || salaryValue,
      payPerHour: req.body.payPerHour || null,
      skills: skillsArray,
      requirements: req.body.requirements || '',
      responsibilities: req.body.responsibilities || '',
      experience: experienceLevel,
      jobType: req.body.jobType || 'freelance',
      deadline: req.body.deadline || null,
      company: company._id, // FIXED: Use company._id instead of req.user.userId
      status: 'active',
      isActive: true,
      applicationsCount: 0
    };

    console.log('🔍 Processed job data:', jobData);

    const job = new Job(jobData);
    const savedJob = await job.save();

    // Populate the company details for response
    const populatedJob = await Job.findById(savedJob._id)
      .populate('company', 'companyName organization industry location profilePicture');

    console.log('✅ Job created successfully with company:', company._id);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: populatedJob
    });

  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating job',
      error: error.message
    });
  }
};

// Get all jobs - UNCHANGED
const getAllJobs = async (req, res) => {
  try {
    console.log('🔄 Fetching all jobs...');

    const jobs = await Job.find({ isActive: true })
      .populate('company', 'companyName organization email industry location')
      .sort({ createdAt: -1 });

    console.log('✅ All jobs fetched:', jobs.length);

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching jobs',
      error: error.message
    });
  }
};

// Get job by ID - UNCHANGED
const getJobById = async (req, res) => {
  try {
    console.log('🔄 Fetching job by ID:', req.params.id);

    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName organization email industry location');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    console.log('✅ Job found:', job.title);

    res.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('❌ Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching job',
      error: error.message
    });
  }
};

// Update job - FIXED
const updateJob = async (req, res) => {
  try {
    console.log('🔄 Updating job:', req.params.id);

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // FIXED: Check if user owns the company that posted this job
    const company = await Company.findOne({ user: req.user.userId });

    if (!company || !job.company.equals(company._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'companyName organization email');

    console.log('✅ Job updated successfully:', updatedJob.title);

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating job',
      error: error.message
    });
  }
};

// Delete job - FIXED
const deleteJob = async (req, res) => {
  try {
    console.log('🔄 Deleting job:', req.params.id);

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // FIXED: Check if user owns the company that posted this job
    const company = await Company.findOne({ user: req.user.userId });

    if (!company || !job.company.equals(company._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    console.log('✅ Job deleted successfully');

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting job',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByCompany
};