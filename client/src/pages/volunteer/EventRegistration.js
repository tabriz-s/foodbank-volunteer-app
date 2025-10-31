import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    fetchAvailableEvents,
    fetchOtherEvents,
    fetchMyEvents,
    registerForEvent,
    unregisterFromEvent,
    formatEventDate,
    formatEventTime,
    getUrgencyColor,
    getEventTypeIcon
} from '../../services/EventRegistrationAPI';

const EventRegistration = () => {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'registered'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data states
    const [availableEvents, setAvailableEvents] = useState([]);
    const [otherEvents, setOtherEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    
    // Modal states
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [registering, setRegistering] = useState(false);

    // Fetch all events data
    const loadEventsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [availableRes, otherRes, myRes] = await Promise.all([
                fetchAvailableEvents(userId),
                fetchOtherEvents(userId),
                fetchMyEvents(userId)
            ]);

            setAvailableEvents(availableRes.data || []);
            setOtherEvents(otherRes.data || []);
            setMyEvents(myRes.data || []);
        } catch (err) {
            console.error('Error loading events:', err);
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadEventsData();
        }
    }, [userId]);

    // Handle registration
    const handleRegisterClick = (event) => {
        setSelectedEvent(event);
        setSelectedSkill(null);
        setShowRegistrationModal(true);
    };

    const handleRegisterConfirm = async () => {
        if (!selectedSkill) {
            alert('Please select a skill role');
            return;
        }

        try {
            setRegistering(true);
            await registerForEvent(userId, selectedEvent.Event_id, selectedSkill);
            
            // Reload events data
            await loadEventsData();
            
            // Close modal
            setShowRegistrationModal(false);
            setSelectedEvent(null);
            setSelectedSkill(null);
            
            alert('Successfully registered for event!');
        } catch (err) {
            console.error('Registration error:', err);
            alert(err.message || 'Failed to register for event');
        } finally {
            setRegistering(false);
        }
    };

    // Handle unregistration
    const handleUnregister = async (signupId) => {
        if (!window.confirm('Are you sure you want to unregister from this event?')) {
            return;
        }

        try {
            await unregisterFromEvent(signupId, userId);
            
            // Reload events data
            await loadEventsData();
            
            alert('Successfully unregistered from event!');
        } catch (err) {
            console.error('Unregister error:', err);
            alert(err.message || 'Failed to unregister from event');
        }
    };

    // Render event card for available events
    const renderAvailableEventCard = (event) => (
        <div key={event.Event_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900">{event.Event_name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">📅 Date:</span>
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">🕐 Time:</span>
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">📍 Location:</span>
                    <span>{event.Location}</span>
                </div>
            </div>

            {/* Required Skills */}
            {event.required_skills && event.required_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Skill Positions Available:</p>
                    <div className="space-y-2">
                        {event.required_skills.map((skill) => (
                            <div key={skill.Skills_id} className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
                                <span className="text-sm font-medium text-gray-800">{skill.Skill_name}</span>
                                <span className="text-sm text-gray-600">
                                    {skill.Needed_count ? 
                                        `${skill.Needed_count - skill.Current_signups}/${skill.Needed_count} spots left` 
                                        : 'Unlimited spots'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Register Button */}
            <button
                onClick={() => handleRegisterClick(event)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                Register for Event
            </button>
        </div>
    );

    // Render event card for other events
    const renderOtherEventCard = (event) => (
        <div key={event.Event_id} className="bg-gray-50 rounded-lg shadow-md p-6 opacity-75">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900">{event.Event_name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">📅 Date:</span>
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">🕐 Time:</span>
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
            </div>

            {/* Required Skills */}
            {event.required_skills && event.required_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-red-600 mb-2">⚠️ Skills Needed:</p>
                    <div className="flex flex-wrap gap-2">
                        {event.required_skills.map((skill) => (
                            <span key={skill.Skills_id} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                {skill.Skill_name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-600 italic">
                You don't have the required skills for this event. Share with someone who does!
            </p>
        </div>
    );

    // Render event card for registered events
    const renderRegisteredEventCard = (event) => (
        <div key={event.Signup_id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900">{event.Event_name}</h3>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Registered
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">📅 Date:</span>
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">🕐 Time:</span>
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">📍 Location:</span>
                    <span>{event.Location}</span>
                </div>
                {event.Registered_as_skill && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">👤 Your Role:</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {event.Registered_as_skill}
                        </span>
                    </div>
                )}
            </div>

            {/* Unregister Button */}
            <button
                onClick={() => handleUnregister(event.Signup_id)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
                Unregister from Event
            </button>
        </div>
    );

    // Registration Modal
    const renderRegistrationModal = () => {
        if (!showRegistrationModal || !selectedEvent) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Register for Event</h2>
                        <button
                            onClick={() => setShowRegistrationModal(false)}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Event Details */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedEvent.Event_name}</h3>
                        <p className="text-gray-600 mb-4">{selectedEvent.Description}</p>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">📅 Date:</span>
                                <span>{formatEventDate(selectedEvent.Date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">🕐 Time:</span>
                                <span>{formatEventTime(selectedEvent.Start_time)} - {formatEventTime(selectedEvent.end_time)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Skill Selection */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Select Your Role:</h4>
                        <div className="space-y-3">
                            {selectedEvent.required_skills && selectedEvent.required_skills.length > 0 ? (
                                selectedEvent.required_skills.map((skill) => {
                                    const spotsLeft = skill.Needed_count ? skill.Needed_count - skill.Current_signups : Infinity;
                                    const isFull = skill.Needed_count && spotsLeft <= 0;

                                    return (
                                        <div
                                            key={skill.Skills_id}
                                            onClick={() => !isFull && setSelectedSkill(skill.Skills_id)}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedSkill === skill.Skills_id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : isFull
                                                    ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900">{skill.Skill_name}</p>
                                                    <p className="text-sm text-gray-600">{skill.Category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                                                        {isFull ? 
                                                            'FULL' 
                                                            : skill.Needed_count ? 
                                                                `${spotsLeft} spots left` 
                                                                : 'Unlimited'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-600">No specific skills required for this event.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRegistrationModal(false)}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            disabled={registering}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRegisterConfirm}
                            disabled={!selectedSkill || registering}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {registering ? 'Registering...' : 'Confirm Registration'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadEventsData}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Event Registration</h1>
                    <p className="text-blue-100">Browse and register for volunteer opportunities</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                            activeTab === 'browse'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Browse Events
                    </button>
                    <button
                        onClick={() => setActiveTab('registered')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                            activeTab === 'registered'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        My Registered Events {myEvents.length > 0 && `(${myEvents.length})`}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'browse' ? (
                    <div>
                        {/* Available Events Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Available Events for You
                            </h2>
                            {availableEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableEvents.map(renderAvailableEventCard)}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No available events at this time.</p>
                            )}
                        </div>

                        {/* Other Events Section */}
                        {otherEvents.length > 0 && (
                            <div>
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Other Events</h2>
                                    <p className="text-gray-600">
                                        You don't have the required skills for these events, but share them with friends who do!
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {otherEvents.map(renderOtherEventCard)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            My Registered Events
                        </h2>
                        {myEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myEvents.map(renderRegisteredEventCard)}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">You haven't registered for any events yet.</p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse Available Events
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            {renderRegistrationModal()}
        </div>
    );
};

export default EventRegistration;