import mongoose from 'mongoose';

const prepTimeAnalyticsSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  estimatedTime: {
    type: Number,
    required: true
  },
  actualTime: {
    type: Number,
    required: true
  },
  orderVolume: {
    type: Number,
    required: true // Number of concurrent orders when this order was prepared
  },
  timeOfDay: {
    type: String,
    required: true // e.g., "morning", "afternoon", "evening", "night"
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  isPeakHour: {
    type: Boolean,
    required: true
  },
  weather: {
    type: String,
    default: 'normal' // e.g., "normal", "rainy", "hot"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
prepTimeAnalyticsSchema.index({ menuItem: 1, vendor: 1, createdAt: -1 });

// Cache for suggested prep times
const prepTimeCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Method to calculate suggested prep time based on historical data
prepTimeAnalyticsSchema.statics.calculateSuggestedPrepTime = async function(menuItemId, vendorId) {
  try {
    // Check cache first
    const cacheKey = `${menuItemId}-${vendorId}`;
    const cachedValue = prepTimeCache.get(cacheKey);
    if (cachedValue && (Date.now() - cachedValue.timestamp) < CACHE_TTL) {
      return cachedValue.value;
    }

    // Query with timeout protection
    const recentAnalytics = await Promise.race([
      this.find({
        menuItem: menuItemId,
        vendor: vendorId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).sort({ createdAt: -1 }).limit(50).lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]).catch(err => {
      console.error('Error fetching prep time analytics:', err);
      return []; // Return empty array if query fails
    });

    if (recentAnalytics.length === 0) return null;

    // Calculate weighted average of actual prep times
    const weights = recentAnalytics.map((_, index) => 1 / (index + 1)); // More recent = higher weight
    const weightSum = weights.reduce((a, b) => a + b, 0);

    const weightedSum = recentAnalytics.reduce((sum, analytic, index) => {
      return sum + (analytic.actualTime * weights[index]);
    }, 0);

    const weightedAverage = Math.round(weightedSum / weightSum);

    // Calculate standard deviation to identify outliers
    const mean = recentAnalytics.reduce((sum, a) => sum + a.actualTime, 0) / recentAnalytics.length;
    const variance = recentAnalytics.reduce((sum, a) => sum + Math.pow(a.actualTime - mean, 2), 0) / recentAnalytics.length;
    const stdDev = Math.sqrt(variance);

    // Filter out outliers (prep times more than 2 standard deviations from mean)
    const normalPrepTimes = recentAnalytics.filter(a => 
      Math.abs(a.actualTime - mean) <= 2 * stdDev
    );

    if (normalPrepTimes.length === 0) {
      // Cache and return weighted average if no normal times
      prepTimeCache.set(cacheKey, {
        value: weightedAverage,
        timestamp: Date.now()
      });
      return weightedAverage;
    }

    // Calculate final suggested prep time (average of weighted average and median of normal times)
    const sortedTimes = normalPrepTimes.map(a => a.actualTime).sort((a, b) => a - b);
    const median = sortedTimes[Math.floor(sortedTimes.length / 2)];
    const suggestedTime = Math.round((weightedAverage + median) / 2);

    // Cache the result
    prepTimeCache.set(cacheKey, {
      value: suggestedTime,
      timestamp: Date.now()
    });

    return suggestedTime;
  } catch (error) {
    console.error('Error calculating suggested prep time:', error);
    return null;
  }
};

// Method to analyze peak hours based on historical data
prepTimeAnalyticsSchema.statics.analyzePeakHours = async function(vendorId) {
  try {
    const analytics = await this.find({
      vendor: vendorId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).lean();

    const hourlyData = {};
    analytics.forEach(record => {
      const hour = new Date(record.createdAt).getHours();
      const day = new Date(record.createdAt).getDay();
      const key = `${day}-${hour}`;
      
      if (!hourlyData[key]) {
        hourlyData[key] = {
          count: 0,
          totalPrepTime: 0,
          avgOrderVolume: 0
        };
      }
      
      hourlyData[key].count++;
      hourlyData[key].totalPrepTime += record.actualTime;
      hourlyData[key].avgOrderVolume += record.orderVolume;
    });

    // Calculate averages and identify peak hours
    const peakHours = Object.entries(hourlyData)
      .map(([key, data]) => ({
        dayHour: key,
        averagePrepTime: data.totalPrepTime / data.count,
        averageOrderVolume: data.avgOrderVolume / data.count,
        orderCount: data.count
      }))
      .sort((a, b) => b.averageOrderVolume - a.averageOrderVolume);

    return peakHours;
  } catch (error) {
    console.error('Error analyzing peak hours:', error);
    return [];
  }
};

const PrepTimeAnalytics = mongoose.model('PrepTimeAnalytics', prepTimeAnalyticsSchema);

export default PrepTimeAnalytics;