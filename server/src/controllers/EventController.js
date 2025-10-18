const EventModel = require('../models/EventModel');
const AdminModel = require('../models/AdminModel');

//get all events
const getAllEvents = async (req, res) => {
    try {
        const events = EventModel.getAllEvents();
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//get single event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = EventModel.getEventById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//get events by status
const getEventsByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status parameter is required'
            });
        }
        
        const events = EventModel.getEventsByStatus(status);
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//create new event
const createEvent = async (req, res) => {
    try {
        const {
            name,
            description,
            location,
            requiredSkills,
            urgency,
            date,
            status
        } = req.body;
        
        const eventData = {
            name,
            description,
            location,
            requiredSkills: requiredSkills || [],
            urgency,
            date,
            status: status || 'upcoming'
        };
        
        const newEvent = EventModel.createEvent(eventData);
        
        // Log activity
        AdminModel.addActivity('Event created', newEvent.name);     
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//update event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = EventModel.getEventById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const {
            name,
            description,
            location,
            requiredSkills,
            urgency,
            date,
            status
        } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (location !== undefined) updates.location = location;
        if (requiredSkills !== undefined) updates.requiredSkills = requiredSkills;
        if (urgency !== undefined) updates.urgency = urgency;
        if (date !== undefined) updates.date = date;
        if (status !== undefined) updates.status = status;
        
        const updatedEvent = EventModel.updateEvent(id, updates);
        
        //logs activity
        AdminModel.addActivity('Event updated', updatedEvent.name);
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//deleteing event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = EventModel.getEventById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const eventName = event.name;
        const deleted = EventModel.deleteEvent(id);  
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete event'
            });
        }
        
        //logs activity
        AdminModel.addActivity('Event deleted', eventName);  
        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
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
    getAllEvents,
    getEventById,
    getEventsByStatus,
    createEvent,
    updateEvent,
    deleteEvent
};