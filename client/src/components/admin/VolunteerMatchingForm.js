import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Check } from "lucide-react";
import {
    createVolunteerMatch,
    fetchAllMatches,
    deleteVolunteerMatch,
} from "../../services/VolunteerMatchingAPI";

const API_BASE_URL = "http://localhost:5000/api";

// Mock data; to use fetch call once event API implemented.
const mockEvents = [
    {
        id: 101,
        name: "Weekly Food Distribution",
        location: "Community Center",
        date: "2025-10-20",
        urgency: "Medium",
        skills: ["Customer Service"],
    },
    {
        id: 102,
        name: "Canned Goods Sorting",
        location: "Food Bank Warehouse",
        date: "2025-11-02",
        urgency: "Low",
        skills: ["Organization"],
    },
    {
        id: 103,
        name: "Emergency Relief Packing",
        location: "Distribution Hub",
        date: "2025-12-01",
        urgency: "High",
        skills: ["Teamwork", "Efficiency"],
    },
];

const VolunteerMatchingForm = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [loadingVolunteers, setLoadingVolunteers] = useState(true);

    // Notification context for real-time feedback
    const { addNotification } = useContext(NotificationContext);

    // Load all volunteers from backend on component mount
    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/volunteers`);
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    // Normalize to simple id + name objects
                    const formatted = data.data.map((v) => ({
                        id: v.Volunteer_id,
                        name: `${v.First_name} ${v.Last_name}`,
                    }));
                    setVolunteers(formatted);
                } else {
                    console.error("Unexpected volunteer API format:", data);
                }
            } catch (err) {
                console.error("Error fetching volunteers:", err);
            } finally {
                setLoadingVolunteers(false);
            }
        };

        fetchVolunteers();
    }, []);

    // Load all matches from backend on component mount
    useEffect(() => {
        const loadMatches = async () => {
            try {
                const result = await fetchAllMatches();
                if (result.success) {
                    // Combine IDs with volunteer + event names
                    const detailedMatches = result.data.map((m) => {
                        const volunteer = volunteers.find((v) => v.id === m.volunteerId);
                        const event = mockEvents.find((e) => e.id === m.eventId);
                        return {
                            volunteerId: m.volunteerId,
                            eventId: m.eventId,
                            volunteer: volunteer ? volunteer.name : `Volunteer ${m.volunteerId}`,
                            event: event ? event.name : `Event ${m.eventId}`,
                        };
                    });
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
            alert("Please select both a volunteer and an event.");
            return;
        }

        const volunteer = volunteers.find((v) => v.id === parseInt(selectedVolunteer));
        const event = mockEvents.find((ev) => ev.id === parseInt(selectedEvent));

        try {
            setLoading(true);

            // Call backend API to create match + update history
            const result = await createVolunteerMatch(volunteer.id, event.id, event);

            // Update local matches
            setMatches((prev) => [
                ...prev,
                {
                    volunteerId: volunteer.id,
                    eventId: event.id,
                    volunteer: volunteer.name,
                    event: event.name,
                },
            ]);

            // Push a notification
            addNotification({
                type: "assignment",
                message: `${volunteer.name} has been assigned to ${event.name}.`,
                time: "Just now",
            });

            console.log("Match created:", result);

            // Reset form
            setSelectedVolunteer("");
            setSelectedEvent("");
        } catch (error) {
            console.error("Error creating match:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle unassigning volunteers
    const handleDelete = async (match) => {
        try {
            await deleteVolunteerMatch(match.volunteerId, match.eventId);
            setMatches((prev) =>
                prev.filter(
                    (m) => !(m.volunteerId === match.volunteerId && m.eventId === match.eventId)
                )
            );
            addNotification({
                type: "removal",
                message: `${match.volunteer} has been unassigned from ${match.event}.`,
                time: "Just now",
            });
        } catch (error) {
            console.error("Error deleting match:", error);
            alert(error.message);
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
                    {mockEvents.map((ev) => (
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
