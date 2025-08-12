import PrepTimeAnalytics from '../models/PrepTimeAnalytics.js';
import Order from '../models/Order.js';

const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 19) return 'evening';
  return 'night';
};

const getDayOfWeek = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const recordPrepTimeAnalytics = async (order) => {
  try {
    // Validate order data
    if (!order || !order.vendor || !order.items || !order.actualPreparationTime) {
      console.warn('Skipping analytics recording - incomplete order data:', {
        hasOrder: !!order,
        hasVendor: !!order?.vendor,
        hasItems: !!order?.items,
        hasActualPrepTime: !!order?.actualPreparationTime
      });
      return;
    }

    const now = new Date();
    
    // Get concurrent orders count with timeout protection
    const concurrentOrders = await Promise.race([
      Order.countDocuments({
        vendor: order.vendor,
        state: { $in: ['pending', 'preparing'] },
        _id: { $ne: order._id },
        'stateTimestamps.pending': {
          $gte: new Date(now - 2 * 60 * 60 * 1000) // Orders from last 2 hours
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]).catch(err => {
      console.error('Error counting concurrent orders:', err);
      return 0; // Fallback to 0 if query fails
    });

    // Record analytics for each item in the order
    for (const item of order.items) {
      await PrepTimeAnalytics.create({
        menuItem: item.menuItem,
        vendor: order.vendor,
        estimatedTime: order.estimatedPreparationTime,
        actualTime: order.actualPreparationTime,
        orderVolume: concurrentOrders + 1,
        timeOfDay: getTimeOfDay(now.getHours()),
        dayOfWeek: getDayOfWeek(now),
        isPeakHour: concurrentOrders > 5 // Consider it peak hour if more than 5 concurrent orders
      });
    }

    // Analyze and update menu item prep times if needed
    await updateMenuItemPrepTimes(order.vendor);
  } catch (error) {
    console.error('Error recording prep time analytics:', error);
  }
};

// Rate limiter for menu item updates
const updateLimiter = new Map();

export const updateMenuItemPrepTimes = async (vendorId) => {
  try {
    // Rate limiting: only update once per hour per vendor
    const lastUpdate = updateLimiter.get(vendorId);
    if (lastUpdate && (Date.now() - lastUpdate) < 3600000) { // 1 hour
      console.log('Skipping update - rate limited for vendor:', vendorId);
      return;
    }
    updateLimiter.set(vendorId, Date.now());

    // Get all menu items for this vendor with timeout protection
    const orders = await Promise.race([
      Order.find({
        vendor: vendorId,
        state: 'completed',
        actualPreparationTime: { $exists: true },
        'stateTimestamps.completed': {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }).populate('items.menuItem').lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]).catch(err => {
      console.error('Error fetching orders for analytics:', err);
      return []; // Return empty array if query fails
    });

    // Group orders by menu item
    const itemAnalytics = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemAnalytics[item.menuItem._id]) {
          itemAnalytics[item.menuItem._id] = {
            count: 0,
            totalActualTime: 0,
            times: []
          };
        }
        itemAnalytics[item.menuItem._id].count++;
        itemAnalytics[item.menuItem._id].totalActualTime += order.actualPreparationTime;
        itemAnalytics[item.menuItem._id].times.push(order.actualPreparationTime);
      });
    });

    // Calculate and update suggested prep times
    for (const [itemId, data] of Object.entries(itemAnalytics)) {
      if (data.count >= 10) { // Only update items with sufficient data
        const suggestedPrepTime = await PrepTimeAnalytics.calculateSuggestedPrepTime(itemId, vendorId);
        if (suggestedPrepTime) {
          await MenuItem.findByIdAndUpdate(itemId, {
            $set: { preparationTime: suggestedPrepTime }
          });
        }
      }
    }

    // Analyze and update peak hours
    const peakHours = await PrepTimeAnalytics.analyzePeakHours(vendorId);
    if (peakHours.length > 0) {
      const newPeakHours = peakHours
        .filter(ph => ph.orderCount > 5) // Only consider hours with significant orders
        .map(ph => {
          const [day, hour] = ph.dayHour.split('-');
          return {
            day: getDayOfWeek(new Date(2024, 0, parseInt(day) + 1)), // Use 2024 as it has all days
            start: `${hour.padStart(2, '0')}:00`,
            end: `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`,
            multiplier: Math.min(2, 1 + (ph.averageOrderVolume / 10)) // Cap multiplier at 2x
          };
        });

      await Vendor.findByIdAndUpdate(vendorId, {
        $set: { peakHours: newPeakHours }
      });
    }
  } catch (error) {
    console.error('Error updating menu item prep times:', error);
  }
};
