import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { fetchAllEvents, createEvent, deleteEvent, updateEvent } from '../../services/eventAPI';
import { useAuth } from '../../contexts/AuthContext';

const ManageEvents = () => {
    // data req. for creating events
    const [eventData, setEventData] = useState({
        eventName: '',
        eventDescription: '',
        location: '',
        requiredSkills: [],
        urgency: '',
        eventDate: '',
        maxCapacity: '',
        status: 'planned'

    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [existingEvents, setExistingEvents] = useState([]);
    const [activeSection, setActiveSection] = useState('create-event');
    const [showArchived, setShowArchived] = useState(false);
    
    // NEW: Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const { userId, userRole, currentUser, loading: authLoading } = useAuth(); 
    
    // Get notification functions
    const { addNotification } = useContext(NotificationContext);
    
useEffect(() => {
    const loadData = async () => {
        try {
            // Fetch skills
            const skillsResponse = await fetch('http://localhost:5000/api/skills');
            const skillsData = await skillsResponse.json();
            setAvailableSkills(skillsData.data);
            
            // Fetch events
            const eventsResponse = await fetchAllEvents();
            console.log('🔍 Full Response:', eventsResponse);
            
            // Transform database format to component format
            const transformedEvents = eventsResponse.data.map(event => {
                // Use the skills array from junction table
                const skillIds = event.skills ? event.skills.map(s => s.skillId) : [];
                
                return {
                    Event_id: event.Event_id,
                    id: event.Event_id,
                    name: event.Event_name,
                    description: event.Description,
                    location: event.Location,
                    date: event.Date,
                    start_time: event.Start_time,
                    end_time: event.end_time,
                    urgency: event.Urgency,
                    status: event.Status,
                    max_capacity: event.Max_capacity,
                    requiredSkills: skillIds, // Array of skill IDs from junction table
                    skillsDetails: event.skills // Keep full details if needed
                };
            });
            
            console.log('🔍 Transformed Events:', transformedEvents);
            setExistingEvents(transformedEvents);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };
    
    loadData();
}, []);

// NEW: Check auth loading
if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Authenticating...</p>
            </div>
        </div>
    );
}

// Check if user is authenticated
if (!userId) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">Please login to access this page</p>
        </div>
    );
}


    const sidebarItems = [
        { id: 'create-event', label: 'Create Event' },
        { id: 'manage-events', label: 'Manage Events' }
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
    setEventData(prev => {
        const isCurrentlySelected = prev.requiredSkills.some(s => 
            typeof s === 'object' ? s.skillId === skillId : s === skillId
        );
        
        if (isCurrentlySelected) {
            // Remove skill
            return {
                ...prev,
                requiredSkills: prev.requiredSkills.filter(s => 
                    typeof s === 'object' ? s.skillId !== skillId : s !== skillId
                )
            };
        } else {
            // Add skill with default count of 1
            return {
                ...prev,
                requiredSkills: [...prev.requiredSkills, { skillId: skillId, neededCount: 1 }]
            };
        }
    });
};

