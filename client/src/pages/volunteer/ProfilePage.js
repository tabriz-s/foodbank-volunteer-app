import React, { useState, useEffect} from 'react';
import { fetchProfile, createProfile, updateProfile, fetchSkills } from '../../services/ProfileAPI';
import { useAuth } from '../../contexts/AuthContext';
import { 
    fetchVolunteerNotifications, 
    fetchUnreadCount,
    volunteerMarkNotifAsRead,
    formatNotificationDate,
    getNotificationIcon,
    getNotificationColor
} from '../../services/NotificationAPI';
import { User, Settings, Award, Calendar, History, CalendarDays, Bell } from 'lucide-react';

const ProfilePage = () => {

    // mock user data - using user with ID 1. 
    // final app should use authentication content
    //const CURRENT_USER_ID = 1; // change to 3+ to test "new user" change in Profile controller to change user
    const { userId, volunteerId } = useAuth(); // Get real user ID from context

    const [profileData, setProfileData] = useState({
        full_name: '',
        phone_number: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        zip_code: '',
        skills: [],
        preferences: '',
        availability_days: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [activeSection, setActiveSection] = useState('personal-info');
    const [profileExists, setProfileExists] = useState(false); // check if the user is new or already in the database
    const [isEditMode, setIsEditMode] = useState(false); // check if the user editing or viewing page
    const [originalProfileData, setOriginalProfileData] = useState(null); // store original profile data for when the user hits the cancel button (revert to this state when clicked)
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [noNewNotifs, setNoNewNotifs] = useState(false);

    
    
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // load in available skills
                const skills = await fetchSkills();
                setAvailableSkills(skills);

                // fetch existing profile if it exists - GET
                try {
                    const response = await fetchProfile(userId);

                    // if profile exists
                    if (response.success && response.data) {
                        const volunteer = response.data; // data received 

                        // parse the data from the backend (databse in the future) to put full name and days on one line 
                        const fullName = `${volunteer.First_name} ${volunteer.Middle_name ? volunteer.Middle_name + ' ' : ''}${volunteer.Last_name}`.trim(); 
                        const availabilityDays = volunteer.Available_days ? volunteer.Available_days.split(',') : [];
                        
                        // extract skills from backend response
                        const volunteerSkills = volunteer.skills || [];

                        // convert skills to fit frontend format
                        const loadedSkills = volunteerSkills.map(skill => {

                            // Format date from "2023-01-15T06:00:00.000Z" from database to "2023-01-15"
                            let dateAcquired = '';
                            if (skill.Date_acquired) {
                                const date = new Date(skill.Date_acquired);
                                dateAcquired = date.toISOString().split('T')[0];
                            }

                            return {
                                Skills_id: skill.Skills_id,
                                Description: skill.Description,  // ← Add this
                                Category: skill.Category,        // ← Add this
                                Experience_level: skill.Experience_level.toLowerCase(), // toLowerCase() used because frontend expects in lowercase but backend is in uppercase
                                Date_acquired: dateAcquired
                            };

                            /*
                            Skills_id: skill.Skills_id,
                            Experience_level: skill.Experience_level,
                            Date_acquired: skill.Date_acquired
                            */
                        });

                        // populate form with fetched data
                        const loadedProfileData = {
                            full_name: fullName,
                            phone_number: volunteer.Phone_number || '',
                            address_1: volunteer.Address_1  || '',
                            address_2: volunteer.Address_2  || '',
                            city: volunteer.City  || '',
                            state: volunteer.State || '',
                            zip_code: volunteer.Zip_code || '',
                            skills: loadedSkills, // skills loaded into the form
                            preferences: volunteer.Preferences || '',
                            availability_days: availabilityDays
                        };
                        
                        
                        setProfileData(loadedProfileData); // set current data
                        setOriginalProfileData(loadedProfileData) // set original data in the event of canceling an update/edit
                        setProfileExists(true);
                        setIsEditMode(false); // starts in view mode
                    }
                } catch (profileError) {
                    console.log("No existing profile found - new user");
                    setProfileExists(false);
                    setIsEditMode(true); // user does not exists so they must add in their info
                }

                // load notifications
                if (volunteerId) {
                    await loadNotifications();
                }
            } catch (error) {
                console.error("Error loading dataset:", error);
                setErrors({ submit: "Failed to load data. Refresh the page."});

            } finally {
                setLoading(false);
            }
        };

        loadData();

    }, [userId, volunteerId]);

    // Refresh notifications when user opens the notifications tab
    useEffect(() => {
        if (activeSection === 'notifications' && volunteerId) {
            loadNotifications(false); // false = not manual refresh
        }
    }, [activeSection, volunteerId]);
    
    // Load notifications for volunteer
    const loadNotifications = async (isManualRefresh = false) => {
        if (!volunteerId) return;
        
        try {
            setNotificationsLoading(true);
            if (isManualRefresh) setNoNewNotifs(false); // Clear message when refreshing
            
            const response = await fetchVolunteerNotifications(volunteerId);
            if (response.success) {
                const newNotifications = response.data || [];
                
                // Check if there are new notifications when manually refreshing
                if (isManualRefresh) {
                    const hasNewNotifs = newNotifications.some(notif => 
                        !notifications.find(old => old.Notification_delivery_id === notif.Notification_delivery_id)
                    );
                    
                    if (!hasNewNotifs && notifications.length > 0) {
                        setNoNewNotifs(true);
                        setTimeout(() => setNoNewNotifs(false), 3000); // Hide after 3 seconds
                    }
                }
                
                setNotifications(newNotifications);
            }
            
            // Also fetch unread count
            const countResponse = await fetchUnreadCount(volunteerId);
            if (countResponse.success) {
                setUnreadCount(countResponse.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    };

    // handle text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // clear the error when the user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // handle skill checkbox inputs
    const handleSkillToggle = (skillId) => {
        setProfileData(prev => {
            const existingSkill = prev.skills.find(s => s.Skills_id === skillId); // checking if skill exists

            // checking and unchecking skills when clicked
            if (existingSkill) {    // if skills exists, uncheck it
                return {
                    ...prev,
                    skills: prev.skills.filter(s => s.Skills_id !== skillId)
                };
            } else {                // if skill does not exist, check it
                const newSkill = {
                    Skills_id: skillId,
                    experience_level: 'beginner', // default if user doesn't select experience level
                    Date_acquired: new Date().toISOString().split('T')[0] // default to current date if user does not select
                };
                return {
                    ...prev,
                    skills: [...prev.skills, newSkill]
                };
            }
        });

        /* old code
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.includes(skillId)
                ? prev.skills.filter(id => id !== skillId)  // Remove if already selected
                : [...prev.skills, skillId]                 // Add if not selected
        }));
        */
    };

    // handle day selection for availability
    const handleDayToggle = (day) => {
        setProfileData(prev => ({
            ...prev,
            availability_days: prev.availability_days.includes(day)
                ? prev.availability_days.filter(d => d !== day)
                : [...prev.availability_days, day]
        }));
    };

    // Handle experience level change for a specific skill
    const handleSkillExperienceChange = (skillId, newExperience) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.map(skill => 
                skill.Skills_id === skillId
                    ? { ...skill, Experience_level: newExperience } // Update this skill's experience
                    : skill // Keep other skills unchanged
            )
        }));
    };

    // Handle date change for a specific skill
    const handleSkillDateChange = (skillId, newDate) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.map(skill =>
                skill.Skills_id === skillId
                    ? { ...skill, Date_acquired: newDate } // Update this skill's date
                    : skill // Keep other skills unchanged
            )
        }));
    };

    // Handle marking notification as read
    const handleMarkAsRead = async (notificationDeliveryId) => {
        try {
            const response = await volunteerMarkNotifAsRead(notificationDeliveryId);
            if (response.success) {
                // Update local state
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.Notification_delivery_id === notificationDeliveryId
                            ? { ...notif, Is_read: 1, Read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };


    // validate name, skills, and avilability
    const validateForm = () => {
        const newErrors = {};

        // Check for name and that it is not more than 50 characters
        if (!profileData.full_name.trim()) {
        newErrors.full_name = 'Full name is required';
        } else if (profileData.full_name.length > 50) {
        newErrors.full_name = 'Full name must be 50 characters or less';
        }

        ///
        // Skills validation - at least 1 skill is needed
        if (profileData.skills.length === 0) {
            newErrors.skills = 'Please select at least one skill';
        } else {
            // Validate each skill has required fields
            for (let i = 0; i < profileData.skills.length; i++) {
                const skill = profileData.skills[i];
                
                // Check if Experience_level exists and is valid
                const validLevels = ['beginner', 'intermediate', 'expert'];
                if (!skill.Experience_level || !validLevels.includes(skill.Experience_level.toLowerCase())) {
                    newErrors.skills = `Skill ${i + 1}: Please select an experience level`;
                    break;
                }
                
                // Check if Date_acquired exists and is valid
                if (!skill.Date_acquired) {
                    newErrors.skills = `Skill ${i + 1}: Please select a date acquired`;
                    break;
                }
                
                // Validate date format (YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(skill.Date_acquired)) {
                    newErrors.skills = `Skill ${i + 1}: Invalid date format`;
                    break;
                }
            }
        }

        // Check address fields
        if (!profileData.address_1.trim()) {    // Address Line 1 validation
            newErrors.address_1 = 'Address Line 1 is required';
        } else if (profileData.address_1.length > 100) {
            newErrors.address_1 = 'Address Line 1 must be 100 characters or less';
        }

        if (profileData.address_2.length > 100) {   // Address Line 2 validation (optional)
            newErrors.address_2 = 'Address Line 2 must be 100 characters or less';
        }
       
        if (!profileData.city.trim()) {         // City validation
            newErrors.city = 'City is required';
        } else if (profileData.city.length > 100) {
            newErrors.city = 'City must be 100 characters or less';
        }

        if (!profileData.state) {               // State validation
            newErrors.state = 'State is required';
        }
        
        if (!profileData.zip_code.trim()) {     // Zip code validation
            newErrors.zip_code = 'Zip code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(profileData.zip_code.trim())) {
            newErrors.zip_code = 'Please enter a valid zip code (12345 or 12345-6789)';
        }

        // phone number
        if (!profileData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(profileData.phone_number)) {
            newErrors.phone_number = 'Please enter a valid phone number';
        }
        
        // removes specific dates from avalability list
        if (profileData.availability_days.length === 0) {
            newErrors.availability_dates = 'Please select at least one available date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Edit button click
    const handleEditClick = () => {
        setIsEditMode(true);
        setSuccess(false);
        setErrors({});
    }

    // Handle Cancel edit button
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setErrors({});
        // reload previous data before an edit was made
        if (originalProfileData) {
            setProfileData({...originalProfileData});
        }
    }
    
    // submit form to the backend
    const handleSubmit = async (event) => {
        event.preventDefault();

        // validate form before allowing submission
        if (!validateForm()) {
            return;
        };

        setSaving(true);
        setSuccess(false); // clear any previous success messege
        setErrors({});

        try {
            let response;

            if (profileExists) {
                // update the data (PUT)
                response = await updateProfile(userId, profileData);

                if (response.success) {

                    setOriginalProfileData({...profileData});
                    setIsEditMode(false); // done editing/updating - back to view mode
                    setSuccess(true);
                    console.log("Profile updated:", response.data);

                    setTimeout(() => setSuccess(false), 3000); // clear message after a certain ammount of time
                } else {
                    // handle the backend returning false
                    setErrors({ submit: response.message || 'Failed to update profile.' })
                }
                
            } else {
                // create a new profile - new user
                response = await createProfile({
                    ...profileData,
                    user_id: userId // should be a new user.
                });

                if (response.success) {
                    setOriginalProfileData({...profileData}); // store new profile 
                    setProfileExists(true); // profile created so make true
                    setIsEditMode(false); // done editing/updating - back to view mode
                    setSuccess(true);
                    console.log('Profile created:', response.data);

                    setTimeout(() => setSuccess(false), 3000); // clear message after a certain ammount of time
                } else {
                    // Handle backend returning success: false
                    setErrors({ submit: response.message || 'Failed to create profile.' });
                }
            }

        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors({ submit: error.message || 'Failed to save profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const skillsByCategory = availableSkills.reduce((acc, skill) => {
        if (!acc[skill.Category]) {
            acc[skill.Category] = [];
        }
        acc[skill.Category].push(skill);
        return acc;
    }, {});

    // define the webpages side navbar
    const sidebarItems = [
        { id: 'personal-info', label: 'Personal Info', icon: User },
        { id: 'skills', label: 'Skills', icon: Award },
        { id: 'email-password', label: 'Email & Password', icon: Settings },
        { id: 'availability', label: 'Availability', icon: Calendar },
        { id: 'notifications', label: 'Notifications', icon: Bell } 
    ]; 

    // render volunteers personal info when this section of the navbar is selected
    const renderPersonalInfo = () => {
        const states = [
            { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
            { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
            { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
            { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
            { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
            { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
            { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
            { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
            { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
            { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
            { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
            { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
            { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
            { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
            { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
            { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
            { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
        ];

        const isReadOnly = profileExists && !isEditMode; // Check if user is viewing or editing

        return (
            <div className="space-y-6">

                {/* ----Name Section---- */}
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleInputChange}
                        maxLength="50"
                        placeholder="Enter First and Last Name"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } ${errors.full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name}</p>
                    )}
                    {!isReadOnly && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{profileData.full_name.length}/50 characters</p>
                    )}
                </div>

                {/* ----Phone Number Section---- */}
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleInputChange}
                        placeholder="(123) 456-7890"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } ${errors.phone_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone_number}</p>
                    )}
                </div>
                
                {/* ------Address Section------ */}

                {/* Address Line 1 */}
                <div>
                    <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        id="address_1"
                        name="address_1"
                        value={profileData.address_1}
                        onChange={handleInputChange}
                        maxLength="100"
                        placeholder="Street address"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } ${errors.address_1 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.address_1 && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address_1}</p>
                    )}
                    {!isReadOnly && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{profileData.address_1.length}/100 characters</p>
                    )}
                </div>

                {/* Address Line 2 */}
                <div>
                    <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address Line 2
                    </label>
                    <input 
                        type="text"
                        id="address_2"
                        name="address_2"
                        value={profileData.address_2}
                        onChange={handleInputChange}
                        maxLength="100"
                        placeholder="Apartment, suite, etc. (optional)"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } ${errors.address_2 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.address_2 && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address_2}</p>
                    )}
                    {!isReadOnly && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{profileData.address_2.length}/100 characters</p>
                    )}
                </div>
                
                {/* City */}
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        id="city"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        maxLength="100"
                        placeholder="City"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                    )}
                    {!isReadOnly && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{profileData.city.length}/100 characters</p>
                    )}
                </div>

                {/* State and Zip Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* State */}
                    <div>
                         <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="state"
                            name="state"
                            value={profileData.state}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                                isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                            } ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <option value="">Select State</option>
                            {states.map(state => (
                                <option key={state.code} value={state.code}>{state.name}</option>
                            ))}
                        </select>
                        {errors.state && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
                        )}
                    </div>

                    {/* Zip Code */}
                    <div>
                        <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text"
                            id="zip_code"
                            name="zip_code"
                            value={profileData.zip_code}
                            onChange={handleInputChange}
                            maxLength="9"
                            placeholder="12345 or 12345-6789"
                            disabled={isReadOnly}
                            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                                isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                            } ${errors.zip_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.zip_code && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zip_code}</p>
                        )}
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferences (Optional)
                        </label>
                        <textarea
                        id="preferences"
                        name="preferences"
                        value={profileData.preferences}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any preferences for volunteering (e.g., preferred time slots, special accommodations needed, etc.)"
                        disabled={isReadOnly}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        } border-gray-300 dark:border-gray-600`}
                    />
                </div>
            </div>
        );
    };

    // display the users skillset
    const renderSkills = () => {
        const isReadOnly = profileExists && !isEditMode; // check if user is viewing or editing
        const isSkillSelected = (skillId) => {
            return profileData.skills.some(s => s.Skills_id === skillId);   // check if skill(s) is selected
        };
        const getSkillDetails = (skillId) => {
            return profileData.skills.find(s => s.Skills_id === skillId);   // get skill details if selected
        };

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isReadOnly ? 'Your Skills' : 'Select Your Skills'}
                    </h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
                        {Object.entries(skillsByCategory).map(([category, skills]) => (
                            <div key={category} className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide text-primary-600 dark:text-primary-400">
                                    {category.replace('_', ' ')}
                                </h4>
                                <div className="space-y-4">
                                    {skills.map((skill) => {
                                        const selected = isSkillSelected(skill.Skills_id);  // check if skill selected
                                        const skillDetails = getSkillDetails(skill.Skills_id); // Get details of skills if selected

                                        return (
                                            <div key={skill.Skills_id} className="space-y-2">
                                                {/* Checkbox Section of skills*/}
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => handleSkillToggle(skill.Skills_id)}
                                                        disabled={isReadOnly}
                                                        className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-500 rounded ${
                                                            isReadOnly ? 'cursor-not-allowed opacity-60' : ''
                                                        }`}
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {skill.Description}
                                                    </span>
                                                </label>
                                                
                                                {/* Show experience and date inputs when skill is selected */}
                                                {selected && (
                                                    <div className="ml-7 space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {/* Experience Level Dropdown */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Experience Level <span className="text-red-500">*</span>
                                                                </label>
                                                                <select
                                                                    value={skillDetails?.Experience_level || 'beginner'}
                                                                    onChange={(e) => handleSkillExperienceChange(skill.Skills_id, e.target.value)}
                                                                    disabled={isReadOnly}
                                                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                                        isReadOnly ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''
                                                                    }`}
                                                                >
                                                                    <option value="beginner">Beginner</option>
                                                                    <option value="intermediate">Intermediate</option>
                                                                    <option value="expert">Expert</option>
                                                                </select>
                                                            </div>
                                                            
                                                            {/* Date Acquired Picker */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Date Acquired <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={skillDetails?.Date_acquired || ''}
                                                                    onChange={(e) => handleSkillDateChange(skill.Skills_id, e.target.value)}
                                                                    disabled={isReadOnly}
                                                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                                        isReadOnly ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''
                                                                    }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    {errors.skills && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.skills}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {profileData.skills.length} skill{profileData.skills.length !== 1 ? 's' : ''} selected
                    </p>
                </div>
            </div>
        );
    };
   
    // this is to show the email the volunteer used to log in
    // This is just for now - update later to show only the email and an option to change their password
    const renderEmailPassword = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Settings className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Account Security</h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>Email and password changes are handled through your account settings. Contact support if you need assistance with account security.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    // renders the volunteers availability to help
    const renderAvailability = () => {
        const daysOfWeek = [
            { id: 'monday', label: 'Monday' },
            { id: 'tuesday', label: 'Tuesday' },
            { id: 'wednesday', label: 'Wednesday' },
            { id: 'thursday', label: 'Thursday' },
            { id: 'friday', label: 'Friday' },
            { id: 'saturday', label: 'Saturday' },
            { id: 'sunday', label: 'Sunday' }
        ];

        const isReadOnly = profileExists && !isEditMode;
        
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Weekly Availability</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {isReadOnly ? 'Days of week you are generally available to volunteer.' : 
                            'Select the days of the week when you are generally available to volunteer'}
                    </p>

                    <div className="space-y-3">
                        {daysOfWeek.map((day) => (
                            <label key={day.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profileData.availability_days.includes(day.id)}
                                    onChange={() => handleDayToggle(day.id)}
                                    disabled={isReadOnly}
                                    className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-500 rounded ${
                                        isReadOnly ? 'cursor-not-allowed opacity-60' : ''
                                    }`}
                                />
                                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{day.label}</span>
                            </label>
                        ))}
                    </div>

                    {profileData.availability_days.length > 0 && (
                        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl">
                            <p className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-2">Selected Days</p>
                            <div className="flex flex-wrap gap-2">
                                {profileData.availability_days.map((dayId) =>{
                                    const day = daysOfWeek.find(d => d.id === dayId);
                                    return (
                                        <span
                                            key={dayId}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                                        >
                                            {day?.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {errors.availability_days && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.availability_days}</p>
                    )}
                </div>
            </div>
        );
    };

    // Render the volunteers notifications
    const renderNotifications = () => {
        return (
            <div className="space-y-4">
                {/* Notifications Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Your Notifications</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Stay updated on event assignments, opportunities, and changes
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {unreadCount} unread
                            </span>
                        )}
                        <button
                            onClick={() => loadNotifications(true)}
                            disabled={notificationsLoading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className={`h-4 w-4 mr-2 ${notificationsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* No New Notifications Notice */}
                {noNewNotifs && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-blue-700">No new notifications</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {notificationsLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    /* Notifications List */
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.Notification_delivery_id}
                                className={`relative p-4 rounded-lg border-2 transition-all ${
                                    notification.Is_read 
                                        ? 'bg-white border-gray-200 opacity-75' 
                                        : getNotificationColor(notification.Notification_type)
                                }`}
                            >
                                {/* Unread Indicator */}
                                {!notification.Is_read && (
                                    <div className="absolute top-4 right-4">
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                    </div>
                                )}

                                {/* Notification Content */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 text-2xl mr-3">
                                        {getNotificationIcon(notification.Notification_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Subject */}
                                        <p className={`text-sm font-semibold ${
                                            notification.Is_read ? 'text-gray-700' : 'text-gray-900'
                                        }`}>
                                            {notification.Subject}
                                        </p>
                                        
                                        {/* Message */}
                                        <p className={`mt-1 text-sm ${
                                            notification.Is_read ? 'text-gray-500' : 'text-gray-700'
                                        }`}>
                                            {notification.Message}
                                        </p>

                                        {/* Event Details (if available) */}
                                        {notification.Event_name && (
                                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                                <span className="font-medium">{notification.Event_name}</span>
                                                {notification.Event_date && (
                                                    <span className="ml-2">
                                                        • {new Date(notification.Event_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                <span>{formatNotificationDate(notification.Delivered_at)}</span>
                                                <span>•</span>
                                                <span className="capitalize">{notification.Notification_type}</span>
                                            </div>

                                            {/* Mark as Read Button */}
                                            {!notification.Is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.Notification_delivery_id)}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // loading check
    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading user information...</p>
                </div>
            </div>
        );
    }

    // switch between what content to render depedning on clicked selection from navbar
    // personal info is the default
    const renderContent = () => {
        switch (activeSection) {
            case 'personal-info':
                return renderPersonalInfo();
            case 'skills':
                return renderSkills();
            case 'email-password':
                return renderEmailPassword();
            case 'availability':
                return renderAvailability();
            case 'notifications':
                return renderNotifications();
            default:
                return renderPersonalInfo();
        }
    };

    /* ----- Render Page ----- */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">

                            {/* -----Sidebar Section----- */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Management</h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            {profileExists
                                                ? (isEditMode ? "Edit your information" : "View your volunteer information")
                                                : 'Complete your volunteer profile'
                                            }
                                        </p>
                                    </div>
                                    {/* get buttons for each item in sidebarItems array */}
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            // make blue if item is active - gray if not 
                                            className={`${      
                                                activeSection === item.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                                    : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            } group border-l-4 px-6 py-3 flex items-center text-sm font-medium w-full text-left transition-colors`}
                                        >
                                            <item.icon className="h-5 w-5 mr-3" />
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* -----Main Content Section----- */}
                            <form className="divide-y divide-gray-200 dark:divide-gray-700 lg:col-span-9" onSubmit={handleSubmit}>
                                <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                    {success && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        {profileExists ? 'Profile updated successfully!' : 'Profile created successfully!'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{sidebarItems.find(item => item.id === activeSection)?.label}</h2>
                                    </div>

                                    {renderContent()}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="pt-6 px-4 sm:px-6 pb-6">
                                    {errors.submit && (
                                        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                                    )}
                                    <div className="flex justify-end gap-3">
                                        {profileExists && !isEditMode ? (
                                            // View mode - show an Edit button
                                            <button
                                                type="button"
                                                onClick={handleEditClick}
                                                className="py-3 px-6 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg"
                                            >
                                                Edit Profile
                                            </button>
                                        ) : (
                                            // Edit/Create mode - Shows a cancel and save button
                                            <>
                                                {profileExists && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        className="py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className={`py-3 px-6 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg ${
                                                        saving 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-primary-600 hover:bg-primary-700'
                                                    }`}
                                                >
                                                    {saving ? 'Saving data...' : (profileExists ? 'Save Changes' : 'Create Profile')}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ----- Volunteer History Section ----- */}
                    <div className="mt-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <History className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Volunteer History
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            View your past volunteer events and participation status.
                        </p>
                        
                            
                        <a href="/volunteer/history"
                            className="inline-flex items-center bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md">
                            <History className="h-4 w-4 mr-2" />
                            View History
                        </a>
                    </div>
                    
                    {/* ----- Event Registration Section ----- */}
                    <div className="mt-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Event Registration
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Browse and register for upcoming volunteer events that match your skills.
                        </p>
                        
                            
                        <a href="/volunteer/register-events"
                            className="inline-flex items-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Browse Events
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;