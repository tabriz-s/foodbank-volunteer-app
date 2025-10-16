const volunteerHistory = {
    1: [ // Volunteer id
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
    ],
    2: [ // Volunteer id
        {
            name: "Neighborhood Delivery Route",
            location: "West End District",
            date: "2025-04-05",
            skills: ["Safe Driving", "CDL License"],
            urgency: "High",
            status: "Completed",
        },
    ],
};

export const getVolunteerHistory = (volunteerId) => {
    return volunteerHistory[volunteerId] || [];
};
