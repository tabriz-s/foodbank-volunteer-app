const API_BASE_URL = 'http://localhost:5000/api';

/* GETS */
// fetch profile for the user (volunteer)
export const fetchProfile = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/db/profile?user_id=${userId}`, {  // ← Added /db
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch profile');
        }

        return data;
    } catch (error) {
        console.error("Error fetching profile", error);
        throw error;
    }
};

// get skills (only skills)
export const fetchSkills = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/skills/db`, {  // ← Added /db
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch skills');
        }

        return data.data; 
    } catch (error) {
        console.error('Error fetching skills:', error);
        throw error;
    }
};

/* POSTS */
// create a new profile
export const createProfile = async (profileData) => {
    try{
        const response = await fetch(`${API_BASE_URL}/volunteers/db/profile`, {  // ← Added /db
           method: 'POST',
           headers: {
            'Content-Type': 'application/json',
           },
           credentials: 'include',
           body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create profile');
        }

        return data;
    } catch (error) {
        console.error("Error, could not create profile", error);
        throw error;
    }
};

/* PUTS */
// Update existing user profile
export const updateProfile = async (userId, profileData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/db/profile?user_id=${userId}`, {  // ← Added /db
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};