// backend/utils/skillMatcher.js - NEW FILE
const calculateSkillMatch = (freelancerSkills, jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) {
        return {
            matchScore: 100,
            matchedSkills: [],
            missingSkills: [],
            shouldAutoReject: false,
            reason: 'No specific skills required for this job'
        };
    }

    if (!freelancerSkills || freelancerSkills.length === 0) {
        return {
            matchScore: 0,
            matchedSkills: [],
            missingSkills: jobSkills,
            shouldAutoReject: true,
            reason: 'No skills listed in your profile'
        };
    }

    // Normalize skills (lowercase, trim)
    const normalizeSkill = (skill) => skill.toLowerCase().trim();
    const normalizedFreelancerSkills = freelancerSkills.map(normalizeSkill);
    const normalizedJobSkills = jobSkills.map(normalizeSkill);

    // Find matched and missing skills
    const matchedSkills = normalizedJobSkills.filter(skill =>
        normalizedFreelancerSkills.includes(skill)
    );

    const missingSkills = normalizedJobSkills.filter(skill =>
        !normalizedFreelancerSkills.includes(skill)
    );

    // Calculate match percentage
    const matchScore = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);

    // Auto-rejection logic
    const shouldAutoReject = matchScore < 50; // Less than 50% match
    let reason = '';

    if (shouldAutoReject) {
        reason = `Your skill match is ${matchScore}%. This job requires: ${jobSkills.join(', ')}. You're missing: ${missingSkills.join(', ')}. Please apply for jobs that better match your skills.`;
    }

    return {
        matchScore,
        matchedSkills: jobSkills.filter(skill =>
            normalizedFreelancerSkills.includes(normalizeSkill(skill))
        ),
        missingSkills: jobSkills.filter(skill =>
            !normalizedFreelancerSkills.includes(normalizeSkill(skill))
        ),
        shouldAutoReject,
        reason
    };
};

module.exports = { calculateSkillMatch };