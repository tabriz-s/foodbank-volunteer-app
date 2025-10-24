const { getConnection } = require('../config/database');

// ============================================
// GET OPERATIONS
// ============================================

// Get all volunteers from database
const getAllVolunteers = async () => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM volunteers');
        return rows;

    } catch (error) {
        console.error('Error getting all volunteers:', error);
        throw error;
    }
};

// Get volunteer by volunteer_id
const getVolunteerById = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM volunteers WHERE Volunteer_id = ?',
            [volunteer_id]
        );

        return rows[0];

    } catch (error) {
        console.error('Error getting volunteer by id:', error);
        throw error;
    }
};

// Get volunteer by user_id (for login/profile lookup)
const getVolunteerWithUser_id = async (user_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM volunteers WHERE User_id = ?',
            [user_id]
        );

        return rows[0];

    } catch (error) {
        console.error('Error getting volunteer by user_id:', error);
        throw error;
    }
};

// Check if volunteer exists by volunteer_id
const volunteerExists = async (volunteer_id) => {
    try {
        const volunteer = await getVolunteerById(volunteer_id);
        return !!volunteer;  // Returns true if exists, false if not

    } catch (error) {
        console.error('Error checking volunteer existence:', error);
        return false;
    }
};

// Check if user_id already has a volunteer profile
const userHasProfile = async (user_id) => {
    try {
        const volunteer = await getVolunteerWithUser_id(user_id);
        return !!volunteer;

    } catch (error) {
        console.error('Error checking if user has profile:', error);
        return false;
    }
};

// ============================================
// POST OPERATIONS
// ============================================

// Create new volunteer profile
const createVolunteer = async (volunteerData) => {
    try {
        const connection = await getConnection();

        // check if user already has a profile
        const exists = await userHasProfile(volunteerData.User_id);
        if (exists) {
            throw new Error('User already has a volunteer profile');
        }

        // query
        const [result] = await connection.query(
            `INSERT INTO volunteers 
            (User_id, First_name, Middle_name, Last_name, Address_1, Address_2, 
            City, State, Zip_code, Skilled_volunteer, Phone_number, 
            emergency_contact, Available_days, Preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                volunteerData.User_id,
                volunteerData.First_name,
                volunteerData.Middle_name || null,
                volunteerData.Last_name,
                volunteerData.Address_1,
                volunteerData.Address_2 || null,
                volunteerData.City,
                volunteerData.State,
                volunteerData.Zip_code,
                volunteerData.Skilled_volunteer || 0,
                volunteerData.Phone_number,
                volunteerData.emergency_contact || null,
                volunteerData.Available_days,
                volunteerData.Preferences || null
            ]
        );

        // Return the created volunteer with new ID
        return await getVolunteerById(result.insertId);

    } catch (error) {
        console.error('Error creating volunteer:', error);
        throw error;
    }
};

// ============================================
// PUT OPERATIONS
// ============================================

// Update volunteer profile
const updateVolunteer = async (volunteer_id, updates) => {
    try {
        const connection = await getConnection();
        
        // Build dynamic - update only whats sent
        const updateFields = [];
        const updateValues = [];
        
        // List of allowed fields to update
        const allowedFields = [
            'First_name', 'Middle_name', 'Last_name', 
            'Address_1', 'Address_2', 'City', 'State', 'Zip_code',
            'Phone_number', 'emergency_contact', 'Available_days', 
            'Preferences', 'Skilled_volunteer'
        ];
        
        // Build SET clause dynamically
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updates[field]);
            }
        });
        
        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        // WHERE clause value
        updateValues.push(volunteer_id);
        
        const [result] = await connection.query(
            `UPDATE volunteers 
             SET ${updateFields.join(', ')}
             WHERE Volunteer_id = ?`,
            updateValues
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Volunteer not found');
        }
        
        // Return updated volunteer
        return await getVolunteerById(volunteer_id);

    } catch (error) {
        console.error('Error updating volunteer:', error);
        throw error;
    }
};

// Update volunteer by user_id (for profile updates)
const updateVolunteerByUserId = async (user_id, updates) => {
    try {
        const volunteer = await getVolunteerWithUser_id(user_id);
        
        if (!volunteer) {
            throw new Error('Volunteer profile not found for this user');
        }
        
        return await updateVolunteer(volunteer.Volunteer_id, updates);
    } catch (error) {
        console.error('Error updating volunteer by user_id:', error);
        throw error;
    }
};

// ============================================
// DELETE OPERATIONS
// ============================================

// Delete volunteer profile (soft delete - just for reference, not implemented)
const deleteVolunteer = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        
        // Note: This will fail if volunteer has foreign key references
        // (volunteer_skills, volunteer_history, etc.)
        // Consider implementing soft delete instead
        
        const [result] = await connection.query(
            'DELETE FROM volunteers WHERE Volunteer_id = ?',
            [volunteer_id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Volunteer not found');
        }
        
        return { message: 'Volunteer deleted successfully', affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        throw error;
    }
};

// ============================================

module.exports = {
    // GET
    getAllVolunteers,
    getVolunteerById,
    getVolunteerWithUser_id,
    volunteerExists,
    userHasProfile,
    
    // POST
    createVolunteer,
    
    // PUT
    updateVolunteer,
    updateVolunteerByUserId,
    
    // DELETE
    deleteVolunteer
};