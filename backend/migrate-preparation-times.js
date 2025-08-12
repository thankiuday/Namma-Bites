import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PREP_TIMES = {
  'veg': 15,  // Default 15 minutes for veg items
  'non-veg': 20  // Default 20 minutes for non-veg items
};

// Common keywords that might indicate longer preparation times
const LONG_PREP_KEYWORDS = [
  'biryani', 'curry', 'roasted', 'grilled', 'baked',
  'special', 'platter', 'thali', 'combo'
];

// Function to estimate preparation time based on item details
const estimatePreparationTime = (item) => {
  // Start with default time based on category
  let baseTime = DEFAULT_PREP_TIMES[item.category] || 15;

  // Check name and description for keywords indicating longer prep time
  const itemText = `${item.name} ${item.description}`.toLowerCase();
  if (LONG_PREP_KEYWORDS.some(keyword => itemText.includes(keyword))) {
    baseTime += 10; // Add 10 minutes for items that typically take longer
  }

  return baseTime;
};

const migratePreparationTimes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all menu items
    const items = await MenuItem.find({});
    console.log(`Found ${items.length} menu items to process`);

    let updated = 0;
    let skipped = 0;

    // Process each item
    for (const item of items) {
      // Skip if already has a valid preparation time
      if (typeof item.preparationTime === 'number' && item.preparationTime > 0) {
        console.log(`Skipping ${item.name} - already has valid preparation time: ${item.preparationTime} minutes`);
        skipped++;
        continue;
      }

      // Convert existing string preparation time to number if possible
      let newPrepTime;
      if (typeof item.preparationTime === 'string' && item.preparationTime.trim()) {
        // Try to extract number from string (e.g., "20 mins" -> 20)
        const match = item.preparationTime.match(/\d+/);
        if (match) {
          newPrepTime = parseInt(match[0], 10);
        }
      }

      // If couldn't extract from string, estimate based on item details
      if (!newPrepTime || isNaN(newPrepTime)) {
        newPrepTime = estimatePreparationTime(item);
      }

      // Update the item
      await MenuItem.findByIdAndUpdate(item._id, {
        preparationTime: newPrepTime
      });

      console.log(`Updated ${item.name} - Set preparation time to ${newPrepTime} minutes`);
      updated++;
    }

    console.log('\nMigration Summary:');
    console.log(`Total items processed: ${items.length}`);
    console.log(`Items updated: ${updated}`);
    console.log(`Items skipped: ${skipped}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migratePreparationTimes();
