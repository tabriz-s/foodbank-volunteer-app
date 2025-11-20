const VolunteerDB = require('../models/VolunteerModelDB');
const VolunteerSkillsDB = require('../models/VolunteerSkillsModelDB');

// GET all volunteers from database
const getAllVolunteersDB = async (req, res) => {
    try {
        const volunteers = await VolunteerDB.getAllVolunteers();
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: volunteers.length,
            data: volunteers
        });
    } catch (error) {
        console.error('Error in getAllVolunteersDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve volunteers from database',
            error: error.message
        });
    }
};

// GET volunteer profile by user_id
const getProfileDB = async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }
        
        const volunteer = await VolunteerDB.getVolunteerWithUser_id(user_id);
        
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer profile not found in database'
            });
        }

        // Get volunteer skills
        try {
            const skills = await VolunteerSkillsDB.getVolunteerSkillsWithDetails(volunteer.Volunteer_id);
            volunteer.skills = skills || [];  // Add skills to volunteer object
        } catch (skillError) {
            console.error('Error fetching skills:', skillError);
            volunteer.skills = [];  // If error, just set empty array
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: volunteer
        });
    } catch (error) {
        console.error('Error in getProfileDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile from database',
            error: error.message
        });
    }
};

// GET volunteer by volunteer_id
const getVolunteerByIdDB = async (req, res) => {
    try {
        const volunteer = await VolunteerDB.getVolunteerById(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found in database'
            });
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: volunteer
        });
    } catch (error) {
        console.error('Error in getVolunteerByIdDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve volunteer from database',
            error: error.message
        });
    }
};

//ADDING
// GET volunteer by user_id (for AuthContext to fetch volunteer_id)
const getVolunteerByUserIdDB = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }
        
        const volunteer = await VolunteerDB.getVolunteerWithUser_id(user_id);
        
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer profile not found for this user'
            });
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            volunteer: volunteer
        });
    } catch (error) {
        console.error('Error in getVolunteerByUserIdDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve volunteer profile',
            error: error.message
        });
    }
};


// POST - Create new volunteer profile
const createProfileDB = async (req, res) => {
    try {
        // Transform frontend field names to database field names
        const [firstName, ...rest] = req.body.full_name.split(' ');
        const lastName = rest.pop() || '';
        const middleName = rest.join(' ') || null;
        
        const volunteerData = {
            User_id: req.body.user_id,
            First_name: firstName,
            Middle_name: middleName,
            Last_name: lastName,
            Address_1: req.body.address_1,
            Address_2: req.body.address_2 || null,
            City: req.body.city,
            State: req.body.state.toUpperCase(),
            Zip_code: req.body.zip_code,
            Phone_number: req.body.phone_number,
            emergency_contact: req.body.emergency_contact || null,
            Available_days: req.body.availability_days.join(','),
            Preferences: req.body.preferences || null,
            Skilled_volunteer: req.body.skills && req.body.skills.length > 0 ? 1 : 0
        };
        
        // Create volunteer profile
        const volunteer = await VolunteerDB.createVolunteer(volunteerData);
        
        // Add skills to volunteer_skills table
        if (req.body.skills && req.body.skills.length > 0) {
            const skillsData = req.body.skills.map(skill => ({
                skillId: skill.Skills_id,
                experienceLevel: skill.Experience_level,
                dateAcquired: skill.Date_acquired
            }));
            
            await VolunteerSkillsDB.addMultipleSkills(volunteer.Volunteer_id, skillsData);
        }
        
        res.status(201).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Volunteer profile created successfully',
            data: volunteer
        });

    } catch (error) {
        console.error('Error in createProfileDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create profile in database',
            error: error.message
        });
    }
};

// PUT - Update volunteer profile
const updateProfileDB = async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }
        
        // Transform frontend field names to database field names
        const updates = {};
        
        // Handle full_name (split into First, Middle, Last)
        if (req.body.full_name) {
            const nameParts = req.body.full_name.trim().split(/\s+/);
            if (nameParts.length === 1) {
                updates.First_name = nameParts[0];
                updates.Last_name = '';
            } else if (nameParts.length === 2) {
                updates.First_name = nameParts[0];
                updates.Last_name = nameParts[1];
            } else {
                updates.First_name = nameParts[0];
                updates.Middle_name = nameParts.slice(1, -1).join(' ');
                updates.Last_name = nameParts[nameParts.length - 1];
            }
        }
        
        // Transform other fields (lowercase to uppercase)
        if (req.body.address_1 !== undefined) updates.Address_1 = req.body.address_1;
        if (req.body.address_2 !== undefined) updates.Address_2 = req.body.address_2;
        if (req.body.city !== undefined) updates.City = req.body.city;
        if (req.body.state !== undefined) updates.State = req.body.state.toUpperCase();
        if (req.body.zip_code !== undefined) updates.Zip_code = req.body.zip_code;
        if (req.body.phone_number !== undefined) updates.Phone_number = req.body.phone_number;
        if (req.body.emergency_contact !== undefined) updates.emergency_contact = req.body.emergency_contact;
        if (req.body.preferences !== undefined) updates.Preferences = req.body.preferences;
        
        // Transform availability_days (array to comma-separated string)
        if (req.body.availability_days !== undefined) {
            updates.Available_days = Array.isArray(req.body.availability_days) 
                ? req.body.availability_days.join(',') 
                : req.body.availability_days;
        }
        
        // Transform skills (array to boolean)
        if (req.body.skills !== undefined) {
            updates.Skilled_volunteer = Array.isArray(req.body.skills) && req.body.skills.length > 0 ? 1 : 0;
        }
        
        console.log('🔄 Original request body:', req.body);
        console.log('🔄 Transformed updates:', updates);
        
        // Update volunteer profile
        const volunteer = await VolunteerDB.updateVolunteerByUserId(user_id, updates);
        
        // Update skills if provided
        if (req.body.skills !== undefined && Array.isArray(req.body.skills)) {
            // Delete existing skills
            await VolunteerSkillsDB.deleteAllVolunteerSkills(volunteer.Volunteer_id);
            
            // Add new skills
            if (req.body.skills.length > 0) {
                const skillsData = req.body.skills.map(skill => ({
                    skillId: skill.Skills_id,
                    experienceLevel: skill.Experience_level,
                    dateAcquired: skill.Date_acquired
                }));
                
                await VolunteerSkillsDB.addMultipleSkills(volunteer.Volunteer_id, skillsData);
            }
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Profile updated successfully',
            data: volunteer
        });
    } catch (error) {
        console.error('Error in updateProfileDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile in database',
            error: error.message
        });
    }
};

module.exports = {
    getAllVolunteersDB,
    getProfileDB,
    getVolunteerByIdDB,
    getVolunteerByUserIdDB,  // ADDING THIS LINE
    createProfileDB,
    updateProfileDB
};