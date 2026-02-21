require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');
const Group = require('../models/Group');

const migrate = async () => {
  await connectDB();

  try {
    console.log('Starting migration...');

    // 1. Check if there are any users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Migration not needed.');
      process.exit(0);
    }

    // 2. See if a legacy group already exists
    let legacyGroup = await Group.findOne({ name: 'Legacy Workspace' });
    
    // 3. Find an owner for the group (preferably an admin)
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    
    if (!adminUser) {
        console.log('Unexpected: Users exist but none could be found as owner.');
        process.exit(1);
    }

    if (!legacyGroup) {
      console.log('Creating legacy workspace...');
      legacyGroup = await Group.create({
        name: 'Legacy Workspace',
        plan: 'pro', // Give legacy users pro by default to not break things
        owner: adminUser._id
      });
    } else {
      console.log('Legacy workspace already exists.');
    }

    // 4. Make the owner a superadmin
    console.log(`Promoting user ${adminUser.email} to superadmin...`);
    adminUser.role = 'superadmin';
    adminUser.group = legacyGroup._id;
    await adminUser.save();

    // 5. Update all other users to belong to the legacy group
    console.log('Migrating users...');
    const usersResult = await User.updateMany(
      { group: { $exists: false } },
      { $set: { group: legacyGroup._id } }
    );
    console.log(`Updated ${usersResult.modifiedCount} users.`);

    // 6. Update all tasks to belong to the legacy group
    console.log('Migrating tasks...');
    const tasksResult = await Task.updateMany(
      { group: { $exists: false } },
      { $set: { group: legacyGroup._id } }
    );
    console.log(`Updated ${tasksResult.modifiedCount} tasks.`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
