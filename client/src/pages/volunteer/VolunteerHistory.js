import React, { useEffect, useState } from "react";
import { fetchVolunteerHistory } from "../../services/VolunteerHistoryAPI";
import { useAuth } from "../../contexts/AuthContext";
import { History, MapPin, Calendar, Award, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const VolunteerHistory = () => {
    const { userRole, currentUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);
    const [volunteerName, setVolunteerName] = useState("");
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState("");
    const [isAdmin, setIsAdmin] = useState(userRole === "admin");

    useEffect(() => {
        if (!currentUser || !userRole) return;

        if (userRole === "volunteer") {
            const vid = localStorage.getItem("volunteerId");
            setSelectedVolunteer(vid);
        }

        if (userRole === "admin") {
            setIsAdmin(true);
        }
    }, [currentUser, userRole]);

    // Fetch volunteers list (only if admin)
    useEffect(() => {
        if (!isAdmin) return;

        const fetchVolunteers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/volunteers/db`);
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    const formatted = data.data.map((v) => ({
                        id: v.Volunteer_id,
                        name: `${v.First_name} ${v.Last_name}`,
                    }));
                    setVolunteers(formatted);
                }
            } catch (err) {
                console.error("Error fetching volunteers:", err);
            }
        };

        fetchVolunteers();
    }, [isAdmin]);

    useEffect(() => {
        if (!selectedVolunteer) return;

        setHistoryLoading(true);
        fetchVolunteerHistory(selectedVolunteer)
            .then((data) => {
                if (data.success) {
                    setHistory(data.data);
                    setVolunteerName(data.volunteerName);
                    setError(null);
                } else {
                    setHistory([]);
                    setError(null);
                }
            })
            .catch((err) => {
                if (err.message?.includes("No history found")) {
                    setHistory([]);
                    setError(null);
                } else {
                    setError(err.message || "Failed to load history");
                }
            })
            .finally(() => {
                setHistoryLoading(false);
                setLoading(false);
            });
    }, [selectedVolunteer]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Attended':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'Registered':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default:
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'High':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
            case 'Medium':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default:
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        }
    };

    if (!currentUser || !userRole) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-6 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                <History className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {volunteerName ? `${volunteerName}'s History` : "Volunteer History"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    View past events and participation
                                </p>
                            </div>
                        </div>

                        {isAdmin && (
                            <select
                                value={selectedVolunteer}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setSelectedVolunteer(selectedId);
                                    const chosen = volunteers.find((v) => v.id.toString() === selectedId);
                                    setVolunteerName(chosen ? chosen.name : "");
                                }}
                                className="mt-3 md:mt-0 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Volunteer</option>
                                {volunteers.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {historyLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No history found.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Event</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Location</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Skills</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Urgency</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {history.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{row.Event}</div>
                                                {row.EventDescription && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                        {row.EventDescription}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                    {row.Location}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-300">
                                                {new Date(row.EventDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(row.Skills) ? row.Skills : [row.Skills || 'Any']).map((skill, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(row.Urgency)}`}>
                                                    {row.Urgency}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.Status)}`}>
                                                    {row.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerHistory;