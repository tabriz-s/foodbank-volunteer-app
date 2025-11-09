const { getConnection } = require('../config/database');

/* 
============================================
Event queries (can merge with eventModel.js later once working product is complete)
============================================
*/

//====================
// GET calls
//=====================

// Get all upcoming events (future dates only)
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

// Get single event by ID - also used by getEventWithSkills function
const getEventById = async (eventId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM events WHERE Event_id = ?',
            [eventId]
        );
        return rows[0];
    } catch (error) {
        console.error('Error getting event by ID:', error);
        throw error;
    }
};

// Get event with its required skills and capacity info
const getEventWithSkills = async (eventId) => {
    try {
        const connection = await getConnection();
        
        // Get event details
        const event = await getEventById(eventId);
        
        if (!event) {
            return null;
        }
        
        // Get required skills with capacity info
        const [skills] = await connection.query(
            `SELECT 
                es.Event_skill_id,
                es.Skills_id,
                es.Is_required,
                es.Needed_count,
                s.Description as Skill_name,
                s.Category,
                COUNT(esig.Signup_id) as Current_signups
             FROM event_skills es
             INNER JOIN skills s ON es.Skills_id = s.Skills_id
             LEFT JOIN event_signups esig ON esig.Event_id = es.Event_id 
                AND esig.Registered_skill_id = es.Skills_id 
                AND esig.Status = 'registered'
             WHERE es.Event_id = ?
             GROUP BY es.Event_skill_id, es.Skills_id, es.Is_required, es.Needed_count, s.Description, s.Category`,
            [eventId]
        );
        
        return {
            ...event,
            required_skills: skills
        };
    } catch (error) {
        console.error('Error getting event with skills:', error);
        throw error;
    }
};


// ============================================
// EVENT_SKILLS QUERIES
// ============================================

// Get required skills for an event
const getEventRequiredSkills = async (eventId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT 
                es.*,
                s.Description as Skill_name,
                s.Category
             FROM event_skills es
             INNER JOIN skills s ON es.Skills_id = s.Skills_id
             WHERE es.Event_id = ? AND es.Is_required = TRUE`,
            [eventId]
        );
        return rows;
    } catch (error) {
        console.error('Error getting event required skills:', error);
        throw error;
    }
};

// Check how many spots left for a specific skill in an event
const getSkillSpotsAvailable = async (eventId, skillId) => {
    try {
        const connection = await getConnection();
        
        // Get the skill requirement
        const [skillReq] = await connection.query(
            `SELECT Needed_count FROM event_skills 
             WHERE Event_id = ? AND Skills_id = ?`,
            [eventId, skillId]
        );
        
        if (skillReq.length === 0) {
            return null; // Skill not required for this event
        }
        
        const neededCount = skillReq[0].Needed_count;
        
        // If NULL, unlimited spots
        if (neededCount === null) {
            return Infinity;
        }
        
        // Count current signups for this skill
        const [signups] = await connection.query(
            `SELECT COUNT(*) as count 
             FROM event_signups 
             WHERE Event_id = ? 
             AND Registered_skill_id = ? 
             AND Status = 'registered'`,
            [eventId, skillId]
        );
        
        const currentSignups = signups[0].count;
        const spotsLeft = neededCount - currentSignups;
        
        return spotsLeft > 0 ? spotsLeft : 0;
    } catch (error) {
        console.error('Error getting skill spots available:', error);
        throw error;
    }
};


// ============================================
// SIGNUP QUERIES
// ============================================

// Get all signups for a volunteer
const getVolunteerSignups = async (volunteerId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT 
                es.*,
                e.Event_name,
                e.Event_type,
                e.Description,
                e.Location,
                e.Date,
                e.Start_time,
                e.end_time,
                e.Urgency,
                s.Description as Registered_as_skill
             FROM event_signups es
             INNER JOIN events e ON es.Event_id = e.Event_id
             LEFT JOIN skills s ON es.Registered_skill_id = s.Skills_id
             WHERE es.Volunteer_id = ? 
             AND es.Status = 'registered'
             ORDER BY e.Date ASC, e.Start_time ASC`,
            [volunteerId]
        );
        return rows;
    } catch (error) {
        console.error('Error getting volunteer signups:', error);
        throw error;
    }
};

