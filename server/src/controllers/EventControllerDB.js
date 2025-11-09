const EventDB = require('../models/EventModelDB');

// GET all events from database
// GET all events with skills
const getAllEventsDB = async (req, res) => {
    try {
        const events = await EventDB.getAllEventsWithSkills();
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getAllEventsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve events from database',
            error: error.message
        });
    }
};

// GET single event by ID from database
const getEventByIdDB = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await EventDB.getEventById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found in database'
            });
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: event
        });
    } catch (error) {
        console.error('Error in getEventByIdDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve event from database',
            error: error.message
        });
    }
};

// GET events by status from database
const getEventsByStatusDB = async (req, res) => {
    try {
        const { status } = req.query;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status parameter is required'
            });
        }
        
        const events = await EventDB.getEventsByStatus(status);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getEventsByStatusDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve events by status from database',
            error: error.message
        });
    }
};

// GET events by urgency from database
const getEventsByUrgencyDB = async (req, res) => {
    try {
        const { urgency } = req.query;
        
        if (!urgency) {
            return res.status(400).json({
                success: false,
                message: 'Urgency parameter is required'
            });
        }
        
        const events = await EventDB.getEventsByUrgency(urgency);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getEventsByUrgencyDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve events by urgency from database',
            error: error.message
        });
    }
};

// GET upcoming events from database
const getUpcomingEventsDB = async (req, res) => {
    try {
        const events = await EventDB.getUpcomingEvents();
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getUpcomingEventsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve upcoming events from database',
            error: error.message
        });
    }
};


// POST - Create new event in database
// POST - Create new event with skills in junction table
const createEventDB = async (req, res) => {
    try {
        // Transform frontend field names to database field names
        const eventData = {
            Event_name: req.body.name,
            Event_type: req.body.event_type || null,
            Description: req.body.description,
            Location_id: req.body.location_id || null,
            Location: req.body.location,
            Date: req.body.date,
            Start_time: req.body.start_time || null,
            end_time: req.body.end_time || null,
            Max_capacity: req.body.max_capacity || null,
            Skill_needed: null, // Don't use this field anymore
            Urgency: req.body.urgency,
            Status: req.body.status || 'planned',
            Created_by: req.body.created_by || 1
        };
        
        // Create event
        const event = await EventDB.createEvent(eventData);
        
        // Add skills to junction table if provided
        // This part already exists in your createEventDB - just verify it looks like this:
if (req.body.requiredSkills && req.body.requiredSkills.length > 0) {
    const skills = req.body.requiredSkills.map(skill => {
        // Handle both formats: {skillId: 1, neededCount: 5} or just the number 1
        if (typeof skill === 'object') {
            return {
                skillId: skill.skillId,
                isRequired: skill.isRequired !== undefined ? skill.isRequired : true,
                neededCount: skill.neededCount || 1
            };
        } else {
            return {
                skillId: skill,
                isRequired: true,
                neededCount: 1
            };
        }
    });
    
    await EventDB.addSkillsToEvent(event.Event_id, skills);
}
        
        // Get the event with skills to return
        const eventWithSkills = await EventDB.getEventWithSkills(event.Event_id);
        
        res.status(201).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Event created successfully',
            data: eventWithSkills
        });
    } catch (error) {
        console.error('Error in createEventDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event in database',
            error: error.message
        });
    }
};

// PUT - Update event and skills in database
const updateEventDB = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if event exists
        const exists = await EventDB.eventExists(id);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Event not found in database'
            });
        }
        
        // Transform frontend field names to database field names
        const updates = {};
        
        if (req.body.name !== undefined) updates.Event_name = req.body.name;
        if (req.body.event_type !== undefined) updates.Event_type = req.body.event_type;
        if (req.body.description !== undefined) updates.Description = req.body.description;
        if (req.body.location_id !== undefined) updates.Location_id = req.body.location_id;
        if (req.body.location !== undefined) updates.Location = req.body.location;
        if (req.body.date !== undefined) updates.Date = req.body.date;
        if (req.body.start_time !== undefined) updates.Start_time = req.body.start_time;
        if (req.body.end_time !== undefined) updates.end_time = req.body.end_time;
        if (req.body.max_capacity !== undefined) updates.Max_capacity = req.body.max_capacity;
        if (req.body.urgency !== undefined) updates.Urgency = req.body.urgency;
        if (req.body.status !== undefined) updates.Status = req.body.status;
        if (req.body.created_by !== undefined) updates.Created_by = req.body.created_by;
        if (req.body.descriptions !== undefined) updates.Descriptions = req.body.descriptions;
        
        // Don't use Skill_needed anymore
        updates.Skill_needed = null;
        
        console.log('🔄 Original request body:', req.body);
        console.log('🔄 Transformed updates:', updates);
        
        // Update event
        await EventDB.updateEvent(id, updates);
        
        // Update skills in junction table if provided
       // In updateEventDB, update skills section:
if (req.body.requiredSkills !== undefined) {
    const skills = req.body.requiredSkills.map(skill => {
        if (typeof skill === 'object') {
            return {
                skillId: skill.skillId,
                isRequired: skill.isRequired !== undefined ? skill.isRequired : true,
                neededCount: skill.neededCount || 1
            };
        } else {
            return {
                skillId: skill,
                isRequired: true,
                neededCount: 1
            };
        }
    });
    
    await EventDB.updateEventSkills(id, skills);
}
        
        // Get updated event with skills
        const eventWithSkills = await EventDB.getEventWithSkills(id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Event updated successfully',
            data: eventWithSkills
        });
    } catch (error) {
        console.error('Error in updateEventDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event in database',
            error: error.message
        });
    }
};


// DELETE - Delete event from database
const deleteEventDB = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if event exists
        const event = await EventDB.getEventById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found in database'
            });
        }
        
        // Delete event
        const result = await EventDB.deleteEvent(id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Event deleted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in deleteEventDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event from database',
            error: error.message
        });
    }
};


module.exports = {
    // GET
    getAllEventsDB,
    getEventByIdDB,
    getEventsByStatusDB,
    getEventsByUrgencyDB,
    getUpcomingEventsDB,
    
    // POST
    createEventDB,
    
    // PUT
    updateEventDB,
    
    // DELETE
    deleteEventDB
};
