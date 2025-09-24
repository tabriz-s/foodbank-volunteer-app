import React from "react";

// sample data for testing - replace later with API data
const volHistoryList = [
    {
        name: "Food Drive",
        location: "Community Center",
        date: "2025-01-12",
        skills: ["Cooking"],
        urgency: "High",
        status: "Completed",
    },
    {
        name: "Weekly Food Distribution",
        location: "Community Center",
        date: "2025-03-05",
        skills: ["Customer Service", "Teamwork"],
        urgency: "Medium",
        status: "Pending",
    },
    {
        name: "Emergency Relief Packing",
        location: "Main Food Bank Facility",
        date: "2025-03-22",
        skills: ["Food Safety Certification"],
        urgency: "High",
        status: "Canceled",
    },
    {
        name: "Neighborhood Delivery Route",
        location: "West End District",
        date: "2025-04-05",
        skills: ["Safe Driving", "CDL License"],
        urgency: "High",
        status: "Completed",
    },
];

// fetch('/api/volunteer/history') once database implemented
const VolunteerHistory = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Volunteer History
                </h2>

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
                        {volHistoryList.map((row, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-gray-50 transition-colors duration-200"
                            >
                                <td className="p-3 border">{row.name}</td>
                                <td className="p-3 border">{row.location}</td>
                                <td className="p-3 border">{row.date}</td>
                                <td className="p-3 border">{row.skills.join(", ")}</td>
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
            </div>
        </div>
    );
};

export default VolunteerHistory;