// Check if volunteer is already registered for event
const checkIfRegistered = async (volunteerId, eventId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT * FROM event_signups 
             WHERE Volunteer_id = ? 
             AND Event_id = ? 
             AND Status = 'registered'`,
            [volunteerId, eventId]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking registration:', error);
        throw error;
    }
};

// Get count of registered volunteers for an event (total)
const getEventSignupCount = async (eventId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT COUNT(*) as count 
             FROM event_signups 
             WHERE Event_id = ? 
             AND Status = 'registered'`,
            [eventId]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error getting signup count:', error);
        throw error;
    }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Check if volunteer has any of the required skills for event
const hasRequiredSkills = async (volunteerId, eventId) => {
    try {
        const connection = await getConnection();
        
        // Get required skills for event
        const requiredSkills = await getEventRequiredSkills(eventId);
        
        // If no required skills, everyone qualifies
        if (requiredSkills.length === 0) {
            return { hasSkills: true, matchingSkills: [] };
        }
        
        const requiredSkillIds = requiredSkills.map(s => s.Skills_id);
        
        // Check if volunteer has at least ONE of the required skills
        const [volunteerSkills] = await connection.query(
            `SELECT Skills_id 
             FROM volunteer_skills 
             WHERE Volunteer_id = ? 
             AND Skills_id IN (?)`,
            [volunteerId, requiredSkillIds]
        );
        
        const matchingSkillIds = volunteerSkills.map(s => s.Skills_id);
        
        return {
            hasSkills: matchingSkillIds.length > 0,
            matchingSkills: matchingSkillIds
        };
    } catch (error) {
        console.error('Error checking skills:', error);
        throw error;
    }
};

// Check for time conflicts with existing signups
const checkTimeConflict = async (volunteerId, eventId) => {
    try {
        const connection = await getConnection();
        
        // Get the new event's time
        const newEvent = await getEventById(eventId);
        
        if (!newEvent) {
            throw new Error('Event not found');
        }

        // Get all registered events for volunteer on the same date
        const [registeredEvents] = await connection.query(
            `SELECT e.* 
             FROM event_signups es
             INNER JOIN events e ON es.Event_id = e.Event_id
             WHERE es.Volunteer_id = ? 
             AND es.Status = 'registered'
             AND e.Date = ?`,
            [volunteerId, newEvent.Date]
        );

        // Check for time overlaps
        for (const event of registeredEvents) {
            const newStart = new Date(newEvent.Start_time);
            const newEnd = new Date(newEvent.end_time);
            const existingStart = new Date(event.Start_time);
            const existingEnd = new Date(event.end_time);

            // Check if times overlap
            const hasConflict = (
                (newStart >= existingStart && newStart < existingEnd) ||  // New starts during existing
                (newEnd > existingStart && newEnd <= existingEnd) ||      // New ends during existing
                (newStart <= existingStart && newEnd >= existingEnd)      // New contains existing
            );

            if (hasConflict) {
                return {
                    hasConflict: true,
                    conflictingEvent: event
                };
            }
        }

        return { hasConflict: false };
    } catch (error) {
        console.error('Error checking time conflict:', error);
        throw error;
    }
};

// Check if event is at total capacity
const isEventFull = async (eventId) => {
    try {
        const event = await getEventById(eventId);
        
        if (!event || !event.Max_capacity) {
            return false; // No capacity limit
        }

        const signupCount = await getEventSignupCount(eventId);
        return signupCount >= event.Max_capacity;
    } catch (error) {
        console.error('Error checking event capacity:', error);
        throw error;
    }
};

