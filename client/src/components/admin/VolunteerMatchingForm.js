import React, { useState, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Check } from 'lucide-react'

// Mock data; to use database once implemented.
const mockVolunteers = [
    { id: "vol-001", name: "Tadiwa K" },
    { id: "vol-002", name: "Tabriz S" },
    { id: "vol-003", name: "Javier A" },
    { id: "vol-004", name: "Mohamed U" },
];

// Mock data; to use database once implemented
const mockEvents = [
    { id: "evt-101", name: "Weekly Food Distribution" },
    { id: "evt-102", name: "Canned Goods Sorting" },
    { id: "evt-103", name: "Emergency Relief Packing" },
];

const VolunteerMatchingForm = () => {
    const [selectedVolunteer, setSelectedVolunteer] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [matches, setMatches] = useState([]);

    // Grab addNotification from context
    const { addNotification } = useContext(NotificationContext);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedVolunteer && selectedEvent) {
            // Save match locally
            const newMatch = {
                volunteer: selectedVolunteer,
                event: selectedEvent,
            };
            setMatches([...matches, newMatch]);

            // Push a notification
            addNotification({
                type: "assignment",
                message: `${selectedVolunteer} has been assigned to ${selectedEvent}.`,
                time: "Just now",
            });

            // Reset form
            setSelectedVolunteer("");
            setSelectedEvent("");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Volunteer Matching</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Volunteer Dropdown */}
                <select
                    value={selectedVolunteer}
                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Volunteer</option>
                    {mockVolunteers.map((v) => (
                        <option key={v.id} value={v.name}>
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
                        <option key={ev.id} value={ev.name}>
                            {ev.name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Assign Volunteer
                </button>
            </form>

            {/* Matched Results */}
            {matches.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Assignments</h3>
                    <ul className="space-y-2">
                        {matches.map((m, idx) => (
                            <li key={idx} className="p-2 border rounded bg-gray-50 flex items-center">
                                <Check size={15} strokeWidth={4} className="mx-3 text-green-600" />
                                {m.volunteer} → {m.event}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VolunteerMatchingForm;
