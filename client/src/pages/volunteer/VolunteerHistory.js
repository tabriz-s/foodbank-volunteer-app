import React, { useEffect, useState } from "react";
import { fetchVolunteerHistory } from "../../services/VolunteerHistoryAPI";

const VolunteerHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [volunteerName, setVolunteerName] = useState("");

    const volunteerId = 1; // temporary until login integration

    useEffect(() => {
        fetchVolunteerHistory(volunteerId)
            .then((data) => {
                if (data.success) {
                    setHistory(data.data);
                    setVolunteerName(data.name);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [volunteerId]);

    if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {volunteerName
                        ? `${volunteerName}'s Volunteer History`
                        : "Volunteer History"}
                </h2>

                {history.length === 0 ? (
                    <p className="text-gray-600">No history found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
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
                                    <td className="p-3 border">{row.name}</td>
                                    <td className="p-3 border">{row.location}</td>
                                    <td className="p-3 border">{row.date}</td>
                                    <td className="p-3 border">
                                        {Array.isArray(row.skills)
                                            ? row.skills.join(", ")
                                            : row.skills}
                                    </td>
                                    <td className="p-3 border">{row.urgency}</td>
                                    <td
                                        className={`p-3 border font-semibold ${
                                            row.status === "Completed"
                                                ? "text-green-600"
                                                : row.status === "Pending"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                        }`}
                                    >
                                        {row.status}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerHistory;
