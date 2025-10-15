const API_BASE_URL = 'http://localhost:5000/api';

// IMPORTANT:
 //MAKE BACKEND ENDPOINTS FOR SKILLS

 
/* GETS */
// fetch profile for the user (volunteer)
export const fetchProfile = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/volunteers/profile?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        // backend failure
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
        const response = await fetch(`${API_BASE_URL}/skills`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        // backend failure
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch skills');
        }

        // Backend returns: { success: true, count: 9, data: [...skills] }
        // Extract just the skills array - response.data
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
        const response = await fetch(`${API_BASE_URL}/volunteers/profile`, {
           method: 'POST',
           headers: {
            'Content-Type': 'application/json',
           },
           credentials: 'include',
           body: JSON.stringify(profileData)
        });

        const data = await response.json();

        // backend failure
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
        const response = await fetch(`${API_BASE_URL}/volunteers/profile?user_id=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        // backend failure
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

/*
// Fetch available skills ( I need to create backend enpoints for this.)
export const fetchSkills = async () => {
    // For now, return mock data until you create the backend endpoint
    return [
        { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' },
        { Skills_id: 2, Description: 'Food Safety Certification', Category: 'Food_Preparation' },
        { Skills_id: 3, Description: 'Heavy Lifting', Category: 'Warehouse' },
        { Skills_id: 4, Description: 'Inventory Management', Category: 'Warehouse' },
        { Skills_id: 5, Description: 'CDL License', Category: 'Transportation' },
        { Skills_id: 6, Description: 'Safe Driving', Category: 'Transportation' },
        { Skills_id: 7, Description: 'Customer Service', Category: 'Distribution' },
        { Skills_id: 8, Description: 'Spanish Speaking', Category: 'Communication' },
        { Skills_id: 9, Description: 'First Aid Certification', Category: 'Safety' }
    ];
};
*/