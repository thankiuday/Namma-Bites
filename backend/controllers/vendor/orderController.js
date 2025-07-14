import Order from '../../models/Order.js';
import jwt from 'jsonwebtoken';

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
    order.state = 'ready';
    await order.save();
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