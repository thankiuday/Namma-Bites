import Notification from '../models/Notification.js';
import User from '../models/User.js';
import UserSubscription from '../models/UserSubscription.js';

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      recipients,
      validUntil
    } = req.body;

    // Validate required fields
    if (!title || !message || !type || !recipients) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Set sender based on role
    const sender = req.vendor ? req.vendor._id : req.admin._id;
    const senderModel = req.vendor ? 'Vendor' : 'Admin';

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type,
      sender,
      senderModel,
      recipients,
      vendorId: req.vendor?._id,
      validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's ACTIVE subscriptions (approved and within date range)
    const rawSubs = await UserSubscription.find({
      user: userId,
      paymentStatus: 'approved'
    }).select('vendor startDate duration cancelledAt');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeVendorIds = rawSubs
      .filter(sub => {
        if (sub.cancelledAt) return false;
        const start = new Date(sub.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        // duration includes start day; subtract 1
        end.setDate(start.getDate() + Math.max(0, (sub.duration || 0) - 1));
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      })
      .map(s => s.vendor);

    // Build query
    const baseTimeWindow = {
      isActive: true,
      validFrom: { $lte: new Date() },
      $and: [
        {
          $or: [
            { validUntil: { $gt: new Date() } },
            { validUntil: null }
          ]
        },
      ]
    };

    // Build OR branches
    const orBranches = [
      { recipients: 'all_users' }
    ];
    if (activeVendorIds.length > 0) {
      orBranches.push({ recipients: 'subscribed_users', vendorId: { $in: activeVendorIds } });
    }
    // Include direct user notifications
    orBranches.push({ recipients: 'user', recipientUser: userId });

    const query = {
      ...baseTimeWindow,
      $or: orBranches
    };

    // Get notifications (lean to allow adding derived fields)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name')
      .populate('vendorId', 'name')
      .lean();

    // Attach isRead flag per notification for current user
    const notificationsWithReadFlag = notifications.map(n => ({
      ...n,
      isRead: Array.isArray(n.readBy) && n.readBy.some(r => String(r.user) === String(userId))
    }));

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Mark notifications as read
    const notificationIds = notifications.map(n => n._id);
    res.json({
      success: true,
      data: notificationsWithReadFlag,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get vendor's sent notifications
export const getVendorNotifications = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      vendorId,
      senderModel: 'Vendor'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      vendorId,
      senderModel: 'Vendor'
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching vendor notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Update notification status
export const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { isActive } = req.body;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify ownership
    if (
      (req.vendor && notification.vendorId.toString() !== req.vendor._id.toString()) ||
      (req.admin && notification.sender.toString() !== req.admin._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    notification.isActive = isActive;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
};

// Get a single notification (authorized for current user)
export const getNotificationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    // Find the notification first
    const notification = await Notification.findById(notificationId)
      .populate('sender', 'name')
      .populate('vendorId', 'name');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check validity window
    const now = new Date();
    const isActive = notification.isActive === true
      && notification.validFrom <= now
      && (notification.validUntil == null || notification.validUntil > now);

    if (!isActive) {
      return res.status(404).json({ success: false, message: 'Notification not available' });
    }

    // Authorization: allow if recipients is all_users OR if user has an active (approved & in-range) subscription for subscription_users
    if (notification.recipients === 'subscribed_users') {
      const sub = await UserSubscription.findOne({
        user: userId,
        vendor: notification.vendorId,
        paymentStatus: 'approved'
      }).select('startDate duration cancelledAt');

      const nowDay = new Date();
      nowDay.setHours(0, 0, 0, 0);
      let isActive = false;
      if (sub && !sub.cancelledAt) {
        const start = new Date(sub.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + Math.max(0, (sub.duration || 0) - 1));
        end.setHours(23, 59, 59, 999);
        isActive = nowDay >= start && nowDay <= end;
      }

      if (!isActive) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this notification' });
      }
    }

    // Mark as read for this user
    await Notification.updateOne(
      { _id: notification._id, readBy: { $not: { $elemMatch: { user: userId } } } },
      { $addToSet: { readBy: { user: userId, readAt: new Date() } } }
    );

    const isRead = Array.isArray(notification.readBy) && notification.readBy.some(r => String(r.user) === String(userId));
    res.json({ success: true, data: { ...notification.toObject(), isRead } });
  } catch (error) {
    console.error('Error fetching notification by id:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification' });
  }
};

// Mark a single notification as read for current user
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Mark as read for this user
    await Notification.updateOne(
      { _id: notification._id, readBy: { $not: { $elemMatch: { user: userId } } } },
      { $addToSet: { readBy: { user: userId, readAt: new Date() } } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// Mark all relevant notifications as read for current user
export const markAllUserNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Build active vendors for this user (same logic as list endpoint)
    const rawSubs = await UserSubscription.find({
      user: userId,
      paymentStatus: 'approved'
    }).select('vendor startDate duration cancelledAt');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeVendorIds = rawSubs
      .filter(sub => {
        if (sub.cancelledAt) return false;
        const start = new Date(sub.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + Math.max(0, (sub.duration || 0) - 1));
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      })
      .map(s => s.vendor);

    const baseTimeWindow = {
      isActive: true,
      validFrom: { $lte: new Date() },
      $or: [
        { validUntil: { $gt: new Date() } },
        { validUntil: null }
      ]
    };

    const orBranches = [
      { recipients: 'all_users' },
      { recipients: 'user', recipientUser: userId }
    ];
    if (activeVendorIds.length > 0) {
      orBranches.push({ recipients: 'subscribed_users', vendorId: { $in: activeVendorIds } });
    }

    await Notification.updateMany(
      {
        ...baseTimeWindow,
        $or: orBranches,
        readBy: { $not: { $elemMatch: { user: userId } } }
      },
      {
        $addToSet: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
  }
};

// Get unread notifications count for current user (without returning full list)
export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const rawSubs = await UserSubscription.find({
      user: userId,
      paymentStatus: 'approved'
    }).select('vendor startDate duration cancelledAt');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeVendorIds = rawSubs
      .filter(sub => {
        if (sub.cancelledAt) return false;
        const start = new Date(sub.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + Math.max(0, (sub.duration || 0) - 1));
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      })
      .map(s => s.vendor);

    const baseTimeWindow = {
      isActive: true,
      validFrom: { $lte: new Date() },
      $or: [
        { validUntil: { $gt: new Date() } },
        { validUntil: null }
      ]
    };

    const orBranches = [
      { recipients: 'all_users' },
      { recipients: 'user', recipientUser: userId }
    ];
    if (activeVendorIds.length > 0) {
      orBranches.push({ recipients: 'subscribed_users', vendorId: { $in: activeVendorIds } });
    }

    const count = await Notification.countDocuments({
      ...baseTimeWindow,
      $or: orBranches,
      readBy: { $not: { $elemMatch: { user: userId } } }
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};
