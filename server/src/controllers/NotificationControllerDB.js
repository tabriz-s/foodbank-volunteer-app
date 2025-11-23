const NotificationModelDB = require('../models/NotificationModelDB');

// GET all notifications for a volunteer (with full details)
const getVolunteerNotificationsDB = async (req, res) => {
    try {
        const { volunteer_id } = req.params;
        
        if (!volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id is required'
            });
        }
        
        const notifications = await NotificationModelDB.getVolunteerNotifications(volunteer_id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error('Error in getVolunteerNotificationsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notifications',
            error: error.message
        });
    }
};

// GET unread notification count for a volunteer
const getUnreadCountDB = async (req, res) => {
    try {
        const { volunteer_id } = req.params;
        
        if (!volunteer_id) {
            return res.status(400).json({
                success: false,
                message: 'volunteer_id is required'
            });
        }
        
        const count = await NotificationModelDB.getUnreadCount(volunteer_id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            unreadCount: count
        });
    } catch (error) {
        console.error('Error in getUnreadCountDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve unread count',
            error: error.message
        });
    }
};

// PUT mark notification as read
const markNotificationAsReadDB = async (req, res) => {
    try {
        const { notification_delivery_id } = req.params;
        
        if (!notification_delivery_id) {
            return res.status(400).json({
                success: false,
                message: 'notification_delivery_id is required'
            });
        }
        
        const result = await NotificationModelDB.markAsRead(notification_delivery_id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            message: 'Notification marked as read',
            data: result
        });
    } catch (error) {
        console.error('Error in markNotificationAsReadDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

module.exports = {
    getVolunteerNotificationsDB,
    getUnreadCountDB,
    markNotificationAsReadDB
};