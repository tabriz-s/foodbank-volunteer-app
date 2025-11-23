const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getNotifications = async (role, id = null, unreadOnly = false) => {
    try {
        let url = `${API_URL}/notifications?role=${role}`;
        if (id) url += `&id=${id}`;
        if (unreadOnly) url += `&unreadOnly=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return await res.json();
    } catch (err) {
        console.error("Error fetching notifications:", err);
        return { success: false, message: err.message };
    }
};

export const createNotification = async (data) => {
    try {
        const res = await fetch(`${API_URL}/notifications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    } catch (err) {
        console.error("Error creating notification:", err);
        return { success: false, message: err.message };
    }
};

export const markNotificationAsRead = async (id) => {
    try {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: "PUT" });
        return await res.json();
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return { success: false, message: err.message };
    }
};

export const deleteNotification = async (id) => {
    try {
        const res = await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
        return await res.json();
    } catch (err) {
        console.error("Error deleting notification:", err);
        return { success: false, message: err.message };
    }
};

// Fetch all notifications for a volunteer
export const fetchVolunteerNotifications = async (volunteerId) => {
    try {
        const response = await fetch(`${API_URL}/notifications/volunteer/${volunteerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch notifications');
        }

        return data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Fetch unread notification count for a volunteer
export const fetchUnreadCount = async (volunteerId) => {
    try {
        const response = await fetch(`${API_URL}/notifications/volunteer/${volunteerId}/unread-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch unread count');
        }

        return data;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
};

/* ============================================
   PUT REQUESTS - Mark Notifications as Read (Volunteer)
   ============================================ */

// Mark a single notification as read
export const volunteerMarkNotifAsRead = async (notificationDeliveryId) => {
    try {
        const response = await fetch(`${API_URL}/notifications/${notificationDeliveryId}/mark-read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to mark notification as read');
        }

        return data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

// Format notification date for display
export const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

// Get notification icon based on type
export const getNotificationIcon = (type) => {
    const icons = {
        'event assignment': '📋',
        'skill_match': '🎯',
        'update': '🔔',
        'Reminder': '⏰'
    };
    return icons[type] || '📬';
};

// Get notification color based on type
export const getNotificationColor = (type) => {
    const colors = {
        'event assignment': 'bg-blue-50 border-blue-200 text-blue-800',
        'skill_match': 'bg-green-50 border-green-200 text-green-800',
        'update': 'bg-yellow-50 border-yellow-200 text-yellow-800',
        'Reminder': 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
};