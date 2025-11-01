const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all events from database
export const fetchAllEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// Fetch single event by ID from database
export const fetchEventById = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch event');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
};

// Fetch events by status from database
export const fetchEventsByStatus = async (status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/status?status=${status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching events by status:', error);
        throw error;
    }
};

// Fetch events by urgency from database
export const fetchEventsByUrgency = async (urgency) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/urgency?urgency=${urgency}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching events by urgency:', error);
        throw error;
    }
};

// Fetch upcoming events from database
export const fetchUpcomingEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/upcoming`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch upcoming events');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        throw error;
    }
};

// Create new event in database
export const createEvent = async (eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create event');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Update existing event in database
export const updateEvent = async (eventId, eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update event');
        }
        
        return data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

// Delete event from database
export const deleteEvent = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/db/${eventId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete event');
        }
        
        return data;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};
