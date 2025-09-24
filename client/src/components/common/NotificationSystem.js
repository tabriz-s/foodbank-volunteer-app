import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react"; // notification bell icon

// Mock notifications for testing
const mockNotifications = [
    {
        id: 1,
        type: "assignment",
        message: "You’ve been assigned to 'Weekly Food Distribution' on Oct 10.",
        time: "2 hours ago",
    },
    {
        id: 2,
        type: "update",
        message: "Event 'Canned Goods Sorting' has changed its start time to 10 AM.",
        time: "1 day ago",
    },
    {
        id: 3,
        type: "reminder",
        message: "Reminder: 'Emergency Relief Packing' is tomorrow at 9 AM.",
        time: "2 days ago",
    },
    {
        id: 4,
        type: "assignment",
        message: "You’ve been assigned to 'Neighborhood Delivery Route' on Oct 5.",
        time: "5 days ago",
    },
];

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load notifications on mount
    useEffect(() => {
        // fetch('/api/notifications')
        setNotifications(mockNotifications);
    }, []);

    // Dismiss individual notification
    const handleDismiss = (id) => {
        setNotifications((prev) => prev.filter((note) => note.id !== id));
    };

    return (
        <>
            {/* Notification Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                aria-label="Toggle notifications"
            >
                <Bell size={24} />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2">
            {notifications.length}
          </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        Notifications
                    </h3>

                    {notifications.length === 0 ? (
                        <p className="text-gray-600 text-sm">No new notifications 🎉</p>
                    ) : (
                        <ul className="space-y-3">
                            {notifications.map((note) => (
                                <li
                                    key={note.id}
                                    className="flex items-start justify-between p-3 bg-gray-50 rounded-md shadow-sm"
                                >
                                    <div>
                                        <p className="text-sm text-gray-800">{note.message}</p>
                                        <p className="text-xs text-gray-500">{note.time}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDismiss(note.id)}
                                        className="ml-2 text-gray-400 hover:text-red-600"
                                        aria-label="Dismiss"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationSystem;
