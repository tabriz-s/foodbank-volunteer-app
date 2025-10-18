import React, { createContext, useState, useEffect } from "react";
import {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
} from "../services/NotificationAPI";

// Create Context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children, user }) => {

    const [notifications, setNotifications] = useState([]);
    const role = user?.role || "admin"; // “admin” or “volunteer”
    const userId = user?.id || 1; // fallback for mock data

    // Load notifications from backend
    useEffect(() => {
        const fetchData = async () => {
            const res = await getNotifications(role, userId);
            if (res.success) setNotifications(res.data);
        };
        fetchData();
    }, [role, userId]);

    // Add a notification
    const addNotification = async (notification) => {
        // Update local UI immediately
        const newNote = {
            id: Date.now(),
            message: notification.message,
            type: notification.type || "general",
            read: false,
            timestamp: new Date().toISOString(),
        };
        setNotifications((prev) => [newNote, ...prev]);

        // Send to backend for persistence
        await createNotification({
            recipientType: notification.recipientType || role,
            recipientId: notification.recipientId || userId,
            message: notification.message,
        });
    };

    const markAsRead = async (id) => {
        await markNotificationAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const removeNotification = async (id) => {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, setNotifications, addNotification, markAsRead, removeNotification }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
// Load from local storage on startup