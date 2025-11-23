import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Check, Users, Calendar, X, Link as LinkIcon } from "lucide-react";
import { createNotification } from "../../services/NotificationAPI";
import { fetchAllMatches } from "../../services/VolunteerMatchingAPI";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const VolunteerMatchingForm = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [message, setMessage] = useState("");

    // Notification context for real-time feedback
    const { addNotification } = useContext(NotificationContext);

    // Load all volunteers from backend on component mount
    useEffect(() => {
        const fetchVolunteers = async () => {
            const res = await fetch(`${API_BASE_URL}/volunteers/db`);
            const data = await res.json();
            if (data.success) {
                const formatted = data.data.map(v => ({
                    id: v.Volunteer_id,
                    name: `${v.First_name} ${v.Last_name}`,
                }));
                setVolunteers(formatted);
            }
        };

        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/events/db`);
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    const formatted = data.data.map((e) => ({
                        id: e.Event_id,
                        name: e.Event_name || "Unnamed Event",
                        description: e.description,
                        location: e.location,
                        urgency: e.urgency,
                        date: e.date,
                    }));
                    setEvents(formatted);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        fetchVolunteers();
        fetchEvents();
    }, []);


    // Load all matches from backend on component mount
    useEffect(() => {
        const loadMatches = async () => {
            try {
                const result = await fetchAllMatches();
                if (result.success) {
                    const detailedMatches = result.data.map((m) => ({
                        volunteerId: m.Volunteer_id,
                        eventId: m.Event_id,
                        volunteer: m.VolunteerName || `Volunteer ${m.Volunteer_id}`,
                        event: m.EventName || `Event ${m.Event_id}`,
                    }));
                    setMatches(detailedMatches);
                }
            } catch (error) {
                console.error("Error fetching matches:", error);
            } finally {
                setLoadingMatches(false);
            }
        };

        loadMatches();
    }, [volunteers]);

    // Handle match creation
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedVolunteer || !selectedEvent) {
            setMessage("Please select both a volunteer and an event.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/matching`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    volunteerId: selectedVolunteer,
                    eventId: selectedEvent,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage("Volunteer successfully assigned to event!");

                // Add new match instantly
                const volunteer = volunteers.find(v => v.id === parseInt(selectedVolunteer));
                const event = events.find(e => e.id === parseInt(selectedEvent));

                setMatches(prev => [
                    ...prev,
                    {
                        volunteerId: parseInt(selectedVolunteer),
                        eventId: parseInt(selectedEvent),
                        volunteer: volunteer ? volunteer.name : `Volunteer ${selectedVolunteer}`,
                        event: event ? event.name : `Event ${selectedEvent}`,
                    },
                ]);

                // Reset dropdowns
                setSelectedVolunteer("");
                setSelectedEvent("");
            } else {
                setMessage(`Error: ${data.message || "Failed to assign volunteer"}`);
            }
        } catch (err) {
            console.error("Error assigning volunteer:", err);
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Handle unassigning volunteers
    const handleDelete = async (match) => {
        try {
            const res = await fetch(`${API_BASE_URL}/matching?volunteerId=${match.volunteerId}&eventId=${match.eventId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    volunteerId: match.volunteerId,
                    eventId: match.eventId,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to unassign volunteer.");
            }

            // Update frontend state
            setMatches((prev) =>
                prev.filter(
                    (m) => !(m.volunteerId === match.volunteerId && m.eventId === match.eventId)
                )
            );
            
            // Local notification
            addNotification({
                type: "removal",
                message: `${match.volunteer} has been unassigned from ${match.event}.`,
                time: "Just now",
            });

            // Send notifications to backend
            await Promise.all([
                createNotification({
                    recipientType: "admin",
                    recipientId: 99,
                    message: `${match.volunteer} has been unassigned from ${match.event}.`,
                }),
                createNotification({
                    recipientType: "volunteer",
                    recipientId: match.volunteerId,
                    message: `You have been unassigned from ${match.event}.`,
                }),
            ]);
        } catch (error) {
            console.error("Error deleting match:", error);
            alert(error.message || "Server error while unassigning volunteer.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <LinkIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Matching</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Match volunteers to events
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Volunteer Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Volunteer
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={selectedVolunteer}
                                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                >
                                    <option value="">Select Volunteer</option>
                                    {volunteers.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Event Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Event
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                >
                                    <option value="">Select Event</option>
                                    {events.map((ev) => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-xl ${
                                message.includes('Error') || message.includes('Please')
                                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl text-white font-medium transition-all shadow-lg ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary-600 hover:bg-primary-700"
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Assigning...
                                </div>
                            ) : (
                                'Assign Volunteer'
                            )}
                        </button>
                    </form>

                    {/* Matches List */}
                    {matches.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Assignments</h3>
                            <ul className="space-y-3">
                                {matches.map((m, idx) => (
                                    <li
                                        key={idx}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                                                <Check size={16} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{m.volunteer}</span>
                                                <span className="text-gray-500 dark:text-gray-400 mx-2">→</span>
                                                <span className="text-gray-700 dark:text-gray-300">{m.event}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(m)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {loadingMatches && (
                        <div className="mt-8 flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerMatchingForm;