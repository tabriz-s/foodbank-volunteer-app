//mock data for EVENTS table
let events = [
    {
        Event_id: 1,
        name: 'UH Food Bank Distribution',
        description: 'Help distribute food packages to University of Houston students and families',
        location: 'University of Houston Student Center, University Dr, Houston, TX 77204',
        urgency: 'Medium',
        date: '2025-02-15',
        requiredSkills: [1, 7], 
        status: 'upcoming',
        created_at: '2025-01-10T10:00:00Z'
    },
    {
        Event_id: 2,
        name: 'Houston Food Bank Warehouse Sort',
        description: 'Sort and organize donated food items in the main warehouse facility',
        location: 'Houston Food Bank, Houston, TX 77029',
        urgency: 'Low',
        date: '2025-02-20',
        requiredSkills: [3, 4], 
        status: 'upcoming',
        created_at: '2025-01-12T14:30:00Z'
    },
    {
        Event_id: 3,
        name: 'Community Outreach Program',
        description: 'Engage with local community members and provide information about food bank services',
        location: 'Downtown Houston Community Center, Houston, TX 77002',
        urgency: 'High',
        date: '2025-02-10',
        requiredSkills: [7, 8], 
        status: 'active',
        created_at: '2025-01-05T09:00:00Z'
    }
];

let nextId = 4; // Auto-increment ID counter


//get all events
const getAllEvents = () => events;

//get event by Event_id
const getEventById = (id) => {
    return events.find(e => e.Event_id === parseInt(id));
};

//get events by status
const getEventsByStatus = (status) => {
    return events.filter(e => e.status === status);
};

//get events by urgency
const getEventsByUrgency = (urgency) => {
    return events.filter(e => e.urgency === urgency);
};

//get upcoming events
const getUpcomingEvents = () => {
    const today = new Date();
    return events.filter(e => new Date(e.date) >= today && e.status === 'upcoming');
};


//create new event
const createEvent = (eventData) => {
    const newEvent = {
        Event_id: nextId++,
        ...eventData,
        status: eventData.status || 'upcoming',
        created_at: new Date().toISOString()
    };
    events.push(newEvent);
    return newEvent;
};


//update event
const updateEvent = (id, updates) => {
    const index = events.findIndex(e => e.Event_id === parseInt(id));
    if (index === -1) return null;
    
    events[index] = {
        ...events[index],
        ...updates,
        updated_at: new Date().toISOString()
    };
    return events[index];
};


//delete event
const deleteEvent = (id) => {
    const index = events.findIndex(e => e.Event_id === parseInt(id));
    if (index === -1) return false;
    
    events.splice(index, 1);
    return true;
};


//count events by status
const countEventsByStatus = (status) => {
    return events.filter(e => e.status === status).length;
};

//count total events
const countTotalEvents = () => {
    return events.length;
};

module.exports = {
    getAllEvents,
    getEventById,
    getEventsByStatus,
    getEventsByUrgency,
    getUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    countEventsByStatus,
    countTotalEvents
};