import React, { useState, useEffect} from 'react';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState({
        full_name: '',
        full_address: '',
        skills: [],
        preferences: '',
        availability_dates: []
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

    // add volunteers availability
    const handleAvailabilityAddition = (date) => {
        const dateStr = date.target.value;
        if (!profileData.availability_dates.includes(dateStr)) {
            setProfileData(prev => ({
                ...prev,
                availability_dates: [...prev.availability_dates, dateStr]
            }));
        }
    };

    // remove volunteers availability
    const removeAvailabilityDate = (dateToRemove) => {
        setProfileData(prev => ({
            ...prev,
            availability_dates: prev.availability_dates.filter(date => date !== dateToRemove)
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

        // Check address is entered
        if (!profileData.full_address.trim()) {
            newErrors.full_address = 'Address is required';
        } else if (profileData.full_address.length > 500) {
            newErrors.full_address = 'Address must be 500 characters or less';
        }
        
        // removes specific dates from avalability list
        if (profileData.availability_dates.length === 0) {
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
    const renderPersonalInfo = () => (
        <div className='space-y-6'>
            <div>
                <label htmlFor='full_name' className='block text-sm font-medium text-gray-700 mb-2'>
                    Full Name
                </label>
                <input 
                    type="text"
                    id = "full_name"
                    name ="full_name"
                    value = {profileData.full_name}
                    onChange = {handleInputChange}
                    maxLength = "50"
                    placeholder='Enter Full Name'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{profileData.full_name.length}/50 characters</p>
            </div>

            <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                </label>
                <input 
                    id="full_address"
                    name="full_address"
                    value={profileData.full_address}
                    onChange={handleInputChange}
                    maxLength="500"
                    placeholder='Enter Full Address (Street, City, State, ZIP)'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.full_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.full_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_address}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{profileData.full_address.length}/500 characters</p>
            </div>

            <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferences (optional)
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
    const renderAvailability = () => (
        <div className="space-y-6">
            <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Your Availability</h3>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                    Add Available Dates
                </label>
                <input
                    type="date"
                    id="availability"
                    onChange={handleAvailabilityAddition}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {profileData.availability_dates.length > 0 && (
                    <div className="mt-4">
                         <p className="text-sm font-medium text-gray-700 mb-3">Selected Dates:</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {profileData.availability_dates.map((date) => (
                                <div key={date} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <span className="text-sm font-medium text-blue-800">
                                        {new Date(date).toLocaleDateString()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeAvailabilityDate(date)}
                                        className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                )}

                {errors.availability_dates && (
                    <p className="mt-2 text-sm text-red-600">{errors.availability_dates}</p>
                )}
            </div>
        </div>
    );

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
                                    <div className="flex justify-end">
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
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;