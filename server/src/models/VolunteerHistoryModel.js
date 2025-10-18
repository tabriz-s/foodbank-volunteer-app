let volunteerHistory = {
    1: [
        {
            eventId: 101,
            name: "Food Drive",
            location: "Community Center",
            date: "2025-01-12",
            skills: ["Cooking"],
            urgency: "High",
            status: "Completed",
        },
        {
            eventId: 102,
            name: "Weekly Food Distribution",
            location: "Community Center",
            date: "2025-03-05",
            skills: ["Customer Service", "Teamwork"],
            urgency: "Medium",
            status: "Pending",
        },
    ],
    2: [
        {
            eventId: 103,
            name: "Neighborhood Delivery Route",
            location: "West End District",
            date: "2025-04-05",
            skills: ["Safe Driving", "CDL License"],
            urgency: "High",
            status: "Completed",
        },
    ],
};

/* =======================================
   Get volunteer history by volunteer ID
========================================= */
const getVolunteerHistory = (volunteerId) => {
    const id = parseInt(volunteerId);
    return volunteerHistory[id] || [];
};

/* =======================================
   Add new record when volunteer is assigned to event
   - Automatically pulls event info
   - Sets status to "Pending"
========================================= */
const addVolunteerHistory = (volunteerId, eventData) => {
    const id = parseInt(volunteerId);

    if (!volunteerHistory[id]) {
        volunteerHistory[id] = [];
    }

    const newEntry = {
        eventId: eventData.id,
        name: eventData.name,
        location: eventData.location,
        date: eventData.date,
        skills: eventData.skills || [],
        urgency: eventData.urgency,
        status: "Pending", // volunteer assigned but not completed yet
    };

    volunteerHistory[id].push(newEntry);
    return newEntry;
};

/* =======================================
   Update event info across all volunteer histories
   - If an event is edited (name, date, etc.)
   - Reflects changes in every volunteer’s history
========================================= */
const updateHistoryByEvent = (eventData) => {
    const { id: eventId, name, location, date, urgency, skills } = eventData;
    let updatedCount = 0;

    for (const volunteerId in volunteerHistory) {
        if (Object.hasOwn(volunteerHistory, volunteerId)) {
            volunteerHistory[volunteerId] = volunteerHistory[volunteerId].map(
                (entry) => {
                    if (entry.eventId === eventId) {
                        updatedCount++;
                        return {
                            ...entry,
                            name: name || entry.name,
                            location: location || entry.location,
                            date: date || entry.date,
                            urgency: urgency || entry.urgency,
                            skills: skills || entry.skills,
                        };
                    }
                    return entry;
                }
            );
        }
    }

    return updatedCount; // number of entries updated
};

/* =======================================
   Delete all history entries for a deleted event
========================================= */
const deleteHistoryByEvent = (eventId) => {
    let deletedCount = 0;

    for (const volunteerId in volunteerHistory) {
        if (Object.hasOwn(volunteerHistory, volunteerId)) {
            const before = volunteerHistory[volunteerId].length;

            volunteerHistory[volunteerId] = volunteerHistory[volunteerId].filter(
                (entry) => entry.eventId !== eventId
            );

            const after = volunteerHistory[volunteerId].length;
            deletedCount += before - after;
        }
    }

    return deletedCount;
};

module.exports = {
    getVolunteerHistory,
    addVolunteerHistory,
    updateHistoryByEvent,
    deleteHistoryByEvent,
};