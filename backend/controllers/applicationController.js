const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Freelancer = require('../models/Freelancer');
const Chat = require('../models/Chat');
const Message = require('../models/Message');


const applyForJob = async (req, res) => {
  try {



    const { jobId, coverLetter, proposedRate, estimatedDuration } = req.body;


    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }


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


    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {

      return res.status(400).json({
        success: false,
        message: 'Freelancer profile not found. Please complete your profile first.'
      });
    }




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


    const application = new Application({
      job: jobId,
      freelancer: freelancer._id, // Use freelancer._id, not req.user.userId
      coverLetter: coverLetter || '',
      proposedRate,
      estimatedDuration,
      status: 'pending',
      appliedAt: new Date()
    });

    const savedApplication = await application.save();


    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });


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



    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error applying for job',
      error: error.message
    });
  }
};


const getFreelancerApplications = async (req, res) => {
  try {



    const freelancer = await Freelancer.findOne({ user: req.user.userId });

    if (!freelancer) {

      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found. Please complete your profile first.',
        applications: []
      });
    }




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


    console.log('Applications found:', applications.map(app => ({
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

    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message,
      applications: []
    });
  }
};


const getCompanyApplications = async (req, res) => {
  try {



    const company = await Company.findOne({ user: req.user.userId });

    if (!company) {

      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.',
        applications: []
      });
    }




    const companyJobs = await Job.find({ company: company._id });
    const jobIds = companyJobs.map(job => job._id);




    const applications = await Application.find({
      job: { $in: jobIds }
    })
      .populate('job', 'title description salary location createdAt status')
      .populate('freelancer', 'fullName email skills experience profilePicture')
      .sort({ createdAt: -1 });



    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message,
      applications: []
    });
  }
};


const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;



    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }


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



    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message
    });
  }
};


const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;




    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }


    const company = await Company.findOne({ user: req.user.userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }


    const application = await Application.findById(id)
      .populate('job')
      .populate('freelancer');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }


    if (application.job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }


    application.status = status;
    application.responseDate = new Date();
    if (response) {
      application.response = response;
    }
    await application.save();


    if (status === 'accepted') {
      try {



        let chat = await Chat.findOne({
          jobId: application.job._id,
          companyId: company._id,
          freelancerId: application.freelancer._id,
          applicationId: id
        });

        if (!chat) {

          chat = new Chat({
            jobId: application.job._id,
            companyId: company._id,
            freelancerId: application.freelancer._id,
            applicationId: id,
            participants: [
              {
                userId: company.user,
                userType: 'company'
              },
              {
                userId: application.freelancer.user,
                userType: 'freelancer'
              }
            ],
            isActive: true
          });

          await chat.save();


          const welcomeMessage = new Message({
            chatId: chat._id,
            senderId: company.user,
            senderType: 'system',
            messageType: 'system',
            content: `🎉 Congratulations! Your application for "${application.job.title}" has been accepted. You can now discuss project details here.`,
            isRead: false
          });

          await welcomeMessage.save();


          chat.lastMessage = {
            content: welcomeMessage.content,
            senderId: welcomeMessage.senderId,
            timestamp: welcomeMessage.createdAt
          };
          await chat.save();




          const populatedChat = await Chat.findById(chat._id)
            .populate('jobId', 'title description')
            .populate({
              path: 'companyId',
              populate: { path: 'user', select: 'fullName email' }
            })
            .populate({
              path: 'freelancerId',
              populate: { path: 'user', select: 'fullName email' }
            });


          const io = req.app.get('io');
          if (io) {

            io.to(application.freelancer.user.toString()).emit('chat:created', populatedChat);

            io.to(company.user.toString()).emit('chat:created', populatedChat);


          }
        } else {

        }
      } catch (chatError) {


      }
    }


    const updatedApplication = await Application.findById(id)
      .populate('job', 'title description salary location company')
      .populate('freelancer', 'fullName email skills experience');



    res.json({
      success: true,
      message: `Application ${status} successfully${status === 'accepted' ? ' and chat created' : ''}`,
      application: updatedApplication
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error updating application status',
      error: error.message
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;



    const application = await Application.findById(id)
      .populate('freelancer', 'user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }


    if (!application.freelancer.user.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }


    await Application.findByIdAndDelete(id);


    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });



    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error withdrawing application',
      error: error.message
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;


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



    res.json({
      success: true,
      application
    });

  } catch (error) {

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