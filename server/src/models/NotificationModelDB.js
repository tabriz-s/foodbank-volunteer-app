const { getConnection } = require('../config/database');

// ============================================
// GET OPERATIONS
// ============================================

// Get all notifications for a volunteer (with event and notification details)
const getVolunteerNotifications = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT 
                vn.Notification_delivery_id,
                vn.Notification_id,
                vn.Volunteer_id,
                vn.Is_read,
                vn.Delivered_at,
                vn.Read_at,
                en.Event,
                en.Subject,
                en.Messege as Message,
                en.Notfication_type as Notification_type,
                e.Event_name,
                e.Date as Event_date,
                e.Start_time as Event_start_time
             FROM volunteer_notifications vn
             INNER JOIN event_notifications en ON vn.Notification_id = en.Notification_id
             LEFT JOIN events e ON en.Event = e.Event_id
             WHERE vn.Volunteer_id = ?
             ORDER BY vn.Delivered_at DESC`,
            [volunteer_id]
        );
        
        return rows;
    } catch (error) {
        console.error('Error getting volunteer notifications:', error);
        throw error;
    }
};

// Get only unread notifications for a volunteer
const getUnreadNotifications = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT 
                vn.Notification_delivery_id,
                vn.Notification_id,
                vn.Volunteer_id,
                vn.Is_read,
                vn.Delivered_at,
                vn.Read_at,
                en.Event,
                en.Subject,
                en.Messege as Message,
                en.Notfication_type as Notification_type,
                e.Event_name,
                e.Date as Event_date,
                e.Start_time as Event_start_time
             FROM volunteer_notifications vn
             INNER JOIN event_notifications en ON vn.Notification_id = en.Notification_id
             LEFT JOIN events e ON en.Event = e.Event_id
             WHERE vn.Volunteer_id = ? AND vn.Is_read = 0
             ORDER BY vn.Delivered_at DESC`,
            [volunteer_id]
        );
        
        return rows;
    } catch (error) {
        console.error('Error getting unread notifications:', error);
        throw error;
    }
};

// Get unread notification count for a volunteer
const getUnreadCount = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT COUNT(*) as count 
             FROM volunteer_notifications 
             WHERE Volunteer_id = ? AND Is_read = 0`,
            [volunteer_id]
        );
        
        return rows[0].count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};

// Get single notification details
const getNotificationById = async (notification_delivery_id) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            `SELECT 
                vn.*,
                en.Event,
                en.Subject,
                en.Messege as Message,
                en.Notfication_type as Notification_type
             FROM volunteer_notifications vn
             INNER JOIN event_notifications en ON vn.Notification_id = en.Notification_id
             WHERE vn.Notification_delivery_id = ?`,
            [notification_delivery_id]
        );
        
        return rows[0];
    } catch (error) {
        console.error('Error getting notification by ID:', error);
        throw error;
    }
};

// ============================================
// UPDATE OPERATIONS
// ============================================

// Mark notification as read
const markAsRead = async (notification_delivery_id) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            `UPDATE volunteer_notifications 
             SET Is_read = 1, Read_at = NOW()
             WHERE Notification_delivery_id = ?`,
            [notification_delivery_id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Notification not found');
        }
        
        // Return updated notification
        return await getNotificationById(notification_delivery_id);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read for a volunteer
const markAllAsRead = async (volunteer_id) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            `UPDATE volunteer_notifications 
             SET Is_read = 1, Read_at = NOW()
             WHERE Volunteer_id = ? AND Is_read = 0`,
            [volunteer_id]
        );
        
        return {
            success: true,
            message: `Marked ${result.affectedRows} notifications as read`,
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// ============================================
// DELETE OPERATIONS (Optional - might not need this)
// ============================================

// Delete a notification (soft delete - usually not recommended)
const deleteNotification = async (notification_delivery_id) => {
    try {
        const connection = await getConnection();
        
        const [result] = await connection.query(
            'DELETE FROM volunteer_notifications WHERE Notification_delivery_id = ?',
            [notification_delivery_id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Notification not found');
        }
        
        return {
            success: true,
            message: 'Notification deleted',
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// ============================================

module.exports = {
    // GET
    getVolunteerNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getNotificationById,
    
    // UPDATE
    markAsRead,
    markAllAsRead,
    
    // DELETE (optional)
    deleteNotification
};