#!/usr/bin/env node
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import MenuItem from './models/MenuItem.js';
import { uploadMenuItemToCloudinary } from './config/cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(__dirname, '../uploads');

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_bites';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const legacyItems = await MenuItem.find({ image: { $regex: '^/uploads/' } }).lean();
    console.log(`Found ${legacyItems.length} menu items with local images to migrate`);

    let migrated = 0;
    for (const item of legacyItems) {
      try {
        const relPath = item.image.replace(/^\/uploads\//, '');
        const absolutePath = path.join(uploadsRoot, relPath);
        if (!fs.existsSync(absolutePath)) {
          console.warn(`File not found on disk for item ${item._id}: ${absolutePath}`);
          continue;
        }
        const buffer = fs.readFileSync(absolutePath);
        const result = await uploadMenuItemToCloudinary(buffer, item.vendor?.toString() || null, item.name || 'menu');
        if (!result?.secure_url) {
          console.warn(`Cloudinary upload returned no secure_url for item ${item._id}`);
          continue;
        }
        await MenuItem.updateOne({ _id: item._id }, { $set: { image: result.secure_url } });
        migrated += 1;
        console.log(`Migrated ${item._id} -> ${result.secure_url}`);
      } catch (e) {
        console.error(`Failed to migrate item ${item._id}:`, e.message);
      }
    }

    console.log(`Migration completed. Migrated ${migrated}/${legacyItems.length} items.`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
