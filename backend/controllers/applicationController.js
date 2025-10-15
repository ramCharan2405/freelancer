const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Freelancer = require('../models/Freelancer');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { calculateSkillMatch } = require('../utils/skillMatcher');
const { sendEmail, emailTemplates } = require('../config/email');
const { createCalendarEvent, updateCalendarEvent } = require('../config/googleCalendar');


const applyForJob = async (req, res) => {
  try {

    const { jobId, coverLetter, proposedRate, estimatedDuration } = req.body;


    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Fetch job with skills
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

    // Fetch freelancer profile with skills
    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      return res.status(400).json({
        success: false,
        message: 'Freelancer profile not found. Please complete your profile first.'
      });
    }

    // Check existing application
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: freelancer._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // ✅ NEW: Calculate skill match
    const skillMatch = calculateSkillMatch(
      freelancer.skills || [],
      job.skills || job.skillsRequired || []
    );

    console.log('📊 Skill Match Result:', {
      matchScore: skillMatch.matchScore,
      matched: skillMatch.matchedSkills,
      missing: skillMatch.missingSkills,
      shouldAutoReject: skillMatch.shouldAutoReject
    });

    // ✅ NEW: Determine initial status based on skill match
    let initialStatus = 'pending';
    let timeline = [{
      stage: 'application_submitted',
      status: 'Application submitted',
      timestamp: new Date(),
      notes: `Skill match score: ${skillMatch.matchScore}%`
    }];

    if (skillMatch.shouldAutoReject) {
      initialStatus = 'auto-rejected';
      timeline.push({
        stage: 'auto_screened',
        status: 'Auto-rejected due to skill mismatch',
        timestamp: new Date(),
        notes: skillMatch.reason
      });
    } else if (skillMatch.matchScore >= 75) {
      initialStatus = 'qualified';
      timeline.push({
        stage: 'auto_screened',
        status: 'Qualified - High skill match',
        timestamp: new Date(),
        notes: `Excellent match! ${skillMatch.matchScore}% skills matched.`
      });
    } else if (skillMatch.matchScore >= 50) {
      initialStatus = 'under-review';
      timeline.push({
        stage: 'auto_screened',
        status: 'Under review - Moderate skill match',
        timestamp: new Date(),
        notes: `Moderate match: ${skillMatch.matchScore}% skills matched. Awaiting manual review.`
      });
    }

    // Create application with skill match data
    const application = new Application({
      job: jobId,
      freelancer: freelancer._id,
      coverLetter: coverLetter || '',
      proposedRate,
      estimatedDuration,
      status: initialStatus,
      skillMatchScore: skillMatch.matchScore,
      matchedSkills: skillMatch.matchedSkills,
      missingSkills: skillMatch.missingSkills,
      autoRejectionReason: skillMatch.shouldAutoReject ? skillMatch.reason : null,
      timeline,
      appliedAt: new Date()
    });

    const savedApplication = await application.save();

    // Update job applications count (only for non-auto-rejected)
    if (!skillMatch.shouldAutoReject) {
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationsCount: 1 }
      });
    }

    // Populate for response
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

    // ✅ NEW: Different response based on status
    if (skillMatch.shouldAutoReject) {
      return res.status(200).json({
        success: false,
        message: 'Application auto-rejected',
        reason: skillMatch.reason,
        application: populatedApplication,
        skillMatch: {
          score: skillMatch.matchScore,
          matched: skillMatch.matchedSkills,
          missing: skillMatch.missingSkills
        }
      });
    }

    // After creating application, send email to company
    const jobDetails = await Job.findById(jobId).populate('company', 'organization email companyName');
    const freelancerDetails = await Freelancer.findById(freelancer._id);

    if (jobDetails && jobDetails.company && jobDetails.company.email) {
      const emailTemplate = emailTemplates.companyNewApplication(
        jobDetails.company.organization || jobDetails.company.companyName,
        freelancerDetails.fullName,
        jobDetails.title,
        skillMatch.matchScore
      );

      await sendEmail(jobDetails.company.email, emailTemplate);
    }

    res.status(201).json({
      success: true,
      message: initialStatus === 'qualified'
        ? 'Application submitted successfully! You have excellent skills match.'
        : 'Application submitted successfully and under review.',
      application: populatedApplication,
      skillMatch: {
        score: skillMatch.matchScore,
        matched: skillMatch.matchedSkills,
        missing: skillMatch.missingSkills
      }
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


    // ✅ SEND EMAIL FOR STATUS CHANGES
    if (['qualified', 'accepted', 'rejected', 'interview-scheduled'].includes(status)) {
      const emailTemplate = emailTemplates.applicationStatusChanged(
        application.freelancer.fullName,
        application.job.title,
        status,
        response
      );

      await sendEmail(application.freelancer.email, emailTemplate);
    }

    // Emit socket event
    if (req.io) {
      req.io.to(application.freelancer._id.toString()).emit('application:status-updated', {
        applicationId: application._id,
        newStatus: status,
        message: response
      });
    }

    res.json({
      success: true,
      message: `Application ${status} successfully${status === 'accepted' ? ' and chat created' : ''}`,
      application
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


const sendAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;

    const application = await Application.findById(id)
      .populate('freelancer', 'fullName email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application with assignment
    application.assignment = {
      title,
      description,
      deadline,
      isSent: true,
      sentAt: new Date()
    };
    application.status = 'assignment-sent';
    application.timeline.push({
      status: 'assignment-sent',
      timestamp: new Date(),
      notes: `Assignment sent: ${title}`
    });

    await application.save();

    // ✅ SEND EMAIL NOTIFICATION
    const emailTemplate = emailTemplates.assignmentReceived(
      application.freelancer.fullName,
      application.job.title,
      deadline,
      title
    );

    await sendEmail(application.freelancer.email, emailTemplate);

    // Emit socket event
    if (req.io) {
      req.io.to(application.freelancer._id.toString()).emit('assignment:received', {
        applicationId: application._id,
        jobTitle: application.job.title,
        assignmentTitle: title,
        deadline
      });
    }

    res.json({
      success: true,
      message: 'Assignment sent successfully and email notification delivered',
      application
    });

  } catch (error) {
    console.error('Error sending assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ NEW: Submit assignment by freelancer
const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionUrl, submissionNotes } = req.body;

    const freelancer = await Freelancer.findOne({ user: req.user.userId });
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.freelancer.toString() !== freelancer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (application.status !== 'assignment-sent') {
      return res.status(400).json({
        success: false,
        message: 'No assignment pending for this application'
      });
    }

    // Update application
    application.status = 'assignment-submitted';
    application.assignment.submissionUrl = submissionUrl;
    application.assignment.submissionNotes = submissionNotes;
    application.assignment.submittedAt = new Date();
    application.timeline.push({
      stage: 'assignment_submitted',
      status: 'Assignment submitted',
      timestamp: new Date(),
      notes: `Submitted: ${submissionUrl}`
    });

    await application.save();

    // TODO: Send email notification to company

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      application
    });

  } catch (error) {
    console.error('❌ Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ NEW: Review assignment by company
const reviewAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes, reviewScore, decision } = req.body; // decision: 'approve' or 'reject'

    const company = await Company.findOne({ user: req.user.userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (application.status !== 'assignment-submitted') {
      return res.status(400).json({
        success: false,
        message: 'Assignment not submitted yet'
      });
    }

    // Update application
    application.assignment.isReviewed = true;
    application.assignment.reviewNotes = reviewNotes;
    application.assignment.reviewScore = reviewScore;
    application.assignment.reviewedAt = new Date();
    application.timeline.push({
      stage: 'assignment_reviewed',
      status: decision === 'approve' ? 'Assignment approved' : 'Assignment rejected',
      timestamp: new Date(),
      notes: reviewNotes
    });

    if (decision === 'approve') {
      application.status = 'in-review'; // Move to next stage (interview or final decision)
    } else {
      application.status = 'rejected';
      application.response = `Assignment review: ${reviewNotes}`;
      application.responseDate = new Date();
    }

    await application.save();

    res.json({
      success: true,
      message: decision === 'approve'
        ? 'Assignment approved. You can now schedule an interview or make final decision.'
        : 'Assignment rejected',
      application
    });

  } catch (error) {
    console.error('❌ Error reviewing assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ NEW: Schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime, meetingLink, notes, duration } = req.body;

    // ✅ FIX: Populate job.company instead of just company
    const application = await Application.findById(id)
      .populate('freelancer', 'fullName email')
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'organization email companyName'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify company ownership
    const company = await Company.findOne({ user: req.user.userId });
    if (!company || application.job.company._id.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interview for this application'
      });
    }

    // Parse date and time
    const startDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const durationMinutes = parseInt(duration) || 45;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    let calendarEvent = null;

    // ✅ TRY TO CREATE GOOGLE CALENDAR EVENT (but don't fail if it doesn't work)
    try {
      calendarEvent = await createCalendarEvent({
        title: `Interview: ${application.job.title}`,
        description: `Interview with ${application.freelancer.fullName}\n\nJob: ${application.job.title}\n\nNotes: ${notes || 'No additional notes'}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        meetingLink: meetingLink,
        attendees: [
          {
            email: application.freelancer.email,
            displayName: application.freelancer.fullName
          },
          {
            email: application.job.company.email,
            displayName: application.job.company.organization || application.job.company.companyName
          },
        ],
      });

      console.log('✅ Calendar event created:', calendarEvent.eventId);
    } catch (calendarError) {
      console.warn('⚠️ Could not create calendar event:', calendarError.message);
      console.warn('Continuing without calendar integration...');
    }

    // Update application
    application.interview = {
      scheduledDate,
      scheduledTime,
      meetingLink,
      notes,
      duration: `${durationMinutes} minutes`,
      isScheduled: true,
      calendarEventId: calendarEvent?.eventId || null,
      calendarEventLink: calendarEvent?.eventLink || null,
    };
    application.status = 'interview-scheduled';
    application.timeline.push({
      status: 'interview-scheduled',
      timestamp: new Date(),
      notes: `Interview scheduled for ${startDateTime.toLocaleDateString()} at ${scheduledTime}`
    });

    await application.save();

    // ✅ SEND EMAIL NOTIFICATION
    try {
      const emailTemplate = emailTemplates.interviewScheduled(
        application.freelancer.fullName,
        application.job.title,
        scheduledDate,
        scheduledTime,
        meetingLink,
        duration
      );

      await sendEmail(application.freelancer.email, emailTemplate);
      console.log('✅ Interview email sent to freelancer');
    } catch (emailError) {
      console.warn('⚠️ Could not send email:', emailError.message);
    }

    // Emit socket event
    if (req.io) {
      req.io.to(application.freelancer._id.toString()).emit('interview:scheduled', {
        applicationId: application._id,
        jobTitle: application.job.title,
        scheduledDate,
        scheduledTime,
        meetingLink,
        calendarLink: calendarEvent?.eventLink || null,
      });
    }

    res.json({
      success: true,
      message: calendarEvent
        ? 'Interview scheduled successfully with calendar invite'
        : 'Interview scheduled successfully',
      application,
      calendar: calendarEvent ? {
        eventId: calendarEvent.eventId,
        eventLink: calendarEvent.eventLink,
      } : null
    });

  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scheduling interview',
      error: error.message
    });
  }
};

// ✅ NEW: Mark interview as completed
const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedbackNotes, rating } = req.body;

    const company = await Company.findOne({ user: req.user.userId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (application.status !== 'interview-scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Interview not scheduled'
      });
    }

    // Update application
    application.status = 'interview-completed';
    application.interview.isCompleted = true;
    application.interview.completedAt = new Date();
    application.interview.feedbackNotes = feedbackNotes;
    application.interview.rating = rating;
    application.timeline.push({
      stage: 'interview_completed',
      status: 'Interview completed',
      timestamp: new Date(),
      notes: `Rating: ${rating}/5`
    });

    await application.save();

    res.json({
      success: true,
      message: 'Interview marked as completed. You can now make final decision.',
      application
    });

  } catch (error) {
    console.error('❌ Error completing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  applyForJob,
  getFreelancerApplications,
  getCompanyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById,
  // ✅ NEW EXPORTS
  sendAssignment,
  submitAssignment,
  reviewAssignment,
  scheduleInterview,
  completeInterview
};