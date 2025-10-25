const VolunteerDB = require('../models/VolunteerModelDB');

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

// POST - Create new volunteer profile
const createProfileDB = async (req, res) => {
    try {
        const volunteer = await VolunteerDB.createVolunteer(req.body);
        
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
        
        const volunteer = await VolunteerDB.updateVolunteerByUserId(user_id, req.body);
        
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
    createProfileDB,
    updateProfileDB
};