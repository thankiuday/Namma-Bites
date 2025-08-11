#!/usr/bin/env node
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import UserSubscription from './models/UserSubscription.js';
import { uploadPaymentProofToCloudinary } from './config/cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(__dirname, '../uploads');

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_bites';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const subs = await UserSubscription.find({ paymentProof: { $regex: '^/uploads/' } }).lean();
    console.log(`Found ${subs.length} subscriptions with local payment proof to migrate`);

    let migrated = 0;
    for (const sub of subs) {
      try {
        const relPath = sub.paymentProof.replace(/^\/uploads\//, '');
        const absolutePath = path.join(uploadsRoot, relPath);
        if (!fs.existsSync(absolutePath)) {
          console.warn(`File not found on disk for subscription ${sub._id}: ${absolutePath}`);
          continue;
        }
        const buffer = fs.readFileSync(absolutePath);
        const result = await uploadPaymentProofToCloudinary(buffer, sub.user?.toString() || null, sub._id.toString());
        if (!result?.secure_url) {
          console.warn(`Cloudinary upload returned no secure_url for subscription ${sub._id}`);
          continue;
        }
        await UserSubscription.updateOne({ _id: sub._id }, { $set: { paymentProof: result.secure_url } });
        migrated += 1;
        console.log(`Migrated subscription ${sub._id} -> ${result.secure_url}`);
      } catch (e) {
        console.error(`Failed to migrate subscription ${sub._id}:`, e.message);
      }
    }

    console.log(`Migration completed. Migrated ${migrated}/${subs.length} subscriptions.`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
