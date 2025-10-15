const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (not regular password)
  },
});

// Email templates
const emailTemplates = {
  assignmentReceived: (freelancerName, jobTitle, deadline, assignmentTitle) => ({
    subject: `🎯 New Assignment: ${assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .detail-row { margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Assignment Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${freelancerName}</strong>,</p>
            <p>You have received a new assignment for your application to <strong>${jobTitle}</strong>.</p>
            
            <div class="alert-box">
              <strong>⏰ Action Required!</strong> Please complete and submit this assignment before the deadline.
            </div>
            
            <div class="detail-row">
              <strong>Assignment:</strong> ${assignmentTitle}
            </div>
            <div class="detail-row">
              <strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
            </div>
            
            <p>Login to your dashboard to view the full assignment details and submit your work.</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/freelancer-dashboard" class="button">View Assignment</a>
            </center>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>💡 Tips for Success:</strong><br>
              • Read the assignment requirements carefully<br>
              • Test your solution thoroughly<br>
              • Include clear documentation<br>
              • Submit before the deadline
            </p>
          </div>
          <div class="footer">
            <p>© 2025 FreelanceHub. All rights reserved.</p>
            <p>You're receiving this because you applied for a job on FreelanceHub.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  interviewScheduled: (freelancerName, jobTitle, scheduledDate, scheduledTime, meetingLink, duration) => ({
    subject: `🎉 Interview Scheduled - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .info-box strong { color: #667eea; }
          .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Interview Scheduled!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${freelancerName}</strong>,</p>
            <p>Great news! Your interview has been scheduled for <strong>${jobTitle}</strong>.</p>
            
            <div class="info-box">
              <strong>📅 Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
              <strong>🕐 Time:</strong> ${scheduledTime}<br>
              <strong>⏱️ Duration:</strong> ${duration}<br>
              <strong>🔗 Meeting Link:</strong> <a href="${meetingLink}" style="color: #667eea;">${meetingLink}</a>
            </div>

            <p><strong>📝 Tips for your interview:</strong></p>
            <ul style="color: #4b5563;">
              <li>Test your camera and microphone beforehand</li>
              <li>Join the meeting 5 minutes early</li>
              <li>Prepare questions about the role and company</li>
              <li>Have your portfolio/work samples ready to share</li>
            </ul>

            <p style="margin-top: 30px;">
              <a href="${meetingLink}" class="button">Join Meeting</a>
            </p>

            <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
              If you need to reschedule, please contact the company as soon as possible.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  applicationStatusChanged: (freelancerName, jobTitle, newStatus, message) => {
    const statusConfig = {
      qualified: { emoji: '✨', color: '#10b981', title: 'Application Qualified!' },
      'interview-scheduled': { emoji: '📅', color: '#6366f1', title: 'Interview Scheduled!' },
      'assignment-sent': { emoji: '🎯', color: '#f59e0b', title: 'Assignment Received!' },
      accepted: { emoji: '🎉', color: '#10b981', title: 'Congratulations!' },
      rejected: { emoji: '😔', color: '#ef4444', title: 'Application Update' },
      'auto-rejected': { emoji: '❌', color: '#ef4444', title: 'Application Update' },
    };

    const config = statusConfig[newStatus] || { emoji: '📢', color: '#6b7280', title: 'Status Update' };

    return {
      subject: `${config.emoji} ${config.title} - ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: ${config.color}; padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .status-badge { display: inline-block; padding: 10px 20px; background: ${config.color}20; color: ${config.color}; border-radius: 20px; font-weight: bold; margin: 20px 0; }
            .button { display: inline-block; background: ${config.color}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${config.emoji} ${config.title}</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${freelancerName}</strong>,</p>
              <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
              
              <center>
                <div class="status-badge">${newStatus.toUpperCase().replace(/-/g, ' ')}</div>
              </center>
              
              ${message ? `<p style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">${message}</p>` : ''}
              
              <center>
                <a href="${process.env.FRONTEND_URL}/freelancer-dashboard" class="button">View Dashboard</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2025 FreelanceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  companyNewApplication: (companyName, freelancerName, jobTitle, skillMatch) => ({
    subject: `🎯 New Application: ${freelancerName} applied for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .skill-match { text-align: center; margin: 25px 0; }
          .skill-score { font-size: 48px; font-weight: bold; color: ${skillMatch >= 75 ? '#10b981' : skillMatch >= 50 ? '#f59e0b' : '#ef4444'}; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Application Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${companyName}</strong>,</p>
            <p><strong>${freelancerName}</strong> has applied for your job posting: <strong>${jobTitle}</strong></p>
            
            <div class="skill-match">
              <p style="color: #6b7280; margin-bottom: 10px;">Skill Match Score</p>
              <div class="skill-score">${skillMatch}%</div>
              <p style="color: #6b7280; margin-top: 10px; font-size: 14px;">
                ${skillMatch >= 75 ? '🌟 Excellent Match!' : skillMatch >= 50 ? '✅ Good Match' : '⚠️ Partial Match'}
              </p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/company-dashboard" class="button">Review Application</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2025 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template) => {
  try {
    const info = await transporter.sendMail({
      from: `"FreelanceHub" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  transporter,
};