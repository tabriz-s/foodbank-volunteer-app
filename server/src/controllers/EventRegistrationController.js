const EventSignupModelDB = require('../models/EventSignupModelDB');

// ============================================
// GET AVAILABLE EVENTS (Section 1)
// ============================================
const getAvailableEvents = async (req, res) => {
    try {
        const { volunteer_id } = req.query;

        if (!volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id is required'
            });
        }

        const events = await EventSignupModelDB.getAvailableEventsForVolunteer(volunteer_id);

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Available events retrieved successfully',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getAvailableEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve available events',
            error: error.message
        });
    }
};

// ============================================
// GET OTHER EVENTS (Section 2)
// ============================================
const getOtherEvents = async (req, res) => {
    try {
        const { volunteer_id } = req.query;

        if (!volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id is required'
            });
        }

        const events = await EventSignupModelDB.getOtherEventsForVolunteer(volunteer_id);

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Other events retrieved successfully',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getOtherEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve other events',
            error: error.message
        });
    }
};

// ============================================
// GET MY REGISTERED EVENTS (Section 3)
// ============================================
const getMyEvents = async (req, res) => {
    try {
        const { volunteer_id } = req.query;

        if (!volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id is required'
            });
        }

        const events = await EventSignupModelDB.getVolunteerSignups(volunteer_id);

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Your registered events retrieved successfully',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error in getMyEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve your events',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE EVENT WITH DETAILS
// ============================================
const getEventDetails = async (req, res) => {
    try {
        const { event_id } = req.params;
        const { volunteer_id } = req.query;

        if (!event_id) {
            return res.status(400).json({
                success: false,
                message: 'event_id is required'
            });
        }

        // Get event with skills and capacity info
        const event = await EventSignupModelDB.getEventWithSkills(event_id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // If volunteer_id provided, check their eligibility
        let eligibility = null;
        if (volunteer_id) {
            const alreadyRegistered = await EventSignupModelDB.checkIfRegistered(volunteer_id, event_id);
            const { hasSkills, matchingSkills } = await EventSignupModelDB.hasRequiredSkills(volunteer_id, event_id);
            const timeConflict = await EventSignupModelDB.checkTimeConflict(volunteer_id, event_id);
            const eventFull = await EventSignupModelDB.isEventFull(event_id);

            eligibility = {
                alreadyRegistered,
                hasRequiredSkills: hasSkills,
                matchingSkills,
                hasTimeConflict: timeConflict.hasConflict,
                conflictingEvent: timeConflict.conflictingEvent || null,
                eventFull,
                canRegister: !alreadyRegistered && hasSkills && !timeConflict.hasConflict && !eventFull
            };
        }

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: event,
            eligibility
        });
    } catch (error) {
        console.error('Error in getEventDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve event details',
            error: error.message
        });
    }
};

// ============================================
// REGISTER FOR EVENT
// ============================================
const registerForEvent = async (req, res) => {
    try {
        const { volunteer_id, event_id, registered_skill_id } = req.body;

        // Validation
        if (!volunteer_id || !event_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id and event_id are required'
            });
        }

        // Get event details to check if skills are required
        const event = await EventSignupModelDB.getEventWithSkills(event_id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Only require skill selection if event has required skills
        const hasRequiredSkills = event.required_skills && event.required_skills.length > 0;
        
        if (hasRequiredSkills && !registered_skill_id) {
            return res.status(400).json({
                success: false,
                message: 'You must select which skill role you want to fill'
            });
        }

        // Create signup (registered_skill_id can be null for events with no required skills)
        const signup = await EventSignupModelDB.createSignup(
            volunteer_id,
            event_id,
            registered_skill_id || null  // Pass null if no skill selected
        );

        // Get event details to return
        const eventDetails = await EventSignupModelDB.getEventById(event_id);

        res.status(201).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Successfully registered for event',
            data: {
                signup,
                event: eventDetails
            }
        });
    } catch (error) {
        console.error('Error in registerForEvent:', error);
        
        // Handle specific error messages
        const status = error.message.includes('already registered') ? 409 :
                      error.message.includes('full') ? 409 :
                      error.message.includes('conflict') ? 409 :
                      error.message.includes('do not have') ? 403 :
                      500;

        res.status(status).json({
            success: false,
            message: error.message || 'Failed to register for event',
            error: error.message
        });
    }
};

// ============================================
// UNREGISTER FROM EVENT
// ============================================
const unregisterFromEvent = async (req, res) => {
    try {
        const { signup_id } = req.params;
        const { volunteer_id } = req.body;

        if (!signup_id || !volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'signup_id and volunteer_id are required'
            });
        }

        const result = await EventSignupModelDB.deleteSignup(signup_id, volunteer_id);

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: result.message,
            data: result
        });
    } catch (error) {
        console.error('Error in unregisterFromEvent:', error);
        
        const status = error.message.includes('not found') ? 404 : 500;

        res.status(status).json({
            success: false,
            message: error.message || 'Failed to unregister from event',
            error: error.message
        });
    }
};

// ============================================
// GET SKILL AVAILABILITY FOR EVENT
// ============================================
const getSkillAvailability = async (req, res) => {
    try {
        const { event_id } = req.params;
        const { volunteer_id } = req.query;

        if (!event_id) {
            return res.status(400).json({
                success: false,
                message: 'event_id is required'
            });
        }

        // Get event with skills
        const event = await EventSignupModelDB.getEventWithSkills(event_id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // If volunteer_id provided, filter to only show skills they have
        let availableSkills = event.required_skills;

        if (volunteer_id) {
            const { hasSkills, matchingSkills } = await EventSignupModelDB.hasRequiredSkills(volunteer_id, event_id);
            
            // Filter to only skills volunteer has
            availableSkills = event.required_skills.filter(skill => 
                matchingSkills.includes(skill.Skills_id)
            );
        }

        // Calculate spots remaining for each skill
        const skillsWithAvailability = availableSkills.map(skill => ({
            ...skill,
            spots_remaining: skill.Needed_count === null ? 'Unlimited' : 
                            (skill.Needed_count - skill.Current_signups),
            is_full: skill.Needed_count !== null && skill.Current_signups >= skill.Needed_count
        }));

        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            event_id: event.Event_id,
            event_name: event.Event_name,
            data: skillsWithAvailability
        });
    } catch (error) {
        console.error('Error in getSkillAvailability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skill availability',
            error: error.message
        });
    }
};

// ============================================

module.exports = {
    getAvailableEvents,
    getOtherEvents,
    getMyEvents,
    getEventDetails,
    registerForEvent,
    unregisterFromEvent,
    getSkillAvailability
};