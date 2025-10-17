let volunteerMatches = []; // { volunteerId, eventId, dateMatched }

const addMatch = (volunteerId, eventId) => {
    const newMatch = {
        volunteerId: parseInt(volunteerId),
        eventId: parseInt(eventId),
        dateMatched: new Date().toISOString().split("T")[0],
    };
    volunteerMatches.push(newMatch);
    return newMatch;
};

const getAllMatches = () => volunteerMatches;

const getMatchesByVolunteer = (volunteerId) =>
    volunteerMatches.filter((m) => m.volunteerId === parseInt(volunteerId));

const deleteMatch = (volunteerId, eventId) => {
    const before = volunteerMatches.length;
    volunteerMatches = volunteerMatches.filter(
        (m) => !(m.volunteerId === parseInt(volunteerId) && m.eventId === parseInt(eventId))
    );
    return before !== volunteerMatches.length;
};

module.exports = { addMatch, getAllMatches, getMatchesByVolunteer, deleteMatch };
