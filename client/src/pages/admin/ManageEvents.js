import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { fetchAllEvents, createEvent, deleteEvent, updateEvent } from '../../services/eventAPI';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Plus, Edit, Trash2, X, Users, MapPin, AlertCircle } from 'lucide-react';

const ManageEvents = () => {
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const { userId, userRole, currentUser, loading: authLoading } = useAuth(); 
    const { addNotification } = useContext(NotificationContext);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const skillsResponse = await fetch('http://localhost:5000/api/skills');
                const skillsData = await skillsResponse.json();
                setAvailableSkills(skillsData.data);
                
                const eventsResponse = await fetchAllEvents();
                const transformedEvents = eventsResponse.data.map(event => {
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
                        requiredSkills: skillIds,
                        skillsDetails: event.skills
                    };
                });
                setExistingEvents(transformedEvents);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-red-600 dark:text-red-400">Please login to access this page</p>
            </div>
        );
    }

    const sidebarItems = [
        { id: 'create-event', label: 'Create Event', icon: Plus },
        { id: 'manage-events', label: 'Manage Events', icon: Calendar }
    ];

    const urgencyOptions = [
        { value: '', label: 'Select Urgency' },
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Critical', label: 'Critical' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSkillToggle = (skillId) => {
        setEventData(prev => {
            const isCurrentlySelected = prev.requiredSkills.some(s => 
                typeof s === 'object' ? s.skillId === skillId : s === skillId
            );
            
            if (isCurrentlySelected) {
                return {
                    ...prev,
                    requiredSkills: prev.requiredSkills.filter(s => 
                        typeof s === 'object' ? s.skillId !== skillId : s !== skillId
                    )
                };
            } else {
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

    const calculateTotalNeeded = (skills) => {
        return skills.reduce((total, skill) => {
            const count = typeof skill === 'object' ? skill.neededCount : 1;
            return total + count;
        }, 0);
    };

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
        if (eventData.maxCapacity && String(eventData.maxCapacity).trim() !== '') {
            const maxCap = parseInt(eventData.maxCapacity);
            if (maxCap < 1) {
                newErrors.maxCapacity = 'Max capacity must be at least 1';
            } else {
                const totalNeeded = calculateTotalNeeded(eventData.requiredSkills);
                if (maxCap < totalNeeded) {
                    newErrors.maxCapacity = `Max capacity must be at least ${totalNeeded}`;
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (activeSection !== 'create-event' || isEditModalOpen) return;
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
            addNotification({
                type: "success",
                message: `Event "${eventData.eventName}" created successfully!`,
                time: "Just now"
            });

            const skillIds = result.data.skills ? result.data.skills.map(s => s.skillId) : [];
            const transformedEvent = {
                Event_id: result.data.Event_id,
                id: result.data.Event_id,
                name: result.data.Event_name,
                description: result.data.Description,
                location: result.data.Location,
                date: result.data.Date,
                urgency: result.data.Urgency,
                status: result.data.Status,
                max_capacity: result.data.Max_capacity,
                requiredSkills: skillIds,
                skillsDetails: result.data.skills
            };

            setExistingEvents(prev => [...prev, transformedEvent]);
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
            console.error('Error saving event:', error);
            setErrors({ submit: 'Failed to save event. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (event) => {
        setEditingEvent(event);
        let formattedDate = event.date;
        if (formattedDate && formattedDate.includes('T')) {
            formattedDate = formattedDate.split('T')[0];
        } else if (formattedDate) {
            const dateObj = new Date(formattedDate);
            formattedDate = dateObj.toISOString().split('T')[0];
        }
        
        let skillsArray = [];
        if (event.skillsDetails && event.skillsDetails.length > 0) {
            skillsArray = event.skillsDetails.map(skill => ({
                skillId: skill.skillId,
                neededCount: skill.neededCount || 1
            }));
        } else if (event.requiredSkills) {
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            let formattedDate = eventData.eventDate;
            if (formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }
            
            const result = await updateEvent(editingEvent.Event_id, {
                name: eventData.eventName,
                description: eventData.eventDescription,
                location: eventData.location,
                requiredSkills: eventData.requiredSkills,
                urgency: eventData.urgency,
                date: formattedDate,
                max_capacity: parseInt(eventData.maxCapacity),
                status: eventData.status || 'planned'
            });

            const skillIds = result.data.skills ? result.data.skills.map(s => s.skillId) : [];
            const transformedEvent = {
                Event_id: result.data.Event_id,
                id: result.data.Event_id,
                name: result.data.Event_name,
                description: result.data.Description,
                location: result.data.Location,
                date: result.data.Date,
                urgency: result.data.Urgency,
                status: result.data.Status,
                max_capacity: result.data.Max_capacity,
                requiredSkills: skillIds,
                skillsDetails: result.data.skills
            };

            setExistingEvents(prev => 
                prev.map(evt => evt.Event_id === editingEvent.Event_id ? transformedEvent : evt)
            );

            addNotification({
                type: "success",
                message: `Event "${eventData.eventName}" updated successfully!`,
                time: "Just now"
            });

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
            setErrors({ submit: error.message || 'Failed to update event.' });
        } finally {
            setLoading(false);
        }
    };

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
            maxCapacity: '',
            status: 'planned'
        });
        setErrors({});
    };

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

    const skillsByCategory = availableSkills.reduce((acc, skill) => {
        if (!acc[skill.Category]) {
            acc[skill.Category] = [];
        }
        acc[skill.Category].push(skill);
        return acc;
    }, {});

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'High': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
            case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'active': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
        }
    };

    const renderFormFields = () => (
        <div className="space-y-6">
            {/* Event Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="eventName"
                    value={eventData.eventName}
                    onChange={handleInputChange}
                    maxLength="100"
                    placeholder="Enter event name"
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.eventName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.eventName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventName}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{eventData.eventName.length}/100 characters</p>
            </div>

            {/* Event Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="eventDescription"
                    value={eventData.eventDescription}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe the event..."
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.eventDescription ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.eventDescription && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventDescription}</p>}
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="location"
                    value={eventData.location}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter the full address"
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
            </div>

            {/* Required Skills */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills & Volunteer Capacity <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2 text-sm uppercase tracking-wide">
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
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-500 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{skill.Description}</span>
                                            {isSelected && (
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-xs text-gray-600 dark:text-gray-400">Volunteers:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={neededCount}
                                                        onChange={(e) => handleSkillCountChange(skill.Skills_id, parseInt(e.target.value) || 1)}
                                                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                {errors.requiredSkills && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.requiredSkills}</p>}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {eventData.requiredSkills.length} skill{eventData.requiredSkills.length !== 1 ? 's' : ''} selected
                </p>
            </div>

            {/* Max Capacity */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Total Volunteers <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                    type="number"
                    name="maxCapacity"
                    value={eventData.maxCapacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter maximum number of volunteers"
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.maxCapacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.maxCapacity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxCapacity}</p>}
                {eventData.requiredSkills.length > 0 && (
                    <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                        💡 Minimum required: {calculateTotalNeeded(eventData.requiredSkills)} volunteers
                    </p>
                )}
            </div>

            {/* Urgency and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Urgency <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="urgency"
                        value={eventData.urgency}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                            errors.urgency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        {urgencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {errors.urgency && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.urgency}</p>}
                </div>

                {isEditModalOpen && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Status
                        </label>
                        <select
                            name="status"
                            value={eventData.status || 'planned'}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="planned">Planned</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="eventDate"
                        value={eventData.eventDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                            errors.eventDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    />
                    {errors.eventDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventDate}</p>}
                </div>
            </div>
        </div>
    );

    const renderCreateEvent = () => renderFormFields();

    const renderManageEvents = () => {
        const filteredEvents = showArchived 
            ? existingEvents
            : existingEvents.filter(event => event.status !== 'completed' && event.status !== 'cancelled');

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Existing Events</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {showArchived ? 'Showing all events' : 'Showing active events only'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                showArchived
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {showArchived ? '📋 Hide Archived' : '📦 Show Archived'}
                        </button>
                    </div>
                    
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredEvents.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {showArchived ? 'No events found.' : 'No active events. Create your first event!'}
                                </p>
                            </div>
                        ) : (
                            filteredEvents.map((event) => (
                                <div key={event.Event_id || event.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{event.name}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                                    {event.status === 'completed' ? '✓ Completed' :
                                                     event.status === 'active' ? '⚡ Active' :
                                                     event.status === 'cancelled' ? '✗ Cancelled' : '📅 Planned'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                                            <div className="mt-3 space-y-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                    {event.location}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                                                    Max: {event.max_capacity || 'Not set'} volunteers
                                                </p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Urgency:</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(event.urgency)}`}>
                                                        {event.urgency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(event)}
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.Event_id || event.id)}
                                                className="p-2 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={16} />
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

    const renderContent = () => {
        switch (activeSection) {
            case 'create-event': return renderCreateEvent();
            case 'manage-events': return renderManageEvents();
            default: return renderCreateEvent();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10">
                    <div className="relative mx-4 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Event</h3>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6">
                            {renderFormFields()}
                            {errors.submit && (
                                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                            )}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                            {/* Sidebar */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Create and manage volunteer events</p>
                                    </div>
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`${
                                                activeSection === item.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                                    : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            } group border-l-4 px-6 py-3 flex items-center text-sm font-medium w-full text-left transition-colors`}
                                        >
                                            <item.icon className="h-5 w-5 mr-3" />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* Main content */}
                            <form className="divide-y divide-gray-200 dark:divide-gray-700 lg:col-span-9" onSubmit={handleSubmit}>
                                <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                    {success && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-300">Event saved successfully!</p>
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {sidebarItems.find(item => item.id === activeSection)?.label}
                                        </h2>
                                    </div>
                                    {renderContent()}
                                </div>

                                {activeSection === 'create-event' && (
                                    <div className="pt-6 px-4 sm:px-6 pb-6">
                                        {errors.submit && (
                                            <p className="mb-3 text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                                        )}
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="py-3 px-8 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
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