// Check if a specific skill slot is full
const isSkillSlotFull = async (eventId, skillId) => {
    try {
        const spotsLeft = await getSkillSpotsAvailable(eventId, skillId);
        
        if (spotsLeft === null) {
            return true; // Skill not required for event
        }
        
        if (spotsLeft === Infinity) {
            return false; // Unlimited spots
        }
        
        return spotsLeft <= 0;
    } catch (error) {
        console.error('Error checking skill slot:', error);
        throw error;
    }
};

// ============================================
// SIGNUP OPERATIONS
// ============================================

// Create new event signup with specific skill
const createSignup = async (volunteerId, eventId, registeredSkillId) => {
    try {
        const connection = await getConnection();

        // Validation checks
        const alreadyRegistered = await checkIfRegistered(volunteerId, eventId);
        if (alreadyRegistered) {
            throw new Error('Already registered for this event');
        }

        const eventFull = await isEventFull(eventId);
        if (eventFull) {
            throw new Error('Event is at full capacity');
        }

        // Check if volunteer has required skills
        const { hasSkills, matchingSkills } = await hasRequiredSkills(volunteerId, eventId);
        if (!hasSkills) {
            throw new Error('You do not have the required skills for this event');
        }

        // If registering for a specific skill, verify volunteer has it
        if (registeredSkillId) {
            if (!matchingSkills.includes(registeredSkillId)) {
                throw new Error('You do not have this skill');
            }

            // Check if skill slot is full
            const skillFull = await isSkillSlotFull(eventId, registeredSkillId);
            if (skillFull) {
                throw new Error('This skill slot is full');
            }
        }

        // Check time conflicts
        const timeCheck = await checkTimeConflict(volunteerId, eventId);
        if (timeCheck.hasConflict) {
            throw new Error(`Time conflict with event: ${timeCheck.conflictingEvent.Event_name}`);
        }

        // All checks passed - create signup
        const [result] = await connection.query(
            `INSERT INTO event_signups (Volunteer_id, Event_id, Registered_skill_id, Status)
             VALUES (?, ?, ?, 'registered')`,
            [volunteerId, eventId, registeredSkillId || null]
        );

        return {
            Signup_id: result.insertId,
            Volunteer_id: volunteerId,
            Event_id: eventId,
            Registered_skill_id: registeredSkillId,
            Status: 'registered'
        };
    } catch (error) {
        console.error('Error creating signup:', error);
        throw error;
    }
};

// Delete signup (unregister)
const deleteSignup = async (signupId, volunteerId) => {
    try {
        const connection = await getConnection();

        // Verify signup belongs to this volunteers request
        const [existing] = await connection.query(
            'SELECT * FROM event_signups WHERE Signup_id = ? AND Volunteer_id = ?',
            [signupId, volunteerId]
        );

        if (existing.length === 0) {
            throw new Error('Signup not found or does not belong to this volunteer');
        }

        // Delete the signup
        await connection.query(
            'DELETE FROM event_signups WHERE Signup_id = ?',
            [signupId]
        );

        return {
            success: true,
            message: 'Successfully unregistered from event'
        };
    } catch (error) {
        console.error('Error deleting signup:', error);
        throw error;
    }
};

// ============================================
// FILTERED EVENT QUERIES FOR REGISTRATION PAGE
// ============================================

