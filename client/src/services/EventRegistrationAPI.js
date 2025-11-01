const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// GET REQUESTS - Browse Events
// ============================================

/**
 * Get events volunteer qualifies for (Section 1 - Available events for the volunteer)
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Available events
 */
export const fetchAvailableEvents = async (volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/available?volunteer_id=${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch available events');
        }

        return data;
    } catch (error) {
        console.error('Error fetching available events:', error);
        throw error;
    }
};

/**
 * Get events volunteer doesn't qualify for (Section 2 - Other events they do not have the skills for)
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Other events
 */
export const fetchOtherEvents = async (volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/other?volunteer_id=${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch other events');
        }

        return data;
    } catch (error) {
        console.error('Error fetching other events:', error);
        throw error;
    }
};

/**
 * Get events volunteer is registered for (Section 3 )
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Registered events
 */
export const fetchMyEvents = async (volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/my-events?volunteer_id=${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch my events');
        }

        return data;
    } catch (error) {
        console.error('Error fetching my events:', error);
        throw error;
    }
};

// ============================================
// GET REQUESTS - Event Details
// ============================================

/**
 * Get single event details with eligibility check
 * @param {number} eventId - Event ID
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Event details with eligibility
 */
export const fetchEventDetails = async (eventId, volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/event/${eventId}?volunteer_id=${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch event details');
        }

        return data;
    } catch (error) {
        console.error('Error fetching event details:', error);
        throw error;
    }
};

/**
 * Get available skill slots for an event
 * @param {number} eventId - Event ID
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Available skills with capacity
 */
export const fetchSkillAvailability = async (eventId, volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/event/${eventId}/skills?volunteer_id=${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch skill availability');
        }

        return data;
    } catch (error) {
        console.error('Error fetching skill availability:', error);
        throw error;
    }
};

// ============================================
// POST/DELETE REQUESTS - Registration Actions
// ============================================

/**
 * Register for an event with specific skill role
 * @param {number} volunteerId - Volunteer ID
 * @param {number} eventId - Event ID
 * @param {number} registeredSkillId - Skill ID to register as
 * @returns {Promise} Registration result
 */
export const registerForEvent = async (volunteerId, eventId, registeredSkillId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                volunteer_id: volunteerId,
                event_id: eventId,
                registered_skill_id: registeredSkillId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to register for event');
        }

        return data;
    } catch (error) {
        console.error('Error registering for event:', error);
        throw error;
    }
};

/**
 * Unregister from an event
 * @param {number} signupId - Signup ID
 * @param {number} volunteerId - Volunteer ID
 * @returns {Promise} Unregister result
 */
export const unregisterFromEvent = async (signupId, volunteerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/event-registration/unregister/${signupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                volunteer_id: volunteerId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to unregister from event');
        }

        return data;
    } catch (error) {
        console.error('Error unregistering from event:', error);
        throw error;
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format time for display
 * @param {string} timeString - ISO datetime string
 * @returns {string} Formatted time
 */
export const formatEventTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Get urgency color class
 * @param {string} urgency - Urgency level
 * @returns {string} Tailwind color class
 */
export const getUrgencyColor = (urgency) => {
    const colors = {
        'Critical': 'text-red-600 bg-red-50',
        'High': 'text-orange-600 bg-orange-50',
        'Medium': 'text-yellow-600 bg-yellow-50',
        'Low': 'text-green-600 bg-green-50'
    };
    return colors[urgency] || 'text-gray-600 bg-gray-50';
};

/**
 * Get event type icon/emoji
 * @param {string} eventType - Event type
 * @returns {string} Icon/emoji
 */
export const getEventTypeIcon = (eventType) => {
    const icons = {
        'food_distribution': '🍱',
        'warehouse_work': '📦',
        'food_prep': '🍳',
        'transport': '🚚'
    };
    return icons[eventType] || '📋';
};