const handleSkillCountChange = (skillId, count) => {
    setEventData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.map(s => {
            if (typeof s === 'object' && s.skillId === skillId) {
                return { ...s, neededCount: count || 1 };
            } else if (s === skillId) {
                return { skillId: skillId, neededCount: count || 1 };
            }
            return s;
        })
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

     // NEW: Validate max capacity

if (eventData.maxCapacity && String(eventData.maxCapacity).trim() !== '') {  // ✅ Convert to string first
    const maxCap = parseInt(eventData.maxCapacity);
    if (maxCap < 1) {
        newErrors.maxCapacity = 'Max capacity must be at least 1';
    } else {
        const totalNeeded = calculateTotalNeeded(eventData.requiredSkills);
        if (maxCap < totalNeeded) {
            newErrors.maxCapacity = `Max capacity must be at least ${totalNeeded} (sum of all skill volunteers needed)`;
        }
    }
}

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

const handleSubmit = async (event) => {
    event.preventDefault();
    
    // IMPORTANT: Don't submit if we're not on create-event section or if edit modal is open
    if (activeSection !== 'create-event' || isEditModalOpen) {
        return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    try {
        const result = await createEvent({
            name: eventData.eventName,
            description: eventData.eventDescription,
            location: eventData.location,
            requiredSkills: eventData.requiredSkills,
            urgency: eventData.urgency,
            date: eventData.eventDate,
            max_capacity: parseInt(eventData.maxCapacity),
            created_by: userId,  
            status: 'planned'
        });
        
        setSuccess(true);
        console.log('Event created:', result.data);

        addNotification({
            type: "success",
            message: `Event "${eventData.eventName}" created successfully!`,
            time: "Just now"
        });

        // Transform the created event BEFORE adding to state
        const skillIds = result.data.skills ? result.data.skills.map(s => s.skillId) : [];
        
        const transformedEvent = {
            Event_id: result.data.Event_id,
            id: result.data.Event_id,
            name: result.data.Event_name,
            description: result.data.Description,
            location: result.data.Location,
            date: result.data.Date,
            start_time: result.data.Start_time,
            end_time: result.data.end_time,
            urgency: result.data.Urgency,
            status: result.data.Status,
            max_capacity: result.data.Max_capacity,
            requiredSkills: skillIds,  // ⬅️ This prevents the undefined error
            skillsDetails: result.data.skills
        };

        setExistingEvents(prev => [...prev, transformedEvent]);
        
        // Clear form
        setEventData({
            eventName: '',
            eventDescription: '',
            location: '',
            requiredSkills: [],
            urgency: '',
            eventDate: '',
            maxCapacity: '',  // ✅ Add this
            status: 'planned'
        });

    } catch (error) {
        console.error('Error saving event:', error);
        setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
        setLoading(false);
    }
};

const handleEditClick = (event) => {
    setEditingEvent(event);
    
    // Format date for input field (YYYY-MM-DD)
    let formattedDate = event.date;
    if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
    } else if (formattedDate) {
        const dateObj = new Date(formattedDate);
        formattedDate = dateObj.toISOString().split('T')[0];
    }
    
    // Convert requiredSkills from skillsDetails if available
    let skillsArray = [];
    if (event.skillsDetails && event.skillsDetails.length > 0) {
        skillsArray = event.skillsDetails.map(skill => ({
            skillId: skill.skillId,
            neededCount: skill.neededCount || 1
        }));
    } else if (event.requiredSkills) {
        // Fallback to old format
        skillsArray = event.requiredSkills.map(skillId => ({
            skillId: skillId,
            neededCount: 1
        }));
    }
    
    setEventData({
        eventName: event.name,
        eventDescription: event.description,
        location: event.location,
        requiredSkills: skillsArray,
        urgency: event.urgency,
        eventDate: formattedDate,
        maxCapacity: event.max_capacity || '',
        status: event.status || 'planned' 

    });
    setIsEditModalOpen(true);
    setErrors({});
};

 // NEW: Submit edit form
const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
        // Format date properly (extract just YYYY-MM-DD)
        let formattedDate = eventData.eventDate;
        if (formattedDate.includes('T')) {
            formattedDate = formattedDate.split('T')[0];
        }
        
        const result = await updateEvent(editingEvent.Event_id, {
            name: eventData.eventName,
            description: eventData.eventDescription,
            location: eventData.location,
            requiredSkills: eventData.requiredSkills, // Send as array of skill IDs
            urgency: eventData.urgency,
            date: formattedDate,
            max_capacity: parseInt(eventData.maxCapacity),
            status: eventData.status || 'planned'
        });

        // Transform the returned event (which now has skills array from junction table)
        const skillIds = result.data.skills ? result.data.skills.map(s => s.skillId) : [];
        
        const transformedEvent = {
            Event_id: result.data.Event_id,
            id: result.data.Event_id,
            name: result.data.Event_name,
            description: result.data.Description,
            location: result.data.Location,
            date: result.data.Date,
            urgency: result.data.Urgency,
            status: result.data.Status,  // ✅ Add this
            max_capacity: result.data.Max_capacity,
            requiredSkills: skillIds,
            skillsDetails: result.data.skills

        };

        // Update the event in the list
        setExistingEvents(prev => 
            prev.map(evt => 
                evt.Event_id === editingEvent.Event_id ? transformedEvent : evt
            )
        );

        addNotification({
            type: "success",
            message: `Event "${eventData.eventName}" updated successfully!`,
            time: "Just now"
        });

        // Close modal and reset
        setIsEditModalOpen(false);
        setEditingEvent(null);
        setEventData({
            eventName: '',
            eventDescription: '',
            location: '',
            requiredSkills: [],
            urgency: '',
            eventDate: '',
            maxCapacity: '',
            status: 'planned'
        });

    } catch (error) {
        console.error('Error updating event:', error);
        setErrors({ submit: error.message || 'Failed to update event. Please try again.' });
    } finally {
        setLoading(false);
    }
};

