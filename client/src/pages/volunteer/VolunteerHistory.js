import React, { useEffect, useState } from "react";
import { fetchVolunteerHistory } from "../../services/VolunteerHistoryAPI";
import { useAuth } from "../../contexts/MockAuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const VolunteerHistory = () => {
    const { userRole } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [volunteerName, setVolunteerName] = useState("");
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(1); // default, for simulation
    const [isAdmin, setIsAdmin] = useState(userRole === "admin");

    // Simulate logged-in user (replace with real auth later)
    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetch("http://localhost:5000/api/auth/me");
            const data = await response.json();
            if (data.success && data.user) {
                setIsAdmin(data.user.role === "admin");
                setSelectedVolunteer(
                    data.user.role === "admin" ? "" : data.user.id
                );
            }
        };
        fetchUser();
    }, []);

    // Fetch volunteer list (only if admin)
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

    // Fetch history when volunteer changes
    useEffect(() => {
        if (!selectedVolunteer) return;

        setLoading(true);
        fetchVolunteerHistory(selectedVolunteer)
            .then((data) => {
                if (data.success) {
                    setHistory(data.data);
                    setVolunteerName(data.volunteerName);
                    setError(null);
                } else {
                    // Fallback if API responds with success: false
                    setHistory([]);
                    setError(null);
                }
            })
            .catch((err) => {
                // Handle 404
                if (err.message?.includes("No history found")) {
                    setHistory([]);
                    setError(null);
                } else {
                    setError(err.message || "Failed to load history");
                }
            })
            .finally(() => setLoading(false));
    }, [selectedVolunteer]);

    if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {volunteerName
                            ? `${volunteerName}'s Volunteer History`
                            : "Volunteer History"}
                    </h2>

                    {/* Dropdown only visible for admin */}
                    {isAdmin && (
                        <select
                            value={selectedVolunteer}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                setSelectedVolunteer(selectedId);

                                const chosen = volunteers.find((v) => v.id.toString() === selectedId);
                                setVolunteerName(chosen ? chosen.name : "");
                            }}
                            className="mt-3 md:mt-0 border border-gray-300 rounded px-4 py-2 text-gray-700"
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
                    {history.length === 0 ? (
                        <p className="text-gray-600 mt-4">No history found.</p>
                    ) : (
                        <table className="w-full border border-gray-200 rounded-lg mb-16">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border text-left">Event</th>
                                <th className="p-3 border text-left">Location</th>
                                <th className="p-3 border text-left">Date</th>
                                <th className="p-3 border text-left">Skills</th>
                                <th className="p-3 border text-left">Urgency</th>
                                <th className="p-3 border text-left">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <td className="p-3 border relative group">
                                        <span className="hover:text-blue-600">{row.Event}</span>
                                        <div
                                            className="absolute z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100
                  bg-gray-100 text-gray-800 text-sm rounded-md px-3 py-2
                  top-full left-1/2 -translate-x-1/2 mt-2 w-60 shadow-lg
                  transition-opacity duration-300 ease-in-out"
                                        >
                                            {row.EventDescription || "No description available"}
                                        </div>
                                    </td>
                                    <td className="p-3 border">{row.Location}</td>
                                    <td className="p-3 border">
                                        {new Date(row.EventDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 border">
                                        {Array.isArray(row.Skills)
                                            ? row.Skills.join(", ")
                                            : row.Skills || "Any"}
                                    </td>
                                    <td className="p-3 border">{row.Urgency}</td>
                                    <td
                                        className={`p-3 border font-semibold ${
                                            row.Status === "Attended"
                                                ? "text-green-600"
                                                : row.Status === "Registered"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                        }`}
                                    >
                                        {row.Status}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VolunteerHistory;
