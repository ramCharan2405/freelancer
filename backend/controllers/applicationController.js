const Application = require('../models/Application');
const Job = require('../models/Job');
const Freelancer = require('../models/Freelancer');
const Company = require('../models/Company');

// Apply for a job - FIXED
const applyForJob = async (req, res) => {
  try {
    console.log('🔄 Job application attempt:', req.body);
    console.log('🔄 User info:', req.user);

    const { jobId, coverLetter } = req.body;

    // Validate input
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive || job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // FIXED: Find freelancer by user field, not by ID
    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      console.log('❌ Freelancer profile not found for user:', req.user.userId);
      return res.status(400).json({
        success: false,
        message: 'Freelancer profile not found. Please complete your profile first.'
      });
    }

    console.log('✅ Freelancer found:', freelancer._id);

    // Check if user already applied - use freelancer._id for the application
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: freelancer._id // Use freelancer._id, not req.user.userId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application - use freelancer._id
    const application = new Application({
      job: jobId,
      freelancer: freelancer._id, // Use freelancer._id, not req.user.userId
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedAt: new Date()
    });

    const savedApplication = await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    // Populate the saved application for response
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('job', 'title description salary location company createdAt')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'companyName organization email industry'
        }
      })
      .populate('freelancer', 'fullName email skills experience');

    console.log('✅ Application submitted successfully:', savedApplication._id);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });

  } catch (error) {
    console.error('❌ Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error applying for job',
      error: error.message
    });
  }
};

// Get applications by freelancer - FIXED
const getFreelancerApplications = async (req, res) => {
  try {
    console.log('🔄 Fetching applications for freelancer user:', req.user.userId);

    // FIXED: First find the freelancer document using the user ID
    const freelancer = await Freelancer.findOne({ user: req.user.userId });

    if (!freelancer) {
      console.log('❌ Freelancer profile not found for user:', req.user.userId);
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found. Please complete your profile first.',
        applications: []
      });
    }

    console.log('✅ Freelancer found:', freelancer._id);

    // Now find applications using the freelancer's _id, not the user ID
    const applications = await Application.find({
      freelancer: freelancer._id // Use freelancer._id instead of req.user.userId
    })
      .populate('job', 'title description salary location company createdAt status isActive')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'companyName organization email industry profilePicture'
        }
      })
      .sort({ createdAt: -1 });

    console.log('✅ Freelancer applications fetched:', applications.length);
    console.log('📋 Applications found:', applications.map(app => ({
      id: app._id,
      jobTitle: app.job?.title,
      companyName: app.job?.company?.companyName || app.job?.company?.organization,
      status: app.status,
      appliedAt: app.createdAt
    })));

    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('❌ Error fetching freelancer applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message,
      applications: []
    });
  }
};

// Get applications by company - FIXED
const getCompanyApplications = async (req, res) => {
  try {
    console.log('🔄 Fetching applications for company user:', req.user.userId);

    // FIXED: Find company by user field, not by ID
    const company = await Company.findOne({ user: req.user.userId });

    if (!company) {
      console.log('❌ Company profile not found for user:', req.user.userId);
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.',
        applications: []
      });
    }

    console.log('✅ Company found:', company._id);

    // Find jobs posted by this company
    const companyJobs = await Job.find({ company: company._id });
    const jobIds = companyJobs.map(job => job._id);

    console.log('📋 Company jobs found:', jobIds.length);

    // Find applications for these jobs
    const applications = await Application.find({
      job: { $in: jobIds }
    })
      .populate('job', 'title description salary location createdAt status')
      .populate('freelancer', 'fullName email skills experience profilePicture')
      .sort({ createdAt: -1 });

    console.log('✅ Company applications fetched:', applications.length);

    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('❌ Error fetching company applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message,
      applications: []
    });
  }
};

// Get applications for a specific job - FIXED
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('🔄 Fetching applications for job:', jobId);

    // Verify job exists and user has permission
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // FIXED: Check if user is the job owner (company)
    const company = await Company.findOne({ user: req.user.userId });
    if (!company || !job.company.equals(company._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('freelancer', 'fullName email skills experience profilePicture')
      .sort({ createdAt: -1 });

    console.log('✅ Job applications fetched:', applications.length);

    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('❌ Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message
    });
  }
};

// Update application status - FIXED
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    console.log('🔄 Updating application status:', { id, status, response });

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find application
    const application = await Application.findById(id)
      .populate('job', 'company')
      .populate('freelancer', 'user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // FIXED: Check permissions
    if (status === 'withdrawn') {
      // Freelancer can withdraw their own application
      if (!application.freelancer.user.equals(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to withdraw this application'
        });
      }
    } else {
      // Company can accept/reject applications
      const company = await Company.findOne({ user: req.user.userId });
      if (!company || !application.job.company.equals(company._id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this application'
        });
      }
    }

    // Update application
    const updateData = {
      status,
      responseDate: new Date()
    };

    if (response) {
      updateData.response = response;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('job', 'title description salary location company')
      .populate('freelancer', 'fullName email skills experience');

    console.log('✅ Application status updated successfully');

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating application status',
      error: error.message
    });
  }
};

// Withdraw application - FIXED
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Withdrawing application:', id);

    // Find application
    const application = await Application.findById(id)
      .populate('freelancer', 'user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // FIXED: Check if user owns this application
    if (!application.freelancer.user.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Delete application
    await Application.findByIdAndDelete(id);

    // Update job applications count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });

    console.log('✅ Application withdrawn successfully');

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('❌ Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error withdrawing application',
      error: error.message
    });
  }
};

// Get application by ID - FIXED
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Fetching application by ID:', id);

    const application = await Application.findById(id)
      .populate('job', 'title description salary location company createdAt')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'companyName organization email industry profilePicture'
        }
      })
      .populate('freelancer', 'fullName email skills experience profilePicture user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // FIXED: Check permissions - freelancer can see their own, company can see applications to their jobs
    const isFreelancer = application.freelancer.user.equals(req.user.userId);
    let isCompanyOwner = false;

    if (!isFreelancer) {
      const company = await Company.findOne({ user: req.user.userId });
      isCompanyOwner = company && application.job.company.equals(company._id);
    }

    if (!isFreelancer && !isCompanyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    console.log('✅ Application fetched successfully');

    res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('❌ Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching application',
      error: error.message
    });
  }
};

module.exports = {
  applyForJob,
  getFreelancerApplications,
  getCompanyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById
};