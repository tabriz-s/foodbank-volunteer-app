import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Check } from "lucide-react";
import { createNotification } from "../../services/NotificationAPI";
import {
    createVolunteerMatch,
    fetchAllMatches,
    deleteVolunteerMatch,
} from "../../services/VolunteerMatchingAPI";

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
                const res = await fetch(`${API_BASE_URL}/events`);
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const formatted = data.data.map((e) => ({
                        id: e.Event_id,
                        name: e.name || "Unnamed Event", // Use correct field
                        description: e.description,
                        location: e.location,
                        urgency: e.urgency,
                        date: e.date,
                    }));

                    setEvents(formatted); // Ensure you have const [events, setEvents] = useState([])
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
                    // Combine IDs with volunteer + event names
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
                // Success message
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
        console.log("Deleting match:", match);
        try {
            // Call backend DELETE route
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
                    (m) =>
                        !(
                            m.volunteerId === match.volunteerId &&
                            m.eventId === match.eventId
                        )
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
                    recipientId: 99, // mock admin ID (replace with logged-in user ID later)
                    message: `${match.volunteer} has been unassigned from ${match.event}.`,
                }),
                createNotification({
                    recipientType: "volunteer",
                    recipientId: match.volunteerId,
                    message: `You have been unassigned from ${match.event}.`,
                }),
            ]);

            console.log("✅ Volunteer unassigned successfully.");
        } catch (error) {
            console.error("❌ Error deleting match:", error);
            alert(error.message || "Server error while unassigning volunteer.");
        }
    };


    return (
        <div className="max-w-lg mx-auto mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Volunteer Matching</h2>
            <p className="text-sm text-gray-500 mb-4">
                Match volunteers to events here.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Volunteer Dropdown */}
                <select
                    value={selectedVolunteer}
                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Volunteer</option>
                    {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>

                {/* Event Dropdown */}
                <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Event</option>
                    {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                            {ev.name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded text-white transition ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Assigning..." : "Assign Volunteer"}
                </button>
            </form>

            {/* Matched Results */}
            {matches.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Assignments</h3>
                    <ul className="space-y-2">
                        {matches.map((m, idx) => (
                            <li
                                key={idx}
                                className="p-2 border rounded bg-gray-50 flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <Check size={15} strokeWidth={4} className="mx-3 text-green-600" />
                                    {m.volunteer} → {m.event}
                                </div>
                                <button
                                    onClick={() => handleDelete(m)}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VolunteerMatchingForm;
