const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const Group = require('../models/Group');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, groupName, joinCode } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    if (joinCode) {
        // Look up group by join code
        const group = await Group.findOne({ joinCode: joinCode.toUpperCase() });
        if (!group) {
            res.status(404);
            throw new Error('Invalid Join Code');
        }

        // Check plan limits
        if (group.plan === 'free') {
            const userCount = await User.countDocuments({ group: group._id });
            if (userCount >= 5) {
                res.status(403);
                throw new Error('This workspace has reached its member limit (5).');
            }
        }

        // Create standard user
        const user = await User.create({
            name,
            email,
            password,
            role: 'user',
            group: group._id
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            group: user.group,
            token: generateToken(user._id),
        });
        return;
    }

    if (!groupName) {
        res.status(400);
        throw new Error('Please provide a Workspace Name or a Join Code');
    }

    // Create user (temporarily without group)
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin', // First user of a new group is an admin
    });

    const newJoinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create a group for this user
    const finalGroupName = groupName || `${name}'s Workspace`;
    const group = await Group.create({
      name: finalGroupName,
      plan: 'free',
      owner: user._id,
      joinCode: newJoinCode
    });

    // Assign group to user
    user.group = group._id;
    await user.save();

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group: user.group,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isActive === false) {
        res.status(403);
        throw new Error('Your account is suspended. Please contact the administrator.');
      }
      
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
};