// Get available events for volunteer (Section 1 of event sign up page)
const getAvailableEventsForVolunteer = async (volunteerId) => {
    try {
        const connection = await getConnection();

        // Get volunteer's skill IDs
        const [volunteerSkills] = await connection.query(
            'SELECT Skills_id FROM volunteer_skills WHERE Volunteer_id = ?',
            [volunteerId]
        );

        const volunteerSkillIds = volunteerSkills.map(s => s.Skills_id);

        // Get all upcoming events
        const upcomingEvents = await getUpcomingEvents();

        // Get volunteer's registered event IDs
        const registeredSignups = await getVolunteerSignups(volunteerId);
        const registeredEventIds = registeredSignups.map(s => s.Event_id);

        // Filter events
        const availableEvents = [];

        for (const event of upcomingEvents) {
            // Skip if already registered
            if (registeredEventIds.includes(event.Event_id)) {
                continue;
            }

            // Skip if event is at total capacity
            const isFull = await isEventFull(event.Event_id);
            if (isFull) {
                continue;
            }

            // Get event's required skills
            const requiredSkills = await getEventRequiredSkills(event.Event_id);

            // If no required skills, everyone qualifies
            if (requiredSkills.length === 0) {
                const eventWithSkills = await getEventWithSkills(event.Event_id);
                availableEvents.push(eventWithSkills);
                continue;
            }

            // Check if volunteer has at least ONE required skill with available spots
            let hasAvailableSkillSlot = false;

            for (const reqSkill of requiredSkills) {
                if (volunteerSkillIds.includes(reqSkill.Skills_id)) {
                    const spotsLeft = await getSkillSpotsAvailable(event.Event_id, reqSkill.Skills_id);
                    if (spotsLeft === null || spotsLeft === Infinity || spotsLeft > 0) {
                        hasAvailableSkillSlot = true;
                        break;
                    }
                }
            }

            if (hasAvailableSkillSlot) {
                const eventWithSkills = await getEventWithSkills(event.Event_id);
                availableEvents.push(eventWithSkills);
            }
        }

        return availableEvents;
    } catch (error) {
        console.error('Error getting available events:', error);
        throw error;
    }
};

// Get other events (Section 2 of event signup page - user is missing required skills)
const getOtherEventsForVolunteer = async (volunteerId) => {
    try {
        const connection = await getConnection();

        // Get volunteer's skill IDs
        const [volunteerSkills] = await connection.query(
            'SELECT Skills_id FROM volunteer_skills WHERE Volunteer_id = ?',
            [volunteerId]
        );

        const volunteerSkillIds = volunteerSkills.map(s => s.Skills_id);

        // Get all upcoming events
        const upcomingEvents = await getUpcomingEvents();

        // Get volunteer's registered event IDs
        const registeredSignups = await getVolunteerSignups(volunteerId);
        const registeredEventIds = registeredSignups.map(s => s.Event_id);

        // Filter events volunteer DOESN'T qualify for
        const otherEvents = [];

        for (const event of upcomingEvents) {
            // Skip if already registered
            if (registeredEventIds.includes(event.Event_id)) {
                continue;
            }

            // Get event's required skills
            const requiredSkills = await getEventRequiredSkills(event.Event_id);

            // Skip events with no required skills (they're in "Available")
            if (requiredSkills.length === 0) {
                continue;
            }

            // Check if volunteer has NONE of the required skills
            const requiredSkillIds = requiredSkills.map(s => s.Skills_id);
            const hasNone = !requiredSkillIds.some(id => volunteerSkillIds.includes(id));

            if (hasNone) {
                const eventWithSkills = await getEventWithSkills(event.Event_id);
                otherEvents.push(eventWithSkills);
            }
        }

        return otherEvents;
    } catch (error) {
        console.error('Error getting other events:', error);
        throw error;
    }
};

// ========================================================

module.exports = {
    // Event queries (TODO: Move to EventModelDB on final push)
    getUpcomingEvents,
    getEventById,
    getEventWithSkills,
    
    // Event skills queries
    getEventRequiredSkills,
    getSkillSpotsAvailable,
    
    // Signup queries
    getVolunteerSignups,
    checkIfRegistered,
    getEventSignupCount,
    
    // Validation
    hasRequiredSkills,
    checkTimeConflict,
    isEventFull,
    isSkillSlotFull,
    
    // Signup operations
    createSignup,
    deleteSignup,
    
    // Filtered queries for registration page
    getAvailableEventsForVolunteer,
    getOtherEventsForVolunteer
};