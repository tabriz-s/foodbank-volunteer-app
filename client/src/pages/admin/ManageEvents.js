import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';

const ManageEvents = () => {
    // data req. for creating events
    const [eventData, setEventData] = useState({
        eventName: '',
        eventDescription: '',
        location: '',
        requiredSkills: [],
        urgency: '',
        eventDate: ''
});
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [existingEvents, setExistingEvents] = useState([]);
    const [activeSection, setActiveSection] = useState('create-event');
    
// Get notification functions
const { addNotification } = useContext(NotificationContext);
    
// skill sets as profile page
    
useEffect(() => {
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

// mock data will be replaced with API calls
setExistingEvents([
           {
                id: 1,
                name: 'UH Food Bank Distribution',
                description: 'Help distribute food packages to University of Houston students and families',
                location: 'University of Houston Student Center, University Dr, Houston, TX 77204',
                urgency: 'Medium',
                date: '2025-02-15',
                requiredSkills: [1, 7]
           },
           {
                id: 2,
                name: 'Houston Food Bank Warehouse Sort',
                description: 'Sort and organize donated food items in the main warehouse facility',
                location: 'Houston Food Bank, Houston, TX 77029',
                urgency: 'Low',
                date: '2025-02-20',
                requiredSkills: [3, 4]
           }
        ]);
}, []);

const sidebarItems = [
        {
            id: 'create-event',label: 'Create Event'},
        {
            id: 'manage-events',label: 'Manage Events'}
    ];

    // urgency dropdown
    const urgencyOptions = [
        { value: '', label: 'Select Urgency' },
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Critical', label: 'Critical' }
    ];

    // handle typing in text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
           }));
        }
    };
    // handle skill checkboxes
    const handleSkillToggle = (skillId) => {
        setEventData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.includes(skillId)
                ? prev.requiredSkills.filter(id => id !== skillId)  // remove if already checked else add
                : [...prev.requiredSkills, skillId]                 
        }));
};

// Check if any form errors
const validateForm = () => {
        const newErrors = {};
        if (!eventData.eventName.trim()) {
            newErrors.eventName = 'Event name is required';
        } else if (eventData.eventName.length > 100) {
            newErrors.eventName = 'Event name must be 100 characters or less';
        }

        if (!eventData.eventDescription.trim()) {
            newErrors.eventDescription = 'Event description is required';
        }

        if (!eventData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (eventData.requiredSkills.length === 0) {
            newErrors.requiredSkills = 'Please select at least one required skill';
        }

        if (!eventData.urgency) {
            newErrors.urgency = 'Please select urgency level';
        }

        if (!eventData.eventDate) {
            newErrors.eventDate = 'Event date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
};

// submit form to create event
    
const handleSubmit = async (event) => {
       event.preventDefault();
       if (!validateForm()) return;


        setLoading(true);
        setSuccess(false);
        try {
            // simulating API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess(true);
            console.log('Event saved:', eventData);

            // notification pops up
            addNotification({
                type: "success",
                message: `Event "${eventData.eventName}" created successfully!`,
                time: "Just now"
            });

            const newEvent = {
                id: existingEvents.length + 1,
                name: eventData.eventName,
                description: eventData.eventDescription,
                location: eventData.location,
                urgency: eventData.urgency,
                date: eventData.eventDate,
                requiredSkills: eventData.requiredSkills
            };

            setExistingEvents(prev => [...prev, newEvent]);
            
	   // Clear form
            setEventData({
                eventName: '',
                eventDescription: '',
                location: '',
                requiredSkills: [],
                urgency: '',
                eventDate: ''
            });

        } catch (error) {
            console.error('Error saving event:', error);
            setErrors({ submit: 'Failed to save event. Please try again.' });
        } finally {
            setLoading(false);
        }
};

// delete event from list
const handleDeleteEvent = (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setExistingEvents(prev => prev.filter(event => event.id !== eventId));
            addNotification({
                type: "info",
                message: "Event deleted successfully",
                time: "Just now"
          });
      }
};
 
const getSkillName = (skillId) => {
        const skill = availableSkills.find(s => s.Skills_id === skillId);
        return skill ? skill.Description : 'Unknown Skill';
};


// group skills by category for better organization
const skillsByCategory = availableSkills.reduce((acc, skill) => {
        if (!acc[skill.Category]) {
            acc[skill.Category] = [];
        }
        acc[skill.Category].push(skill);
        return acc;
}, {});
    
// Form for new events
    
const renderCreateEvent = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                </label>
                <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={eventData.eventName}
                    onChange={handleInputChange}
                    maxLength="100"
                    placeholder="Enter event name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.eventName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.eventName && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{eventData.eventName.length}/100 characters</p>
            </div>

            <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Description
                </label>
                <textarea
                    id="eventDescription"
                    name="eventDescription"
                    value={eventData.eventDescription}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe the event, what volunteers will do, and any important details"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.eventDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.eventDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventDescription}</p>
                )}
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                </label>
                <textarea
                    id="location"
                    name="location"
                    value={eventData.location}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter the full address and any location details"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills
                </label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide text-blue-600">
                                {category.replace('_', ' ')}
                            </h4>
                            <div className="space-y-2">
                                {skills.map((skill) => (
                                    <label key={skill.Skills_id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={eventData.requiredSkills.includes(skill.Skills_id)}
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
                {errors.requiredSkills && (
                    <p className="mt-2 text-sm text-red-600">{errors.requiredSkills}</p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                    {eventData.requiredSkills.length} skill{eventData.requiredSkills.length !== 1 ? 's' : ''} selected
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency
                    </label>
                    <select
                        id="urgency"
                        name="urgency"
                        value={eventData.urgency}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.urgency ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        {urgencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.urgency && (
                        <p className="mt-1 text-sm text-red-600">{errors.urgency}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date
                    </label>
                    <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={eventData.eventDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.eventDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.eventDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
                    )}
                </div>
            </div>
        </div>
);

// Show existing events that can be managed
const renderManageEvents = () => (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Existing Events</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {existingEvents.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-500">No events found. Create your first event!</p>
                        </div>
                    ) : (
                        existingEvents.map((event) => (
                            <div key={event.id} className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm"><span className="font-medium">Location:</span> {event.location}</p>
                                            <p className="text-sm"><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                                            <p className="text-sm"><span className="font-medium">Urgency:</span> 
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    event.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                                                    event.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                                                    event.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {event.urgency}
                                                </span>
                                            </p>
                                            <p className="text-sm"><span className="font-medium">Required Skills:</span> {event.requiredSkills.map(skillId => getSkillName(skillId)).join(', ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => alert('Edit functionality would go here')}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
       </div>
);

// Switch between create and manage sections
const renderContent = () => {
        switch (activeSection) {
            case 'create-event':
                return renderCreateEvent();
            case 'manage-events':
                return renderManageEvents();
            default:
                return renderCreateEvent();
        }
};
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg">
                        <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">

                            {/* Sidebar */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                                        <p className="mt-1 text-sm text-gray-600">Create and manage volunteer events</p>
                                    </div>
                                    {/* Navigation buttons */}
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
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

                            {/* Main content */}
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
                                                    <p className="text-sm font-medium text-green-800">Event saved successfully!</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            {sidebarItems.find(item => item.id === activeSection)?.label}
                                        </h2>
                                    </div>

                                    {renderContent()}
                                </div>

                                {/* Submit button only shows on create event section */}
                                {activeSection === 'create-event' && (
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
                                                {loading ? 'Creating Event...' : 'Create Event'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageEvents;