import Order from '../../models/Order.js';
import { recordPrepTimeAnalytics } from '../../utils/prepTimeAnalytics.js';
import Notification from '../../models/Notification.js';
import jwt from 'jsonwebtoken';
import { publishToUser, publishToVendor } from '../../utils/events.js';

// Get all orders for the logged-in vendor
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const orders = await Order.find({ vendor: vendorId })
      .populate('user', 'name email')
      .populate('items.menuItem');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept an order (set to preparing, generate QR)
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.state !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not pending' });
    }
    order.state = 'preparing';
    // Generate QR code (JWT)
    const payload = {
      orderId: order._id,
      userId: order.user,
      vendorId: order.vendor,
      iat: Date.now(),
    };
    order.qrCode = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '3d' });
    await order.save();
    // Notify user and vendor about order state change
    publishToVendor(String(order.vendor), { type: 'order_updated', orderId: String(order._id), state: 'preparing' });
    publishToUser(String(order.user), { type: 'order_updated', orderId: String(order._id), state: 'preparing' });
    // Persist and push a user notification
    try {
      const notif = await Notification.create({
        title: 'Order accepted',
        message: `Your order #${order.orderNumber || ''} has been accepted and is now being prepared.`.trim(),
        type: 'order_update',
        recipients: 'user',
        recipientUser: order.user,
        sender: req.vendor._id,
        senderModel: 'Vendor',
        vendorId: req.vendor._id,
        order: order._id,
        linkPath: `/orders`
      });
      publishToUser(String(order.user), { type: 'notification', data: { id: String(notif._id), title: notif.title, message: notif.message } });
    } catch (_) {}
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject an order
export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.state !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not pending' });
    }
    order.state = 'rejected';
    await order.save();
    publishToVendor(String(order.vendor), { type: 'order_updated', orderId: String(order._id), state: 'rejected' });
    publishToUser(String(order.user), { type: 'order_updated', orderId: String(order._id), state: 'rejected' });
    try {
      const notif = await Notification.create({
        title: 'Order rejected',
        message: `Your order #${order.orderNumber || ''} was rejected.`,
        type: 'order_update',
        recipients: 'user',
        recipientUser: order.user,
        sender: req.vendor._id,
        senderModel: 'Vendor',
        vendorId: req.vendor._id,
        order: order._id,
        linkPath: `/orders`
      });
      publishToUser(String(order.user), { type: 'notification', data: { id: String(notif._id), title: notif.title, message: notif.message } });
    } catch (_) {}
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark order as ready
export const markOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.state !== 'preparing') {
      return res.status(400).json({ success: false, message: 'Order is not in preparing state' });
    }

    // Calculate actual preparation time
    const prepStartTime = new Date(order.stateTimestamps.preparing);
    const prepEndTime = new Date();
    const actualPrepTime = Math.round((prepEndTime - prepStartTime) / (1000 * 60)); // Convert to minutes

    order.state = 'ready';
    order.actualPreparationTime = actualPrepTime;
    order.stateTimestamps.ready = prepEndTime;
    await order.save();

    // Send notification to the user that their order is ready
    try {
      await Notification.create({
        title: 'Your order is ready for pickup',
        message: `Order #${order.orderNumber || ''} is ready. Please collect it at the counter.`.trim(),
        type: 'order_update',
        recipients: 'user',
        recipientUser: order.user,
        sender: req.vendor._id,
        senderModel: 'Vendor',
        vendorId: req.vendor._id,
        order: order._id,
        linkPath: `/orders`,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      publishToUser(String(order.user), { type: 'notification', data: { title: 'Order ready for pickup', message: `Order #${order.orderNumber || ''} is ready.`.trim() } });
    } catch (e) {
      // Log and continue without failing the main flow
    }
    publishToVendor(String(order.vendor), { type: 'order_updated', orderId: String(order._id), state: 'ready' });
    publishToUser(String(order.user), { type: 'order_updated', orderId: String(order._id), state: 'ready' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete order (after QR scan)
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.state !== 'ready') {
      return res.status(400).json({ success: false, message: 'Order is not ready for completion' });
    }
    order.state = 'completed';
    await order.save();
    
    // Record analytics after order is completed
    await recordPrepTimeAnalytics(order);
    
    publishToVendor(String(order.vendor), { type: 'order_updated', orderId: String(order._id), state: 'completed' });
    publishToUser(String(order.user), { type: 'order_updated', orderId: String(order._id), state: 'completed' });
    try {
      const notif = await Notification.create({
        title: 'Order completed',
        message: `Order #${order.orderNumber || ''} has been marked as completed. Enjoy your meal!`,
        type: 'order_update',
        recipients: 'user',
        recipientUser: order.user,
        sender: req.vendor._id,
        senderModel: 'Vendor',
        vendorId: req.vendor._id,
        order: order._id,
        linkPath: `/orders`
      });
      publishToUser(String(order.user), { type: 'notification', data: { id: String(notif._id), title: notif.title, message: notif.message } });
    } catch (_) {}
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Scan order QR (validate and mark as completed)
export const scanOrderQr = async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required' });
    }

    // Decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(qrData, process.env.JWT_SECRET || 'your_jwt_secret');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR code' });
    }

    const { orderId } = decoded;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' });
    }

    // Optimized query with lean() for better performance
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.menuItem')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate vendor ownership
    if (order.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to scan this order' });
    }

    // Check order state
    if (order.state === 'completed') {
      return res.status(200).json({ 
        success: false, 
        message: 'Order already completed/collected', 
        data: order 
      });
    }

    if (order.state !== 'ready') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is not ready for completion', 
        data: order 
      });
    }

    // Update order state efficiently
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { state: 'completed' },
      { new: true }
    ).populate('user', 'name email').populate('items.menuItem');

    // Record analytics after order is completed
    await recordPrepTimeAnalytics(updatedOrder);

    publishToVendor(String(updatedOrder.vendor), { type: 'order_updated', orderId: String(updatedOrder._id), state: 'completed' });
    publishToUser(String(updatedOrder.user?._id || order.user), { type: 'order_updated', orderId: String(updatedOrder._id), state: 'completed' });
    try {
      const notif = await Notification.create({
        title: 'Order completed',
        message: `Order #${updatedOrder.orderNumber || ''} has been collected. Enjoy your meal!`,
        type: 'order_update',
        recipients: 'user',
        recipientUser: updatedOrder.user?._id || order.user,
        sender: req.vendor._id,
        senderModel: 'Vendor',
        vendorId: req.vendor._id,
        order: updatedOrder._id,
        linkPath: `/orders`
      });
      publishToUser(String(updatedOrder.user?._id || order.user), { type: 'notification', data: { id: String(notif._id), title: notif.title, message: notif.message } });
    } catch (_) {}
    res.json({ 
      success: true, 
      message: 'Order completed successfully',
      data: updatedOrder 
    });
  } catch (error) {
    console.error('Order QR scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error scanning order QR code. Please try again.' 
    });
  }
}; 