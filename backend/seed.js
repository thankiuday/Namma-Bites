// seed.js
// A script to populate the MongoDB database with 95 test users.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- User Model Schema ---
// We define the schema here to make the script self-contained.
// This should match your existing `backend/models/User.js` file.
// UPDATED: The userType enum now matches the roles from the Signup form.
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  userType: { type: String, enum: ['Student', 'Faculty', 'Guest'], default: 'Student' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);


// --- Configuration ---
// !!! IMPORTANT: Replace this with your actual MongoDB connection string !!!
const MONGO_URI = 'mongodb://127.0.0.1:27017/namma_bites'; // Or your Atlas connection string

/**
 * Generates and seeds the database with test users.
 */
const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // Optional: Clear existing users to start with a clean slate
    await User.deleteMany({});
    console.log('Existing users cleared.');

    const usersToCreate = [];
    const totalUsers = 95;
    const defaultPassword = '123456';
    const userRoles = ['Student', 'Faculty', 'Guest']; // Roles from Signup.jsx

    console.log(`Generating ${totalUsers} new users...`);

    for (let i = 6; i <= 100; i++) {
      // Hash the default password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      // Generate a random 10-digit mobile number
      const mobileNumber = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

      // UPDATED: Randomly assign a user type from the available roles
      const randomUserType = userRoles[Math.floor(Math.random() * userRoles.length)];

      const newUser = {
        username: `u${i}`,
        email: `u${i}@gmail.com`,
        fullName: `User FullName ${i}`, // Corresponds to 'name' in Signup form
        password: hashedPassword,
        mobileNumber: mobileNumber,
        userType: randomUserType, // Corresponds to 'role' in Signup form
      };
      usersToCreate.push(newUser);
    }

    // Insert all the generated users in a single batch
    await User.insertMany(usersToCreate);

    console.log(`Successfully inserted ${usersToCreate.length} users into the database.`);

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// Run the seeding function
seedUsers();
