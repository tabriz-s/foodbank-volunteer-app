const { getConnection } = require('../config/database');

// Get op

// Get all events from database
const getAllEvents = async () => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM events ORDER BY Date DESC');
        return rows;
    } catch (error) {
        console.error('Error getting all events:', error);
        throw error;
    }
};

// Get event by Event_id
const getEventById = async (eventId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM events WHERE Event_id = ?',
            [eventId]
        );
        return rows[0];
    } catch (error) {
        console.error('Error getting event by id:', error);
        throw error;
    }
};

// Get event with skills from junction table
const getEventWithSkills = async (eventId) => {
    try {
        const connection = await getConnection();
        
        // Get the event
        const [eventRows] = await connection.query(
            'SELECT * FROM events WHERE Event_id = ?',
            [eventId]
        );
        
        if (eventRows.length === 0) return null;
        
        const event = eventRows[0];
        
        // Get skills for this event from junction table
        const [skillRows] = await connection.query(
            `SELECT es.Skills_id, es.Is_required, es.Needed_count, s.Description 
             FROM event_skills es
             JOIN skills s ON es.Skills_id = s.Skills_id
             WHERE es.Event_id = ?`,
            [eventId]
        );
        
        // Add skills array to event
        event.skills = skillRows.map(row => ({
            skillId: row.Skills_id, 
            description: row.Description,
            isRequired: row.Is_required,
            neededCount: row.Needed_count
        }));
        
        return event;
    } catch (error) {
        console.error('Error getting event with skills:', error);
        throw error;
    }
};

// Get all events with their skills
const getAllEventsWithSkills = async () => {
    try {
        const connection = await getConnection();
        
        // Get all events
        const [events] = await connection.query('SELECT * FROM events ORDER BY Date DESC');
        
        // For each event get its skills
        for (let event of events) {
            const [skillRows] = await connection.query(
                `SELECT es.Skills_id, es.Is_required, es.Needed_count, s.Description 
                 FROM event_skills es
                 JOIN skills s ON es.Skills_id = s.Skills_id
                 WHERE es.Event_id = ?`,
                [event.Event_id]
            );
            
            event.skills = skillRows.map(row => ({
                skillId: row.Skills_id,  // Changed from Skill_id
                description: row.Description,
                isRequired: row.Is_required,
                neededCount: row.Needed_count
            }));
        }
        
        return events;
    } catch (error) {
        console.error('Error getting all events with skills:', error);
        throw error;
    }
};

// Get events by status
const getEventsByStatus = async (status) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM events WHERE Status = ? ORDER BY Date DESC',
            [status]
        );
        return rows;
    } catch (error) {
        console.error('Error getting events by status:', error);
        throw error;
    }
};

// Get events by urgency
const getEventsByUrgency = async (urgency) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM events WHERE Urgency = ? ORDER BY Date DESC',
            [urgency]
        );
        return rows;
    } catch (error) {
        console.error('Error getting events by urgency:', error);
        throw error;
    }
};

// Get upcoming events (future dates only)
const getUpcomingEvents = async () => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT * FROM events 
             WHERE Date >= CURDATE() 
             AND Status IN ('planned', 'active')
             ORDER BY Date ASC, Start_time ASC`
        );
        return rows;
    } catch (error) {
        console.error('Error getting upcoming events:', error);
        throw error;
    }
};

// Check if event exists by Event_id
const eventExists = async (eventId) => {
    try {
        const event = await getEventById(eventId);
        return !!event;
    } catch (error) {
        console.error('Error checking event existence:', error);
        return false;
    }
};

// Count events by status
const countEventsByStatus = async (status) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT COUNT(*) as count FROM events WHERE Status = ?',
            [status]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error counting events by status:', error);
        throw error;
    }
};

// Count total events
const countTotalEvents = async () => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM events');
        return rows[0].count;
    } catch (error) {
        console.error('Error counting total events:', error);
        throw error;
    }
};

// Add skills to an event (called after creating event)
const addSkillsToEvent = async (eventId, skills) => {
    try {
        const connection = await getConnection();
        
        for (let skill of skills) {
            await connection.query(
                `INSERT INTO event_skills (Event_id, Skills_id, Is_required, Needed_count)
                 VALUES (?, ?, ?, ?)`,
                [eventId, skill.skillId, skill.isRequired || true, skill.neededCount || 1]
            );
        }
        
        return true;
    } catch (error) {
        console.error('Error adding skills to event:', error);
        throw error;
    }
};

// Update event skills (delete old ones and add new ones)
const updateEventSkills = async (eventId, skills) => {
    try {
        const connection = await getConnection();
        
        // Delete existing skills for this event
        await connection.query('DELETE FROM event_skills WHERE Event_id = ?', [eventId]);
        
        // Add new skills
        if (skills && skills.length > 0) {
            await addSkillsToEvent(eventId, skills);
        }
        
        return true;
    } catch (error) {
        console.error('Error updating event skills:', error);
        throw error;
    }
};

// Create new event
const createEvent = async (eventData) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO events 
            (Event_name, Event_type, Description, Location_id, Location, 
            Date, Start_time, end_time, Max_capacity, Skill_needed, 
            Urgency, Status, Created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eventData.Event_name,
                eventData.Event_type || null,
                eventData.Description,
                eventData.Location_id || null,
                eventData.Location,
                eventData.Date,
                eventData.Start_time || null,
                eventData.end_time || null,
                eventData.Max_capacity || null,
                eventData.Skill_needed || null,
                eventData.Urgency,
                eventData.Status || 'planned',
                eventData.Created_by || null
            ]
        );
        
        // Return the created event with new ID
        return await getEventById(result.insertId);
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Update event
const updateEvent = async (eventId, updates) => {
    try {
        const connection = await getConnection();
        
        // Build dynamic update query - update only what's sent
        const updateFields = [];
        const updateValues = [];
        
        // List of allowed fields to update
        const allowedFields = [
            'Event_name', 'Event_type', 'Description', 'Location_id', 'Location',
            'Date', 'Start_time', 'end_time', 'Max_capacity', 'Skill_needed',
            'Urgency', 'Status', 'Created_by'
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
        
        // Add event ID for WHERE clause
        updateValues.push(eventId);
        
        const [result] = await connection.query(
            `UPDATE events 
             SET ${updateFields.join(', ')}
             WHERE Event_id = ?`,
            updateValues
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Event not found');
        }
        
        // Return updated event
        return await getEventById(eventId);
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

// Delete event
const deleteEvent = async (eventId) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            'DELETE FROM events WHERE Event_id = ?',
            [eventId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Event not found');
        }
        
        return { message: 'Event deleted successfully', affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

module.exports = {
    // GET
    getAllEvents,
    getEventById,
    getEventWithSkills,
    getAllEventsWithSkills, 
    getEventsByStatus,
    getEventsByUrgency,
    getUpcomingEvents,
    eventExists,
    countEventsByStatus,
    countTotalEvents,
    
    // POST
    createEvent,
    addSkillsToEvent, 
    
    // PUT
    updateEvent,
    updateEventSkills,
    
    // DELETE
    deleteEvent
};