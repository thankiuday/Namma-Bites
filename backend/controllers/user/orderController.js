import Order from '../../models/Order.js';
import MenuItem from '../../models/MenuItem.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, vendor, paymentProof } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }
    const user = req.user._id;
    // Populate item details
    const orderItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) throw new Error('Menu item not found');
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        picture: menuItem.image,
        quantity: item.quantity,
      };
    }));
    const order = await Order.create({
      user,
      vendor,
      items: orderItems,
      paymentProof,
      state: 'pending',
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload payment proof for an order
export const uploadOrderPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    order.paymentProof = `/uploads/payment-proofs/${req.file.filename}`;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders for the logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('vendor', 'name image location')
      .populate('items.menuItem');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order QR code (after vendor accepts)
export const getOrderQr = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (String(order.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (!order.qrCode) {
      return res.status(400).json({ success: false, message: 'QR code not generated yet' });
    }
    res.json({ success: true, qrData: order.qrCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 