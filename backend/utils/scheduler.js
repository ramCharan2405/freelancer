const cron = require('node-cron');
const Application = require('../models/Application');
const { sendEmail, emailTemplates } = require('../config/email');

// Check expired assignments and interviews every hour
const startScheduler = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('🔍 Checking for expired assignments and interviews...');

        try {
            await checkExpiredAssignments();
            await checkExpiredInterviews();
        } catch (error) {
            console.error('❌ Scheduler error:', error);
        }
    });

    console.log('⏰ Deadline scheduler started');
};

// Check expired assignments
const checkExpiredAssignments = async () => {
    const now = new Date();

    const expiredAssignments = await Application.find({
        status: 'assignment-sent',
        'assignment.deadline': { $lt: now },
        'assignment.submittedAt': { $exists: false }
    })
        .populate('freelancer', 'fullName email')
        .populate('job', 'title')
        .populate({
            path: 'job',
            populate: { path: 'company', select: 'organization email' }
        });

    console.log(`⏰ Found ${expiredAssignments.length} expired assignments`);

    for (const application of expiredAssignments) {
        // Update status to rejected due to missed deadline
        application.status = 'rejected';
        application.response = 'Assignment deadline missed';
        application.responseDate = new Date();
        application.timeline.push({
            stage: 'final_decision',
            status: 'Rejected - Deadline expired',
            timestamp: new Date(),
            notes: `Assignment deadline (${application.assignment.deadline.toLocaleString()}) was missed`
        });

        await application.save();

        // Send email to freelancer
        if (application.freelancer && application.freelancer.email) {
            const emailTemplate = {
                subject: `⏰ Assignment Deadline Missed - ${application.job.title}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: #ef4444; padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; }
              .expired-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Assignment Deadline Missed</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${application.freelancer.fullName}</strong>,</p>
                <p>Unfortunately, you missed the deadline for the assignment in your application for <strong>${application.job.title}</strong>.</p>
                
                <div class="expired-box">
                  <strong>Deadline was:</strong> ${application.assignment.deadline.toLocaleString()}<br>
                  <strong>Status:</strong> Application rejected
                </div>
                
                <p>We encourage you to apply for other opportunities and ensure timely submission of assignments in the future.</p>
              </div>
            </div>
          </body>
          </html>
        `
            };

            await sendEmail(application.freelancer.email, emailTemplate);
        }

        // Notify company
        if (application.job && application.job.company && application.job.company.email) {
            const emailTemplate = {
                subject: `⏰ Assignment Deadline Missed by ${application.freelancer.fullName}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; padding: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⏰ Assignment Deadline Missed</h1>
              <p><strong>${application.freelancer.fullName}</strong> missed the assignment deadline for <strong>${application.job.title}</strong>.</p>
              <p><strong>Deadline was:</strong> ${application.assignment.deadline.toLocaleString()}</p>
              <p>The application has been automatically rejected.</p>
            </div>
          </body>
          </html>
        `
            };

            await sendEmail(application.job.company.email, emailTemplate);
        }

        console.log(`✅ Expired assignment processed for application ${application._id}`);
    }
};

// Check expired interviews (missed interviews)
const checkExpiredInterviews = async () => {
    const now = new Date();

    // Find interviews that are 2 hours past scheduled time and not completed
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const missedInterviews = await Application.find({
        status: 'interview-scheduled',
        'interview.isCompleted': false,
        'interview.scheduledDate': { $lt: twoHoursAgo }
    })
        .populate('freelancer', 'fullName email')
        .populate('job', 'title')
        .populate({
            path: 'job',
            populate: { path: 'company', select: 'organization email' }
        });

    console.log(`⏰ Found ${missedInterviews.length} missed interviews`);

    for (const application of missedInterviews) {
        application.status = 'rejected';
        application.response = 'Interview was not attended';
        application.responseDate = new Date();
        application.timeline.push({
            stage: 'final_decision',
            status: 'Rejected - Interview not attended',
            timestamp: new Date(),
            notes: `Interview scheduled for ${application.interview.scheduledDate.toLocaleString()} was not attended`
        });

        await application.save();

        // Send email to freelancer
        if (application.freelancer && application.freelancer.email) {
            const emailTemplate = {
                subject: `⏰ Interview Missed - ${application.job.title}`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial; background: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 30px;">
              <h1 style="color: #ef4444;">⏰ Interview Missed</h1>
              <p>Hi <strong>${application.freelancer.fullName}</strong>,</p>
              <p>You missed the scheduled interview for <strong>${application.job.title}</strong>.</p>
              <p><strong>Scheduled time:</strong> ${application.interview.scheduledDate.toLocaleString()}</p>
              <p>Your application has been automatically rejected.</p>
            </div>
          </body>
          </html>
        `
            };

            await sendEmail(application.freelancer.email, emailTemplate);
        }

        console.log(`✅ Missed interview processed for application ${application._id}`);
    }
};

// Send reminder emails (24 hours before deadline)
const sendDeadlineReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAssignments = await Application.find({
        status: 'assignment-sent',
        'assignment.deadline': {
            $gte: new Date(),
            $lte: tomorrow
        },
        'assignment.submittedAt': { $exists: false }
    })
        .populate('freelancer', 'fullName email')
        .populate('job', 'title');

    for (const application of upcomingAssignments) {
        if (application.freelancer && application.freelancer.email) {
            const hoursLeft = Math.round((application.assignment.deadline - new Date()) / (1000 * 60 * 60));

            const emailTemplate = {
                subject: `⏰ Assignment Deadline Reminder - ${hoursLeft} hours left`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial; background: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 30px;">
              <h1 style="color: #f59e0b;">⏰ Assignment Deadline Approaching!</h1>
              <p>Hi <strong>${application.freelancer.fullName}</strong>,</p>
              <p>This is a reminder that your assignment for <strong>${application.job.title}</strong> is due in approximately <strong>${hoursLeft} hours</strong>.</p>
              <p><strong>Deadline:</strong> ${application.assignment.deadline.toLocaleString()}</p>
              <p><a href="${process.env.FRONTEND_URL}/freelancer-dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Submit Assignment Now</a></p>
            </div>
          </body>
          </html>
        `
            };

            await sendEmail(application.freelancer.email, emailTemplate);
        }
    }

    console.log(`✅ Sent ${upcomingAssignments.length} deadline reminders`);
};

// Run reminder check daily at 9 AM
cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Sending deadline reminders...');
    await sendDeadlineReminders();
});

module.exports = {
    startScheduler,
    checkExpiredAssignments,
    checkExpiredInterviews,
    sendDeadlineReminders
};