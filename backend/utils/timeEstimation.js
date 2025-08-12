import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

/**
 * Calculate estimated preparation time for a new order
 * @param {Object} vendor - Vendor document
 * @param {Array} orderItems - Array of order items
 * @returns {Number} Estimated preparation time in minutes
 */
export const calculateEstimatedTime = async (vendor, orderItems, orderId = null) => {
  try {
    const now = new Date();
    // Day of week in lowercase, e.g., 'monday'
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    // Current time as HH:MM for consistent comparison against stored strings
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    // Get current active orders for the vendor
    const activeOrders = await Order.find({
      vendor: vendor._id,
      state: { $in: ['pending', 'preparing'] }
    }).sort({ 'stateTimestamps.pending': 1 }); // Sort by creation time

    // Find position in queue if orderId is provided
    let queuePosition = 0;
    if (orderId) {
      queuePosition = activeOrders.findIndex(o => o._id.equals(orderId));
    } else {
      queuePosition = activeOrders.length; // New order will be at the end
    }

    // Calculate base preparation time from menu items
    let baseTime = 0;
    
    // Get all menu items with their preparation times
    const menuItems = await Promise.all(orderItems.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menuItem);
      const prepTime = Number(menuItem?.preparationTime) || 10; // default 10 mins if missing
      return {
        prepTime,
        quantity: Number(item.quantity) || 1
      };
    }));

    // Calculate total preparation time considering parallel preparation
    const itemGroups = menuItems.reduce((groups, item) => {
      // Group items by preparation time for parallel processing
      const prepTime = item.prepTime;
      if (!groups[prepTime]) {
        groups[prepTime] = 0;
      }
      groups[prepTime] += item.quantity;
      return groups;
    }, {});

    // Calculate effective preparation time
    // Items with same prep time can be prepared somewhat in parallel
    Object.entries(itemGroups).forEach(([prepTime, quantity]) => {
      // Add full prep time for first item, 25% extra for each additional item
      const effectivePrepTime = Number(prepTime) * (1 + (quantity - 1) * 0.25);
      baseTime += effectivePrepTime;
    });

    // Check if current time is in peak hours
    const peakHours = Array.isArray(vendor.peakHours) ? vendor.peakHours : [];
    const isPeakHour = peakHours.some(peak => {
      return peak.day === dayOfWeek &&
             currentTime >= String(peak.start || '').slice(0,5) &&
             currentTime <= String(peak.end || '').slice(0,5);
    });

    // Apply peak hour multiplier if applicable
    if (isPeakHour) {
      const peakHour = peakHours.find(peak => 
        peak.day === dayOfWeek &&
        currentTime >= String(peak.start || '').slice(0,5) &&
        currentTime <= String(peak.end || '').slice(0,5)
      );
      const multiplier = Number(peakHour?.multiplier) || 1.5;
      baseTime *= multiplier;
    }

    // Calculate current load factor
    const currentOrderCount = activeOrders.length;
    const maxOrdersPerHour = Number(vendor?.capacity?.maxOrdersPerHour) || 20;
    const loadFactor = maxOrdersPerHour > 0 ? (currentOrderCount / maxOrdersPerHour) : 0;
    
    // Apply load factor and queue position to base time
    const queueMultiplier = Math.max(1, queuePosition * 0.5); // Each position in queue adds 50% more time
    const estimatedTime = Math.round(baseTime * (1 + loadFactor) * queueMultiplier);

    // Cap the maximum estimated time
    const maxEstimatedTime = baseTime * 5; // Increased max time to account for queue position
    return Math.min(estimatedTime, maxEstimatedTime);
  } catch (error) {
    console.error('Error calculating estimated time:', error);
    const fallback = Number(vendor?.capacity?.averagePreparationTime) || 15;
    return fallback; // Fallback to average time
  }
};

/**
 * Get the current queue position for an order
 * @param {Object} order - Order document
 * @returns {Number} Position in queue
 */
export const getQueuePosition = async (order) => {
  try {
    // Get pending orders first (they are in front of the queue)
    const pendingOrders = await Order.find({
      vendor: order.vendor,
      state: 'pending'
    }).sort({ 'stateTimestamps.pending': 1 }); // Sort by creation time

    // Get preparing orders (they are already being processed but still count in queue)
    const preparingOrders = await Order.find({
      vendor: order.vendor,
      state: 'preparing'
    }).sort({ 'stateTimestamps.preparing': 1 }); // Sort by when they started preparing

    // Combine orders in correct sequence (pending first, then preparing)
    const activeOrders = [...pendingOrders, ...preparingOrders];
    
    // Find position in queue (1-based index)
    const position = activeOrders.findIndex(o => o._id.equals(order._id)) + 1;
    
    return position > 0 ? position : null; // Return null if order is not in active queue
  } catch (error) {
    console.error('Error getting queue position:', error);
    return null;
  }
};
