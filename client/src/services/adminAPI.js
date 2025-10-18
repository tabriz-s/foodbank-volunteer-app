const API_BASE_URL = 'http://localhost:5000/api';

/* GETS */
// Fetch admin dashboard statistics
export const fetchDashboardStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Fetch recent activities
export const fetchRecentActivities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/activities`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch recent activities');
        }
        return data.data; // Extract just the activities array
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
    }
};
