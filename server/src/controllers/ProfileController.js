// file path| server\src\controllers\ProfileController.js
// all of these would need authentiction for final product
const Volunteer = require('../models/VolunteerModel');
const VolunteerSkills = require('../models/VolunteerSkillsModel');

//(GETS)
// get all volunteers (admin use)
const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = Volunteer.getAllVolunteers();

        res.status(200).json({
            success: true,
            count: volunteers.length,
            data: volunteers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// get user profile with user id
const getProfile = async (req, res) => {
    try{
        // in final product the user_id should come from a token of some kind

        // mock userId - get a specific user
        const userId = req.query.user_id || 1;       // change the digit for testing
        const volunteer = Volunteer.getVolunteerWithUser_id(userId); // get a volunteers data

        // user doesnt exist error
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // get users skills
        const skills = VolunteerSkills.getVolunteerSkillsWithDetails(volunteer.Volunteer_id); // full details for a user
        const profileData = {
            ...volunteer,
            skills: skills // add skills array in addition to the rest of the user data.
        }

        res.status(200).json({
            success: true,
            data: profileData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Service error",
            error: error.message
        });
    }
};

//(POSTS)
// create a new user profile
const createProfile = async (req, res) => {
    try {
        const {
            full_name,
            phone_number,
            address_1,
            address_2,
            city,
            state,
            zip_code,
            skills,
            preferences,
            availability_days
        } = req.body;

        // Parse full name into first, middle, last
        const nameParts = full_name.trim().split(' ');
        const First_name = nameParts[0];
        const Last_name = nameParts[nameParts.length - 1];
        const Middle_name = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        // In real app, User_id would come from authenticated user
        const User_id = req.body.user_id || Math.floor(Math.random() * 1000); // Mock user ID

        // Check if profile already exists for this user
        const existingProfile = Volunteer.getVolunteerWithUser_id(User_id);
        if (existingProfile) {
            return res.status(400).json({
            success: false,
            message: 'Profile already exists for this user'
            });
        }

        // Create volunteer profile
        const volunteerData = {
            User_id,
            First_name,
            Middle_name,
            Last_name,
            phone_number,
            address_1,
            address_2: address_2 || '',
            city,
            state,
            zip_code,
            emergency_contact: req.body.emergency_contact || '',
            Skilled_volunteer: skills.length > 0, // Boolean based on skills
            Available_days: availability_days.join(','), // Convert array to comma-separated string
            Preferences: preferences || ''
        };

        const newVolunteer = Volunteer.createVolunteer(volunteerData); // new volunteer saved
        // save new users skill
        if (skills && skills.length > 0) {
            VolunteerSkills.replaceVolunteerSkills(newVolunteer.Volunteer_id, skills);
        }

        // create a complete profile (user details and their skills) to return
        const savedSkills = VolunteerSkills.getVolunteerSkillsWithDetails(newVolunteer.Volunteer_id);
        const completeProfile = {
            ...newVolunteer,
            skills: savedSkills
        };

        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: completeProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//(PUTS)
// Update volunteer profile
const updateProfile = async (req, res) => {
    try {
        // In real app, user_id comes from JWT or other type of token
        const userId = req.query.user_id || req.body.user_id || 1;

        const volunteer = Volunteer.getVolunteerWithUser_id(userId);

        if (!volunteer) {
            return res.status(404).json({
            success: false,
            message: 'Profile not found'
            });
        }

        const {
            full_name,
            phone_number,
            address_1,
            address_2,
            city,
            state,
            zip_code,
            skills,
            preferences,
            availability_days
        } = req.body;

        // Parse full name if provided
        let updates = {};

        if (full_name) {
            const nameParts = full_name.trim().split(' ');
            updates.First_name = nameParts[0];
            updates.Last_name = nameParts[nameParts.length - 1];
            updates.Middle_name = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
        }

        if (phone_number) updates.phone_number = phone_number;
        if (address_1) updates.address_1 = address_1;
        if (address_2 !== undefined) updates.address_2 = address_2;
        if (city) updates.city = city;
        if (state) updates.state = state;
        if (zip_code) updates.zip_code = zip_code;
        if (preferences !== undefined) updates.Preferences = preferences;
        if (skills) updates.Skilled_volunteer = skills.length > 0;
        if (availability_days) updates.Available_days = availability_days.join(',');

        // update user info
        const updatedVolunteer = Volunteer.updateVolunteer(volunteer.Volunteer_id, updates);

        // update user skills 
        if (skills !== undefined) {
            VolunteerSkills.replaceVolunteerSkills(volunteer.Volunteer_id, skills);
        }

        // create a complete profile of the update
        const savedSkills = VolunteerSkills.getVolunteerSkillsWithDetails(volunteer.Volunteer_id);
        const completeProfile = {
            ...updatedVolunteer,
            skills: savedSkills
        };

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: completeProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// (DELETE)
// delete a volunteer (admin use)
const deleteVolunteer = async (req, res) => {
    try {
        const { id } = req.params;

        VolunteerSkills.deleteAllVolunteerSkills(id); // delete skill(s)

        const deleted = Volunteer.deleteVolunteer(id); // delete user

        if (!deleted) {
            return res.status(404).json({
            success: false,
            message: 'Volunteer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Volunteer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    createProfile,
    updateProfile,
    getAllVolunteers,
    deleteVolunteer
};

