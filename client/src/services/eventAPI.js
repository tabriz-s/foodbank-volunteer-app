const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all events
export const fetchAllEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// Fetch single event by ID
export const fetchEventById = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch event');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
};

// Create new event
export const createEvent = async (eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to create event');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Update existing event
export const updateEvent = async (eventId, eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to update event');
        }
        
        return data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

// Delete event
export const deleteEvent = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete event');
        }
        
        return data;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

// Fetch events by status
export const fetchEventsByStatus = async (status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/status?status=${status}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching events by status:', error);
        throw error;
    }
};
