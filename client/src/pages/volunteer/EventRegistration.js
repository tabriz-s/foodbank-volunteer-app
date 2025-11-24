import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, AlertCircle, Check, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
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

    //const { userID } = useAuth();
    const { volunteerId } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
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

    // Confirmation model state to unregister
    const [showUnregisterConfirm, setShowUnregisterConfirm] = useState(false);
    const [eventToUnregister, setEventToUnregister] = useState(null);

    // Fetch all events data
    const loadEventsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [availableRes, otherRes, myRes] = await Promise.all([
                fetchAvailableEvents(volunteerId),
                fetchOtherEvents(volunteerId),
                fetchMyEvents(volunteerId)
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
        if (volunteerId) {
            loadEventsData();
        }
    }, [volunteerId]);

    // Handle registration
    const handleRegisterClick = (event) => {
        setSelectedEvent(event);
        setSelectedSkill(null);
        setShowRegistrationModal(true);
    };

    const handleRegisterConfirm = async () => {
        // Only require skill selection if event has required skills
        if (selectedEvent.required_skills && selectedEvent.required_skills.length > 0 && !selectedSkill) {
            toast.error('Please select a skill role', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        try {
            setRegistering(true);
            // Pass null for selectedSkill if no skills required
            const skillToRegister = selectedEvent.required_skills && selectedEvent.required_skills.length > 0 
                ? selectedSkill : null;
            
            await registerForEvent(volunteerId, selectedEvent.Event_id, skillToRegister);

            // Close modal
            setShowRegistrationModal(false);
            setSelectedEvent(null);
            setSelectedSkill(null);

            toast.success("You're registered! We'll send you a reminder before the event.", {
                duration: 4000,
                position: 'top-center',
            });

            // Reload events data
            await loadEventsData();

        } catch (err) {
            console.error('Registration error:', err);
            toast.error('Registration failed. Please ensure you select the skills you have and try again.', {
                duration: 4000,
                position: 'top-center',
            });
        } finally {
            setRegistering(false);
        }
    };

    // Handle unregistration - Show confirmation modal
    const handleUnregisterClick = (signupId) => {
        setEventToUnregister(signupId);
        setShowUnregisterConfirm(true);
    };

    const handleUnregisterConfirm = async () => {
        try {
            await unregisterFromEvent(eventToUnregister, volunteerId);
            
            // Close confirmation modal
            setShowUnregisterConfirm(false);
            setEventToUnregister(null);
            
            toast.success('Successfully unregistered from event', {
                duration: 3000,
                position: 'top-center',
            });
            
            await loadEventsData();
        } catch (err) {
            console.error('Unregister error:', err);
            toast.error('Failed to unregister. Please try again.', {
                duration: 4000,
                position: 'top-center',
            });
        }
    };

    
    const getUrgencyBadgeColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'High': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
            case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        }
    };

    // Render event card for available events
    const renderAvailableEventCard = (event) => (
        <div key={event.Event_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.Event_name}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyBadgeColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{event.Location}</span>
                </div>
            </div>

            {/* Required Skills */}
            {event.required_skills && event.required_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skill Positions Available:</p>
                    <div className="space-y-2">
                        {event.required_skills.map((skill) => (
                            <div key={skill.Skills_id} className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{skill.Skill_name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {skill.Needed_count ? `${skill.Needed_count - skill.Current_signups}/${skill.Needed_count} spots` : 'Unlimited'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => handleRegisterClick(event)}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-md"
            >
                Register for Event
            </button>
        </div>
    );

    // Render event card for other events
    const renderOtherEventCard = (event) => (
        <div key={event.Event_id} className="bg-gray-100 dark:bg-gray-700/50 rounded-xl shadow-md p-6 opacity-80 border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.Event_name}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyBadgeColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
            </div>

            {event.required_skills && event.required_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Skills Needed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {event.required_skills.map((skill) => (
                            <span key={skill.Skills_id} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm">
                                {skill.Skill_name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                You don't have the required skills for this event.
            </p>
        </div>
    );

    // Render event card for registered events
    const renderRegisteredEventCard = (event) => (
        <div key={event.Signup_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl">{getEventTypeIcon(event.Event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.Event_name}</h3>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Registered
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{event.Description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyBadgeColor(event.Urgency)}`}>
                    {event.Urgency}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatEventDate(event.Date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatEventTime(event.Start_time)} - {formatEventTime(event.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{event.Location}</span>
                </div>
                {event.Registered_as_skill && (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Your Role: </span>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {event.Registered_as_skill}
                        </span>
                    </div>
                )}
            </div>

            <button
                onClick={() => handleUnregisterClick(event.Signup_id)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
                Unregister from Event
            </button>
        </div>
    );

    // NEW: Render unregister confirmation modal
    const renderUnregisterConfirmModal = () => {
        if (!showUnregisterConfirm) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Unregister from Event?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to unregister? This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowUnregisterConfirm(false);
                                setEventToUnregister(null);
                            }}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUnregisterConfirm}
                            className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-medium"
                        >
                            Yes, Unregister
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRegistrationModal = () => {
        if (!showRegistrationModal || !selectedEvent) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register for Event</h2>
                        <button
                            onClick={() => setShowRegistrationModal(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{selectedEvent.Event_name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedEvent.Description}</p>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{formatEventDate(selectedEvent.Date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatEventTime(selectedEvent.Start_time)} - {formatEventTime(selectedEvent.end_time)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            {selectedEvent.required_skills && selectedEvent.required_skills.length > 0 
                                ? 'Select Your Role:' 
                                : 'Event Details:'}
                        </h4>
                        <div className="space-y-3">
                            {selectedEvent.required_skills && selectedEvent.required_skills.length > 0 ? (
                                selectedEvent.required_skills.map((skill) => {
                                    const spotsLeft = skill.Needed_count ? skill.Needed_count - skill.Current_signups : Infinity;
                                    const isFull = skill.Needed_count && spotsLeft <= 0;

                                    return (
                                        <div
                                            key={skill.Skills_id}
                                            onClick={() => !isFull && setSelectedSkill(skill.Skills_id)}
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                                selectedSkill === skill.Skills_id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                                    : isFull
                                                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{skill.Skill_name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{skill.Category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium ${isFull ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {isFull ? 'FULL' : skill.Needed_count ? `${spotsLeft} spots left` : 'Unlimited'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
                                    <p className="text-green-800 dark:text-green-300 font-medium flex items-center">
                                        <Check className="h-5 w-5 mr-2" />
                                        No specific skills required!
                                    </p>
                                    <p className="text-green-700 dark:text-green-400 text-sm mt-1">Anyone can volunteer for this event.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRegistrationModal(false)}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            disabled={registering}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRegisterConfirm}
                            disabled={(selectedEvent.required_skills && selectedEvent.required_skills.length > 0 && !selectedSkill) || registering}
                            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={loadEventsData}
                        className="bg-primary-600 text-white py-2 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Toast container */}
            <Toaster />

            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Event Registration</h1>
                    <p className="text-primary-100">Browse and register for volunteer opportunities</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                            activeTab === 'browse'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Browse Events
                    </button>
                    <button
                        onClick={() => setActiveTab('registered')}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                            activeTab === 'registered'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        My Events {myEvents.length > 0 && `(${myEvents.length})`}
                    </button>
                </div>

                {activeTab === 'browse' ? (
                    <div>
                        {/* Available Events */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Available Events for You
                            </h2>
                            {availableEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableEvents.map(renderAvailableEventCard)}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">No available events at this time.</p>
                                </div>
                            )}
                        </div>

                        {/* Other Events */}
                        {otherEvents.length > 0 && (
                            <div>
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Other Events</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You don't have the required skills for these events
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            My Registered Events
                        </h2>
                        {myEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myEvents.map(renderRegisteredEventCard)}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't registered for any events yet.</p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="bg-primary-600 text-white py-2 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                                >
                                    Browse Available Events
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {renderRegistrationModal()}
            {renderUnregisterConfirmModal()}
        </div>
    );
};

export default EventRegistration;