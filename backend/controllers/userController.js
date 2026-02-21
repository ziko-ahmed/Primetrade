const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
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

    const user = await User.create({
      name,
      email,
      password, // Pre-save hook hashes it
      role: role || 'user',
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
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

    // Prevent changing the main admin's email or role easily
    if (user.email === 'admin@primetrade.com' && req.body.role === 'user') {
       res.status(400);
       throw new Error('Cannot demote the primary admin');
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

    if (user.email === 'admin@primetrade.com') {
        res.status(400);
        throw new Error('Cannot suspend the primary admin account');
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

    if (user.email === 'admin@primetrade.com') {
      res.status(400);
      throw new Error('Cannot delete the primary admin account');
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
