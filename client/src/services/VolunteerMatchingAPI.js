// Base API URL from .env
const API_BASE_URL = 'http://localhost:5000/api';

/* ============================
   POST: Create Volunteer–Event Match
=============================== */
export const createVolunteerMatch = async (volunteerId, eventId, eventData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/matching`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // enable later
            },
            credentials: 'include',
            body: JSON.stringify({ volunteerId, eventId, eventData }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create volunteer–event match');
        }

        return data;
    } catch (error) {
        console.error('Error creating volunteer–event match:', error);
        throw error;
    }
};

/* ============================
   GET: Fetch All Matches
=============================== */
export const fetchAllMatches = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/matching`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteer–event matches');
        }

        return data;
    } catch (error) {
        console.error('Error fetching all matches:', error);
        throw error;
    }
};

/* ============================
   GET: Fetch Matches by Volunteer
=============================== */
export const fetchMatchesByVolunteer = async (volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/matching/${volunteerId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteer matches');
        }

        return data;
    } catch (error) {
        console.error('Error fetching volunteer matches:', error);
        throw error;
    }
};

/* ============================
   DELETE: Remove Volunteer–Event Match
=============================== */
export const deleteVolunteerMatch = async (volunteerId, eventId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/matching`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ volunteerId, eventId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete volunteer–event match');
        }

        return data;
    } catch (error) {
        console.error('Error deleting volunteer–event match:', error);
        throw error;
    }
};
