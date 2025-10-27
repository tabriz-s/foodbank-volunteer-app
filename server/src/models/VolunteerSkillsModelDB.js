const { getConnection } = require('../config/database');

//========================
// (GETS)
//=========================

// get all skills for a specififc volunteer
const getVolunteerSkills = async (volunteerId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT * FROM volunteer_skills WHERE Volunteer_id = ?`, 
            [volunteerId]
        );

        return rows;

    } catch (error) {
        console.error('Error getting skills belonging to Volunteer:', error);
        throw error;
    }
}

// Get volunteer skills WITH full skill details
const getVolunteerSkillsWithDetails = async (volunteerId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT
                vs.Volunteer_id,
                vs.Skills_id, 
                vs.Experience_level,
                vs.Date_acquired,
                s.Description,
                s.Category
            FROM volunteer_skills as vs
            INNER JOIN skills s ON vs.Skills_id = s.Skills_id
            WHERE vs.Volunteer_id = ?
            Order by s.Category, s.Description`,
            [volunteerId]
        );

        return rows;

    } catch (error) {
        console.error('Error getting skills and details of specififc Volunteer:', error);
        throw error;
    }
};

// check if a volunteer has a specific skill
const volunteerHasSkill = async (volunteerId, skillId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT * 
            FROM volunteer_skills 
            WHERE Volunteer_id = ? AND Skills_id = ?`,
            [volunteerId, skillId]
        );

        return rows.length > 0; // returns true if the skill exists

    } catch (error) {
        console.error('Error checking if volunteer has skill:', error);
        throw error;
    }
};

//=========================
// (POSTS)
//=========================

// add one skill to a volunteer
const addVolunteerSkill = async (volunteerId, skillId, experienceLevel, dateAcquired) => {
    try {
        const connection = await getConnection();

        const exists = await volunteerHasSkill(volunteerId, skillId); // check if skill already exists
        if (exists) {
            throw new Error('Volunteer already has this skill');
        }

        const [result] = await connection.query(
            `INSERT INTO volunteer_skills 
             (Volunteer_id, Skills_id, Experience_level, Date_acquired)
             VALUES (?, ?, ?, ?)`,
            [volunteerId, skillId, experienceLevel, dateAcquired]
        );

        return {
            Volunteer_id: volunteerId,
            Skills_id: skillId,
            Experience_level: experienceLevel,
            Date_acquired: dateAcquired
        };
    
    } catch (error) {
        console.error('Error adding skill to volunteer:', error);
        throw error
    }
};

// add multiple skils to a volunteer
const addMultipleSkills = async (volunteerId, skills) => {
    try {
        const connection = await getConnection();

        //skills are in an array of objects
        const values = skills.map(skill => [
            volunteerId,
            skill.skillId,
            skill.experienceLevel,
            skill.dateAcquired
        ]);

        // add skill(s)
        const [result] = await connection.query(
            `INSERT INTO volunteer_skills 
            (Volunteer_id, Skills_id, Experience_level, Date_acquired)
            VALUES ?`,
            [values]
        );

    } catch (error) {
        console.error('Error adding multiple skills to volunteer:', error);
        throw error;
    }
};

//=========================
// (PUTS)
//=========================

// Update Volunteer Skill 
const updateVolunteerSkill = async (volunteerId, skillsId, updates) => {
    try {
        const connection = await getConnection();

        // dyanmic update - update only what is sent
        const updateFields = [];
        const updateValues = [];

        // data to update
        if (updates.experienceLevel) {
            updateFields.push('Experience_level = ?');
            updateValues.push(updates.experienceLevel);
        }
        
        if (updates.dateAcquired) {
            updateFields.push('Date_acquired = ?');
            updateValues.push(updates.dateAcquired);
        }
        // nothing to update
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        updateValues.push(volunteerId, skillsId); // WHERE clause values

        const [result] = await connection.query(
            `UPDATE volunteer_skills
            SET ${updateFields.join(', ')}
            WHERE Volunteer_id = ? AND Skills_id = ?`,
            updateValues
        );

        //  skill not found to update
        if (result.affectedRows === 0) {
            throw new Error('Volunteer skill not found');
        }

        // testing purposes
        return { message: 'Skill updated successfully', affectedRows: result.affectedRows };

    } catch (error) {
        console.error('Error updating volunteer skill:', error);
        throw error;
    }
};

//=========================
// (DELETES)
//=========================

// Remove a one specific skill from a volunteer
const deleteVolunteerSkill = async (volunteerId, skillId) => {
    try {
        const connection = await getConnection();

        const [result] = await connection.query(
            `DELETE FROM volunteer_skills 
            WHERE Volunteer_id = ? AND Skills_id = ?`,
            [volunteerId, skillId]
        );

        // skill not found to delete
        if (result.affectedRows === 0) {
            throw new Error('Volunteer skill not found');
        }

        return { message: 'Skill removed successfully', affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error deleting volunteer skill:', error);
        throw error;
    }
};

// Remove All Skills from a volunteer
const deleteAllVolunteerSkills = async (volunteerId) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            `DELETE FROM volunteer_skills WHERE Volunteer_id = ?`,
            [volunteerId]
        );
        
        return { message: 'All skills removed', affectedRows: result.affectedRows };

    } catch (error) {
        console.error('Error deleting all volunteer skills:', error);
        throw error;
    }
};

// ============================================

module.exports = {
    // GET
    getVolunteerSkills,
    getVolunteerSkillsWithDetails,
    volunteerHasSkill,
    
    // POST
    addVolunteerSkill,
    addMultipleSkills,
    
    // PUT
    updateVolunteerSkill,
    
    // DELETE
    deleteVolunteerSkill,
    deleteAllVolunteerSkills
};