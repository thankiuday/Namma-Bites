import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/namma-bites');
    console.log('Connected to MongoDB');

    // Find the admin with the problematic email
    const email = 'abc@gmail.com';
    const newPassword = '123456';
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`Admin with email ${email} not found`);
      return;
    }

    console.log(`Found admin: ${admin.name} (${admin.email})`);
    console.log(`Role: ${admin.role}, Approved: ${admin.isApproved}`);

    // Set the new password (this will trigger the pre-save hook to hash it properly)
    admin.password = newPassword;
    await admin.save();

    console.log(`Password reset successfully for ${email}`);
    console.log('You can now login with the password:', newPassword);

  } catch (error) {
    console.error('Error fixing admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixAdminPassword();
