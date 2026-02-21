const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Get all groups (Super Admin only)
// @route   GET /api/groups
// @access  Super Admin
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('owner', 'name email');
    
    // We can also fetch the user count and the actual users for each group
    const groupsWithStats = await Promise.all(groups.map(async (group) => {
        const users = await User.find({ group: group._id }).select('-password');
        return {
            ...group.toObject(),
            userCount: users.length,
            users
        };
    }));

    res.status(200).json(groupsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update group plan
// @route   PUT /api/groups/:id
// @access  Super Admin
const updateGroupPlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const group = await Group.findByIdAndUpdate(req.params.id, { plan }, { new: true });
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// @desc    Get current user's group
// @route   GET /api/groups/my-group
// @access  Private
const getMyGroup = async (req, res) => {
    try {
        if (!req.user.group) {
            res.status(404);
            throw new Error('User does not belong to a group');
        }
        const group = await Group.findById(req.user.group);
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// @desc    Suspend/Unsuspend group
// @route   PUT /api/groups/:id/suspend
// @access  Super Admin
const suspendGroup = async (req, res) => {
    try {
        const { isSuspended } = req.body;
        const group = await Group.findByIdAndUpdate(req.params.id, { isSuspended }, { new: true });
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete group (Cascade delete users/tasks)
// @route   DELETE /api/groups/:id
// @access  Super Admin
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Delete associated tasks (Requires Task model import, assuming it's available or we can just require it inline)
        const Task = require('../models/Task');
        await Task.deleteMany({ group: group._id });
        
        // Delete users in the group
        await User.deleteMany({ group: group._id });

        // Finally delete the group
        await group.deleteOne();

        res.status(200).json({ message: 'Workspace and all associated data permanently deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
  getGroups,
  updateGroupPlan,
  getMyGroup,
  suspendGroup,
  deleteGroup
};
