import React, { useState, useEffect, useContext } from "react";
import { Bell } from "lucide-react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { getNotifications } from "../../services/NotificationAPI";

const NotificationSystem = ({ user }) => {
    const {
        notifications,
        setNotifications,
        markAsRead,
        removeNotification,
    } = useContext(NotificationContext);

    const [isOpen, setIsOpen] = useState(false);

    // Pull role and id from the current user
    const role = user?.role || "volunteer";
    const userId = user?.id || 1;

    useEffect(() => {
        const fetchData = async () => {
            const res = await getNotifications(role, userId);
            if (res.success) setNotifications(res.data);
        };
        fetchData();
    }, [role, userId, setNotifications]);

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
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Notifications</h3>

                    {notifications.length === 0 ? (
                        <p className="text-gray-600 text-sm">No new notifications</p>
                    ) : (
                        <ul className="space-y-3">
                            {notifications.map((note) => (
                                <li
                                    key={note.id}
                                    className="flex items-start justify-between p-3 bg-gray-50 rounded-md shadow-sm"
                                >
                                    <div>
                                        <p className="text-sm text-gray-800">{note.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(note.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeNotification(note.id)}
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
