const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Group = require('../models/Group');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// Load env vars
dotenv.config({ path: '../.env' }); // Assuming script runs from backend/scripts/

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Since User model has a pre('save') hook, we should just use User.create.

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Group.deleteMany();
    await Task.deleteMany();
    await Activity.deleteMany();
    console.log('✅ Data cleared');

    console.log('Seeding new data...');
    const defaultPassword = 'password123';

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@pt.com',
      password: defaultPassword,
      role: 'superadmin',
    });
    console.log('✅ Super Admin created: superadmin@pt.com');

    // Groups to create
    const groupNames = ['alpha', 'beta', 'gamma'];

    for (const prefix of groupNames) {
        const groupNameStr = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Workspace';

        // 2. Create Group Admin
        const adminEmail = `admin.${prefix}@pt.com`;
        const adminUser = await User.create({
            name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Admin`,
            email: adminEmail,
            password: defaultPassword,
            role: 'admin'
        });

        // 3. Create Group
        const group = await Group.create({
            name: groupNameStr,
            plan: 'free',
            owner: adminUser._id,
            joinCode: prefix.toUpperCase() + '123'
        });

        // Assign Admin to Group
        adminUser.group = group._id;
        await adminUser.save();
        console.log(`✅ Admin created: ${adminEmail} for ${groupNameStr}`);

        // 4. Create Standard User 1 in Group
        const user1Email = `user1.${prefix}@pt.com`;
        const regularUser1 = await User.create({
            name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User 1`,
            email: user1Email,
            password: defaultPassword,
            role: 'user',
            group: group._id
        });

        // 5. Create Standard User 2 in Group
        const user2Email = `user2.${prefix}@pt.com`;
        const regularUser2 = await User.create({
            name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User 2`,
            email: user2Email,
            password: defaultPassword,
            role: 'user',
            group: group._id
        });
        console.log(`✅ Users created: ${user1Email}, ${user2Email} for ${groupNameStr}`);

        // 6. Create Tasks for the Group
        // Admin task - pending
        await Task.create({
            title: `Review Marketing Materials`,
            description: `Please review the new ads.`,
            status: 'pending',
            priority: 'medium',
            user: adminUser._id, // Created by admin
            assignedTo: [regularUser1._id], // Assigned to user1
            group: group._id
        });

        // Admin task - in-progress
        await Task.create({
            title: `Q1 Sales Report Compilation`,
            description: `Compile the sales data for Q1.`,
            status: 'in-progress',
            priority: 'high',
            user: adminUser._id,
            assignedTo: [regularUser2._id],
            acceptedBy: [regularUser2._id], // User has accepted it
            group: group._id
        });

        // Admin task - completed
        await Task.create({
            title: `Client Onboarding Guide`,
            description: `Update the onboarding documents.`,
            status: 'completed',
            priority: 'medium',
            user: adminUser._id,
            assignedTo: [regularUser1._id, regularUser2._id],
            acceptedBy: [regularUser1._id, regularUser2._id], // Both accepted
            group: group._id
        });

        // User task request - pending-approval
        await Task.create({
            title: `Upgrade Software Licenses`,
            description: `Requesting approval to upgrade our team's tools.`,
            status: 'pending-approval',
            priority: 'medium',
            user: regularUser1._id, // Created by user1
            assignedTo: [], 
            group: group._id
        });

        // User initiative - completed
        await Task.create({
            title: `Organize Team Shared Drive`,
            description: `Cleaned up the old folders.`,
            status: 'completed',
            priority: 'low',
            user: regularUser2._id, // Created by user2
            assignedTo: [regularUser2._id],
            acceptedBy: [regularUser2._id],
            group: group._id
        });

        console.log(`✅ Assorted Tasks created for ${groupNameStr}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error}`);
    process.exit(1);
  }
};

seedData();
