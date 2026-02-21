const User = require('../models/User');
const Group = require('../models/Group');
const bcrypt = require('bcryptjs');

// Helper to check if user has access to target user
const checkAccess = (reqUser, targetUser) => {
  if (reqUser.role === 'superadmin') return true;
  return targetUser.group && targetUser.group.toString() === reqUser.group.toString();
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin Private
const getUsers = async (req, res) => {
  try {
    let query = {};
    // Group Admins only see their group's users. Superadmins see all.
    if (req.user.role !== 'superadmin') {
      query.group = req.user.group;
    }
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a user manually
// @route   POST /api/users
// @access  Admin Private
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Check Group Limits if the creator is not a superadmin creating a loose user
    let targetGroup = req.user.group;
    if (req.user.role === 'superadmin' && req.body.group) {
        targetGroup = req.body.group; // Allow superadmin to specify group, else their own group
    }

    if (targetGroup && req.user.role !== 'superadmin') {
      const group = await Group.findById(targetGroup);
      if (group && group.plan === 'free') {
        const userCount = await User.countDocuments({ group: targetGroup });
        if (userCount >= 5) {
          res.status(403);
          throw new Error('Member limit reached for Free Plan (5 max). Please upgrade to add more users.');
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password, // Pre-save hook hashes it
      role: role || 'user',
      group: targetGroup,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      group: user.group,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Admin Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!checkAccess(req.user, user)) {
      res.status(403);
      throw new Error('Cannot edit users outside your workspace');
    }

    // Prevent changing the main admin's email or role easily
    if (user.role === 'superadmin' && req.body.role && req.body.role !== 'superadmin' && req.user.role !== 'superadmin') {
       res.status(403);
       throw new Error('Cannot demote a superadmin');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        role: req.body.role || user.role,
      },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Suspend/Unsuspend a user
// @route   PUT /api/users/:id/suspend
// @access  Admin Private
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!checkAccess(req.user, user)) {
      res.status(403);
      throw new Error('Cannot edit users outside your workspace');
    }

    if (user.role === 'superadmin') {
        res.status(400);
        throw new Error('Cannot suspend a superadmin account');
    }

    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!checkAccess(req.user, user)) {
      res.status(403);
      throw new Error('Cannot delete users outside your workspace');
    }

    if (user.role === 'superadmin') {
      res.status(400);
      throw new Error('Cannot delete a superadmin account');
    }

    await user.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  suspendUser,
  deleteUser,
};