// NEW: Cancel edit
// NEW: Cancel edit
const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
    setEventData({
        eventName: '',
        eventDescription: '',
        location: '',
        requiredSkills: [],
        urgency: '',
        eventDate: '',
        maxCapacity: '',  // Add this
        status: 'planned'  // Add this
    });
    setErrors({});
};



    // delete event from backend
    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(eventId);
                
                setExistingEvents(prev => prev.filter(event => event.Event_id !== eventId));
                
                addNotification({
                    type: "info",
                    message: "Event deleted successfully",
                    time: "Just now"
                });
            } catch (error) {
                console.error('Error deleting event:', error);
                addNotification({
                    type: "error",
                    message: "Failed to delete event",
                    time: "Just now"
                });
            }
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

    // Calculate total volunteers needed from all skills
    const calculateTotalNeeded = (skills) => {
        return skills.reduce((total, skill) => {
            const count = typeof skill === 'object' ? skill.neededCount : 1;
            return total + count;
        }, 0);
    };

    // Form fields component (reused for create and edit)
    const renderFormFields = () => (
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
        Required Skills & Volunteer Capacity
    </label>
    <div className="border rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide text-blue-600">
                    {category.replace('_', ' ')}
                </h4>
                <div className="space-y-3">
                    {skills.map((skill) => {
                        const isSelected = eventData.requiredSkills.some(s => 
                            typeof s === 'object' ? s.skillId === skill.Skills_id : s === skill.Skills_id
                        );
                        const skillData = eventData.requiredSkills.find(s => 
                            typeof s === 'object' ? s.skillId === skill.Skills_id : s === skill.Skills_id
                        );
                        const neededCount = typeof skillData === 'object' ? skillData.neededCount || 1 : 1;

                        return (
                            <div key={skill.Skills_id} className="flex items-center space-x-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSkillToggle(skill.Skills_id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                                />
                                <span className="text-sm text-gray-700 flex-1 min-w-0">{skill.Description}</span>
                                
                                {/* Show number input only if skill is selected */}
                                {isSelected && (
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <label className="text-xs text-gray-600 whitespace-nowrap">Volunteers:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={neededCount}
                                            onChange={(e) => handleSkillCountChange(skill.Skills_id, parseInt(e.target.value) || 1)}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
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

{/* Max Capacity Field - NEW */}
<div>
    <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
    Maximum Total Volunteers <span className="text-gray-500 text-xs">(optional)</span>
</label>
    <input
        type="number"
        id="maxCapacity"
        name="maxCapacity"
        value={eventData.maxCapacity}
        onChange={handleInputChange}
        min="1"
        placeholder="Enter maximum number of volunteers"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.maxCapacity ? 'border-red-500' : 'border-gray-300'
        }`}
    />
    {errors.maxCapacity && (
        <p className="mt-1 text-sm text-red-600">{errors.maxCapacity}</p>
    )}
    {eventData.requiredSkills.length > 0 && (
        <p className="mt-1 text-sm text-blue-600">
            💡 Minimum required: {calculateTotalNeeded(eventData.requiredSkills)} volunteers 
            (based on skill requirements)
        </p>
    )}
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

                {isEditModalOpen && (
        <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={eventData.status || 'planned'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        )}

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

    // Form for new events
    const renderCreateEvent = () => renderFormFields();

    // Show existing events that can be managed
  // Show existing events that can be managed
const renderManageEvents = () => {
    // Filter events based on archive toggle
    const filteredEvents = showArchived 
        ? existingEvents // Show all events including archived
        : existingEvents.filter(event => 
            event.status !== 'completed' && event.status !== 'cancelled'
          ); // Hide completed/cancelled

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Existing Events</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {showArchived ? 'Showing all events' : 'Showing active events only'}
                        </p>
                    </div>
                    
                    {/* Archive Toggle Button */}
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            showArchived
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {showArchived ? '📋 Hide Archived' : '📦 Show Archived'}
                    </button>
                </div>
                
                <div className="divide-y divide-gray-200">
                    {filteredEvents.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-500">
                                {showArchived 
                                    ? 'No events found.' 
                                    : 'No active events found. Create your first event!'}
                            </p>
                        </div>
                    ) : (
                        filteredEvents.map((event) => (
                            <div key={event.Event_id || event.id} className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                event.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {event.status === 'completed' ? '✓ Completed' :
                                                 event.status === 'active' ? '⚡ Active' :
                                                 event.status === 'cancelled' ? '✗ Cancelled' :
                                                 '📅 Planned'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm"><span className="font-medium">Location:</span> {event.location}</p>
                                            <p className="text-sm"><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                                            <p className="text-sm">
                                                <span className="font-medium">Max Capacity:</span> 
                                                <span className="ml-2 text-blue-600 font-semibold">
                                                    {event.max_capacity || 'Not set'} volunteers
                                                </span>
                                            </p>
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
                                            <p className="text-sm">
                                                <span className="font-medium">Required Skills:</span>{' '}
                                                {event.skillsDetails && event.skillsDetails.length > 0 ? (
                                                    event.skillsDetails.map((skill, index) => (
                                                        <span key={skill.skillId}>
                                                            {getSkillName(skill.skillId)} 
                                                            <span className="text-blue-600 font-medium"> ({skill.neededCount} needed)</span>
                                                            {index < event.skillsDetails.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))
                                                ) : (
                                                    event.requiredSkills.map(skillId => getSkillName(skillId)).join(', ')
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEditClick(event)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.Event_id || event.id)}
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
};

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
            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Edit Event</h3>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            {renderFormFields()}
                            {errors.submit && (
                                <p className="mt-3 text-sm text-red-600">{errors.submit}</p>
                            )}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {loading ? 'Updating...' : 'Update Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
