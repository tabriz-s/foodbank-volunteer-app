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
