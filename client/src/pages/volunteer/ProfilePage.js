import React, { useState, useEffect} from 'react';

const ProfilePage = () => {
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
    const [success, setSuccess] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [activeSection, setActiveSection] = useState('personal-info');
    
    // mock data for testing - replace with real data once database is connected
    useEffect(() => {
        // This would be an API call: fetch('/api/skills') <- example
        setAvailableSkills([
            { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' },
            { Skills_id: 2, Description: 'Food Safety Certification', Category: 'Food_Preparation' },
            { Skills_id: 3, Description: 'Heavy Lifting', Category: 'Warehouse' },
            { Skills_id: 4, Description: 'Inventory Management', Category: 'Warehouse' },
            { Skills_id: 5, Description: 'CDL License', Category: 'Transportation' },
            { Skills_id: 6, Description: 'Safe Driving', Category: 'Transportation' },
            { Skills_id: 7, Description: 'Customer Service', Category: 'Distribution' },
            { Skills_id: 8, Description: 'Spanish Speaking', Category: 'Communication' },
            { Skills_id: 9, Description: 'First Aid Certification', Category: 'Safety' }
        ]);

        
        // This would be: fetchProfileData();
    }, []);
    
    // handle text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // clear the error when the user startys typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // handle skill checkbox inputs
    const handleSkillToggle = (skillId) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.includes(skillId)
            ? prev.skills.filter(id => id !== skillId)  // Remove if already selected
            : [...prev.skills, skillId]                 // Add if not selected
        }));
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


    // validate name, skills, and avilability
    const validateForm = () => {
        const newErrors = {};

        // Check for name and that it is not more than 50 characters
        if (!profileData.full_name.trim()) {
        newErrors.full_name = 'Full name is required';
        } else if (profileData.full_name.length > 50) {
        newErrors.full_name = 'Full name must be 50 characters or less';
        }

        // Skills validation - one skill is required
        if (profileData.skills.length === 0) {
        newErrors.skills = 'Please select at least one skill';
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
        
        // removes specific dates from avalability list
        if (profileData.availability_days.length === 0) {
            newErrors.availability_dates = 'Please select at least one available date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // validate form before allowing submission
        if (!validateForm()) {
            return;
        };

        setLoading(true);
        setSuccess(false); // clear any previous success messege

        try {
            /*
            there should be an POST API call here
            change when front end is complete and test with real data
            */

            // sumulate API Call for testing
            await new Promise(resolve => setTimeout(resolve, 1000)); // sending data simulation - small wait time
            
            setSuccess(true);
            console.log('Profile saved:', profileData);

        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        } finally {
            setLoading(false);
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
        {
            id: 'personal-info',
            label: 'Personal Info',
        },
        {
            id: 'skills',
            label: 'Skills'
        },
        {
            id: 'email-password',
            label: 'Email & Password'
        },
        {
            id: 'availability',
            label: 'Availability'
        }
    ]; 

    // render volunteers personal info when thsi section of the navbar is selected
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

        return (
            <div className="space-y-6">

                {/* ----Name Section---- */}
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.full_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{profileData.full_name.length}/50 characters</p>
                </div>

                {/* ----Phone Number Section---- */}
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleInputChange}
                        placeholder="(123) 456-7890"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phone_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                </div>
                
                {/* ------Address Section------ */}

                {/* Address Line 1 */}
                <div>
                    <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.address_1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.address_1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.address_1}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{profileData.address_1.length}/100 characters</p>
                </div>

                {/* Address Line 2 */}
                <div>
                    <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.address_2 ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.address_2 && (
                        <p className="mt-1 text-sm text-red-600">{errors.address_2}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{profileData.address_2.length}/100 characters</p>
                </div>
                
                {/* City */}
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{profileData.city.length}/100 characters</p>
                </div>

                {/* State and Zip Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* State */}
                    <div>
                         <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="state"
                            name="state"
                            value={profileData.state}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select State</option>
                            {states.map(state => (
                            <option key={state.code} value={state.code}>{state.name}</option>
                            ))}
                        </select>
                        {errors.state && (
                            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                        )}
                    </div>
                    {/* Zip Code */}
                    <div>
                        <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.zip_code ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.zip_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                        )}
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferences (Optional)
                        </label>
                        <textarea
                        id="preferences"
                        name="preferences"
                        value={profileData.preferences}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any preferences for volunteering (e.g., preferred time slots, special accommodations needed, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        );
    };

    // display the users skillset
    const renderSkills = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Your Skills</h3>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide text-blue-600">
                                {category.replace('_', ' ')}
                            </h4>
                            <div className="space-y-3">
                                {skills.map((skill) => (
                                    <label key={skill.Skills_id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={profileData.skills.includes(skill.Skills_id)}
                                            onChange={() => handleSkillToggle(skill.Skills_id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{skill.Description}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {errors.skills && (
                    <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
                )}
                 <p className="mt-2 text-sm text-gray-600">
                    {profileData.skills.length} skill{profileData.skills.length !== 1 ? 's' : ''} selected
                </p>
            </div>
        </div>
    );

    // this is to show the email the volunteer used to log in
    // This is just for now - update later to show only the email and an option to change their password
    const renderEmailPassword = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Account Security</h3>
                        <div className="mt-2 text-sm text-blue-700">
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
        
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Weekly Availability</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Select the days of the week when you're generally available to volunteer.
                    </p>

                    <div className="space-y-3">
                        {daysOfWeek.map((day) => (
                            <label key={day.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={profileData.availability_days.includes(day.id)}
                                    onChange={() => handleDayToggle(day.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700 font-medium">{day.label}</span>
                            </label>
                        ))}
                    </div>

                    {profileData.availability_days.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm font-medium text-blue-800 mb-2">Selected Days</p>
                            <div>
                                {profileData.availability_days.map((dayId) =>{
                                    const day = daysOfWeek.find(d => d.id === dayId);
                                    return (
                                        <span
                                            key={dayId}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {day?.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {errors.availability_days && (
                        <p className="mt-2 text-sm text-red-600">{errors.availability_days}</p>
                    )}
                </div>
            </div>
        );
    };

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
            default:
                return renderPersonalInfo();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg">
                        <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">

                            {/* -----Sidebar Section----- */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
                                        <p className="mt-1 text-sm text-gray-600">Manage your volunteer information</p>
                                    </div>
                                    {/* get buttons for each item in sidebarItems array */}
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            // make blue if item is active - gray if not 
                                            className={`${      
                                                activeSection === item.id
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                            } group border-l-4 px-6 py-3 flex items-center text-sm font-medium w-full text-left`}
                                        >
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* -----Main Content Section----- */}
                            <form className="divide-y divide-gray-200 lg:col-span-9" onSubmit={handleSubmit}>
                                <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                    {success && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-green-800">Profile saved successfully!</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h2 className="text-lg font-medium text-gray-900">{sidebarItems.find(item => item.id === activeSection)?.label}</h2>
                                    </div>

                                    {renderContent()}
                                </div>

                                <div className="pt-6 px-4 sm:px-6">
                                    {errors.submit && (
                                        <p className="mb-3 text-sm text-red-600">{errors.submit}</p>
                                    )}
                                    <div className="flex justify-end mb-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                loading 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ----- Volunteer History Section ----- */}
                    <div className="mt-8 p-6 bg-white shadow rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Volunteer History
                        </h2>
                        <p className="text-gray-600 mb-4">
                            View your past volunteer events and participation status.
                        </p>
                        <a
                            href="/volunteer/history"
                            className="inline-block bg-blue-600 shadow-sm text-sm font-medium text-white px-5 py-2
        rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View History
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;