import React, { createContext, useState, useEffect } from "react";

// Create Context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

    const [notifications, setNotifications] = useState(() => {
        const stored = localStorage.getItem("notifications");
        return stored ? JSON.parse(stored) : [];
    });

    // Save to local storage whenever notifications change
    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    // Add a new notification
    const addNotification = (notification) => {
        setNotifications((prev) => [
            { id: Date.now(), ...notification }, // auto-generate ID
            ...prev,
        ]);
    };

    // Remove notification
    const dismissNotification = (id) => {
        setNotifications((prev) => prev.filter((note) => note.id !== id));
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, dismissNotification }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
// Load from local storage on startup