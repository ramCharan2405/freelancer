const { GoogleGenerativeAI } = require("@google/generative-ai");
const Freelancer = require("../models/Freelancer");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getUserContext = async (userId, userRole) => {
    try {
        let context = "";

        if (userRole === "freelancer") {
            const freelancer = await Freelancer.findOne({ user: userId })
                .populate("user", "fullName email")
                .lean();

            if (freelancer) {
                context = `
User Profile:
- Name: ${freelancer.user?.fullName || "N/A"}
- Email: ${freelancer.user?.email || "N/A"}
- Role: Freelancer
- Skills: ${freelancer.skills?.join(", ") || "Not specified"}
- Experience: ${freelancer.experience || "Not specified"}
- Hourly Rate: $${freelancer.hourlyRate || "Not set"}
- Bio: ${freelancer.bio || "No bio provided"}
- Location: ${freelancer.location || "Not specified"}
- Portfolio: ${freelancer.portfolio || "No portfolio"}
- Rating: ${freelancer.rating || 0}/5
`;

                const applications = await Application.find({ freelancerId: freelancer._id })
                    .populate("jobId", "title company")
                    .limit(5)
                    .lean();

                if (applications.length > 0) {
                    context += `\nRecent Applications (${applications.length}):\n`;
                    applications.forEach((app, index) => {
                        context += `${index + 1}. ${app.jobId?.title || "N/A"} - Status: ${app.status}\n`;
                    });
                }

                if (freelancer.skills && freelancer.skills.length > 0) {
                    const matchingJobs = await Job.find({
                        requiredSkills: { $in: freelancer.skills },
                        status: 'open'
                    })
                        .limit(5)
                        .select('title budget jobType requiredSkills')
                        .lean();

                    if (matchingJobs.length > 0) {
                        context += `\nMatching Available Jobs (${matchingJobs.length}):\n`;
                        matchingJobs.forEach((job, index) => {
                            context += `${index + 1}. ${job.title} - ${job.jobType} - Budget: $${job.budget}\n`;
                            context += `   Required Skills: ${job.requiredSkills?.join(", ")}\n`;
                        });
                    }
                }
            }
        } else if (userRole === "company") {
            const company = await Company.findOne({ user: userId })
                .populate("user", "fullName email")
                .lean();

            if (company) {
                context = `
User Profile:
- Company Name: ${company.companyName || company.organization || "N/A"}
- Email: ${company.user?.email || "N/A"}
- Role: Company/Employer
- Industry: ${company.industry || "Not specified"}
- Location: ${company.location || "Not specified"}
- Website: ${company.website || "No website"}
- Description: ${company.description || "No description"}
`;

                const jobs = await Job.find({ company: company._id })
                    .limit(5)
                    .lean();

                if (jobs.length > 0) {
                    context += `\nPosted Jobs (${jobs.length}):\n`;
                    jobs.forEach((job, index) => {
                        context += `${index + 1}. ${job.title} - ${job.jobType} - Budget: $${job.budget} - Status: ${job.status || 'open'}\n`;
                    });
                }

                const applications = await Application.find({ companyId: company._id }).countDocuments();
                context += `\nTotal Applications Received: ${applications}\n`;
            }
        }

        return context;
    } catch (error) {
        return "";
    }
};

exports.chatWithAI = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        let userContext = "";
        try {
            userContext = await getUserContext(userId, userRole);
        } catch (contextError) {
            // Optionally log contextError
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash" //  Updated model name
        });

        let systemPrompt = `You are an intelligent assistant for a freelancing platform. You help both freelancers and companies with their needs.

Your role is to:
1. Help freelancers find jobs, improve their profiles, and manage applications
2. Help companies post jobs, find talent, and manage applications
3. Answer questions about the platform, web development, skills, career advice
4. Provide personalized recommendations when user data is available
5. Be friendly, professional, and helpful

Important guidelines:
- Answer general questions about web development, programming, skills, and career advice
- When user context is available, provide personalized responses
- If user asks about their specific data and it's not available, politely inform them
- Keep responses concise but informative (2-3 paragraphs max)
- Use bullet points for lists
- Be encouraging and supportive
`;

        if (userContext && userContext.trim() !== "") {
            systemPrompt += `\n\n${userContext}\n`;
            systemPrompt += `\nUse the above user data to provide personalized responses when relevant.`;
        } else {
            systemPrompt += `\n\nNote: User-specific data is not available. Provide general helpful responses.`;
        }

        systemPrompt += `\n\nCurrent conversation:`;

        let conversationContext = systemPrompt + "\n\n";
        const recentHistory = conversationHistory.slice(-8);
        recentHistory.forEach((msg) => {
            conversationContext += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
        });

        conversationContext += `User: ${message}\nAssistant:`;

        let aiMessage = "";
        try {
            const result = await model.generateContent(conversationContext);
            const response = await result.response;
            aiMessage = response.text();
        } catch (apiError) {
            aiMessage = `I apologize, but I'm having trouble connecting to my AI service right now. However, I can still help you! 

If you're asking about:
- **Web Development Skills**: Focus on HTML, CSS, JavaScript, React, Node.js, databases (MongoDB/PostgreSQL)
- **Finding Jobs**: Check the Jobs page to browse available opportunities
- **Your Applications**: Visit "My Applications" to see your application status
- **Profile Help**: A complete profile with skills, portfolio, and experience increases your chances
- **Platform Navigation**: Use the navigation menu to explore different sections

Could you please rephrase your question, and I'll do my best to assist you?`;
        }

        res.json({
            success: true,
            message: aiMessage,
            timestamp: new Date(),
        });

    } catch (error) {
        let errorMessage = "I'm having trouble processing your request right now.";

        if (error.message?.includes("API key")) {
            errorMessage = "AI service configuration issue. Please contact support.";
        } else if (error.message?.includes("quota")) {
            errorMessage = "AI service is temporarily unavailable. Please try again shortly.";
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

exports.getSuggestedQuestions = async (req, res) => {
    try {
        const userRole = req.user.role;

        const suggestions = {
            freelancer: [
                "What jobs match my skills?",
                "How can I improve my profile?",
                "What's the status of my applications?",
                "Best skills for web development in 2024",
                "How to set competitive hourly rates?",
            ],
            company: [
                "What's the status of my job postings?",
                "How to find the best freelancers?",
                "Tips for writing better job descriptions",
                "What skills should I look for in developers?",
                "How to evaluate freelancer portfolios?",
            ],
        };

        res.json({
            success: true,
            suggestions: suggestions[userRole] || suggestions.freelancer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get suggestions",
        });
    }
};
