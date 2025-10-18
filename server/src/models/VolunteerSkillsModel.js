// mock data for the combination of volunteer and skill data.  This simulates joining tables

let volunteerSkills = [
    // Michaels Pearsons Skills
    { Volunteer_id: 1, Skills_id: 1, Experience_level: 'intermediate', Date_acquired: '2023-01-15' },
    { Volunteer_id: 1, Skills_id: 3, Experience_level: 'beginner', Date_acquired: '2023-03-20' },
    { Volunteer_id: 1, Skills_id: 7, Experience_level: 'intermediate', Date_acquired: '2022-11-10' },

    // Raymond Smith's skills
    { Volunteer_id: 2, Skills_id: 5, Experience_level: 'expert', Date_acquired: '2022-06-10' },
    { Volunteer_id: 2, Skills_id: 6, Experience_level: 'expert', Date_acquired: '2022-06-10' },
    { Volunteer_id: 2, Skills_id: 9, Experience_level: 'intermediate', Date_acquired: '2023-08-15' }
];

/* (GETS) */
// Get all skills for a specific volunteer (returns junction table data only)
const getVolunteerSkills = (volunteerId) => {
    return volunteerSkills.filter(vs => vs.Volunteer_id === parseInt(volunteerId));
};

// Get volunteer skills WITH full skill details (simulates JOIN)
const getVolunteerSkillsWithDetails = (volunteerId) => {
    const Skills = require('./SkillsModel'); // Import to access skills data
    
    const volunteerSkillsData = volunteerSkills.filter(vs => vs.Volunteer_id === parseInt(volunteerId));
    
    // Manually join with SKILLS table
    return volunteerSkillsData.map(vs => {
        const skillDetails = Skills.getSkillById(vs.Skills_id);
        return {
            Volunteer_id: vs.Volunteer_id,
            Skills_id: vs.Skills_id,
            Experience_level: vs.Experience_level,
            Date_acquired: vs.Date_acquired,
            Description: skillDetails?.Description || '',
            Category: skillDetails?.Category || ''
        };
    });
};

// (POSTS)
// Add a skill to a volunteer
const addVolunteerSkill = (volunteerId, skillId, experienceLevel, dateAcquired) => {
    const newSkill = {
        Volunteer_id: parseInt(volunteerId),
        Skills_id: parseInt(skillId),
        Experience_level: experienceLevel,
        Date_acquired: dateAcquired
    };
    
    volunteerSkills.push(newSkill);
    return newSkill;
};

// (PUTS)
// Replace all skills for a volunteer (easier for profile updates)
const replaceVolunteerSkills = (volunteerId, skillsArray) => {
    
    // Remove all existing skills for this volunteer
    deleteAllVolunteerSkills(volunteerId);
    
    // Add new skills
    skillsArray.forEach(skill => {
        addVolunteerSkill(
            volunteerId,
            skill.Skills_id,
            skill.Experience_level,
            skill.Date_acquired
        );
    });
    
    return getVolunteerSkills(volunteerId);
};

// (DELETES)
// Delete a specific skill from a volunteer
const deleteVolunteerSkill = (volunteerId, skillId) => {
    const index = volunteerSkills.findIndex(
        vs => vs.Volunteer_id === parseInt(volunteerId) && vs.Skills_id === parseInt(skillId)
    );
    
    if (index === -1) return false;
    
    volunteerSkills.splice(index, 1);
    return true;
};

// Delete ALL skills for a volunteer
const deleteAllVolunteerSkills = (volunteerId) => {
    volunteerSkills = volunteerSkills.filter(vs => vs.Volunteer_id !== parseInt(volunteerId));
    return true;
};


// Check if a volunteer has a specific skill
const hasSkill = (volunteerId, skillId) => {
    return volunteerSkills.some(
        vs => vs.Volunteer_id === parseInt(volunteerId) && vs.Skills_id === parseInt(skillId)
    );
};

module.exports = {
    getVolunteerSkills,
    getVolunteerSkillsWithDetails,
    addVolunteerSkill,
    replaceVolunteerSkills,
    deleteVolunteerSkill,
    deleteAllVolunteerSkills,
    hasSkill
};