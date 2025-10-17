 // handle requests for Volunteers data
 // mock data for testing

let volunteers = [
    {   // Michael Pearson
        Volunteer_id: 1,
        User_id: 1, 
        First_name: "Michael",
        Middle_name: '',
        Last_name: "Pearson",
        phone_number: '1234569999',
        address_1: '123 Main St',
        address_2: 'Apt 1A',
        city: 'Houston',
        state: 'TX',
        zip_code: '77001',
        emergency_contact: "9876543210",
        Skilled_volunteer: true, // going to need a trigger for this to switch to 'true' when skills are selected
        Available_days: 'monday,wednesday,friday', // Stored as comma-separated string
        Preferences: 'Prefer morning shifts'
    },

    {   // Raymond Smith
        Volunteer_id: 2,
        User_id: 2, 
        First_name: "Raymond",
        Middle_name: '',
        Last_name: "Smith",
        phone_number: '1234567890',
        address_1: '123 Main St',
        address_2: 'Apt 2B',
        city: 'Houston',
        state: 'TX',
        zip_code: '77001',
        emergency_contact: "9876540123",
        Skilled_volunteer: true, // going to need a trigger for this to switch to 'true' when skills are selected
        Available_days: 'friday,saturday,sunday', // Stored as comma-separated string
        Preferences: 'Prefer morning shifts'
    }
]

let nextId = 3; // simulate adding a new user

// get all volunteers
const getAllVolunteers = () => volunteers;

// get by Volunteer_id
const getVolunteerWithId = (id) => {
    return volunteers.find(v => v.Volunteer_id === parseInt(id));
};

// get by User_id
const getVolunteerWithUser_id = (userID) => {
    return volunteers.find(v => v.User_id === parseInt(userID));
};

// Create new volunteer
const createVolunteer = (volunteerData) => {
    const newVolunteer = {
        Volunteer_id: nextId++,
        ...volunteerData,
        created_at: new Date()
    };
    volunteers.push(newVolunteer);
    return newVolunteer;
};

// Update volunteer
const updateVolunteer = (id, updates) => {
    const index = volunteers.findIndex(v => v.Volunteer_id === parseInt(id));
    if (index === -1) return null;

    volunteers[index] = {
    ...volunteers[index],
    ...updates,
    updated_at: new Date()
    };
    return volunteers[index];
};

// Delete volunteer
const deleteVolunteer = (id) => {
    const index = volunteers.findIndex(v => v.Volunteer_id === parseInt(id));
    if (index === -1) return false;
    volunteers.splice(index, 1);
    return true;
};

module.exports = {
    getAllVolunteers,
    getVolunteerWithId,
    getVolunteerWithUser_id,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    volunteers
};