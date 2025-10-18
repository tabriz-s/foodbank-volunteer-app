// Base API URL from .env
const API_BASE_URL = 'http://localhost:5000/api';

/* ============================
   GET: Volunteer History
=============================== */

export const fetchVolunteerHistory = async (volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/${volunteerId}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include JWT token when login module is added
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            credentials: 'include'
        });

        const data = await response.json();

        // Handle backend or network errors
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteer history');
        }

        return data;
    } catch (error) {
        console.error('Error fetching volunteer history:', error);
        throw error;
    }
};

/* ============================
   POST: Add History Entry
=============================== */

export const addVolunteerHistory = async (volunteerId, eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/${volunteerId}/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include JWT token when login module is added
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            credentials: 'include',
            body: JSON.stringify(eventData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add volunteer history record');
        }

        return data;
    } catch (error) {
        console.error('Error adding volunteer history:', error);
        throw error;
    }
};

/* ============================
   PUT: Update Event History
=============================== */
export const updateEventHistory = async (eventId, updatedData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/history`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updatedData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update event history');
        }

        return data;
    } catch (error) {
        console.error('Error updating event history:', error);
        throw error;
    }
};

/* ============================
   DELETE: Delete Event History
=============================== */
export const deleteEventHistory = async (eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/history`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete event history');
        }

        return data;
    } catch (error) {
        console.error('Error deleting event history:', error);
        throw error;
    }
};
