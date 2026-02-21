const User = require('../models/User');
const Group = require('../models/Group');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// @desc    Get global platform analytics
// @route   GET /api/super-admin/analytics
// @access  Super Admin
const getGlobalAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ $or: [{ isSuspended: false }, { isSuspended: { $exists: false } }] });
        
        const totalWorkspaces = await Group.countDocuments();
        const activeWorkspacesCount = await Group.countDocuments({ $or: [{ isSuspended: false }, { isSuspended: { $exists: false } }] });
        const freeWorkspaces = await Group.countDocuments({ plan: 'free' });
        const proWorkspaces = await Group.countDocuments({ plan: 'pro' });

        const totalTasks = await Task.countDocuments();
        const todoTasks = await Task.countDocuments({ status: 'pending' });
        const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
        const doneTasks = await Task.countDocuments({ status: 'completed' });

        res.status(200).json({
            users: {
                total: totalUsers,
                active: activeUsersCount,
                suspended: totalUsers - activeUsersCount
            },
            workspaces: {
                total: totalWorkspaces,
                active: activeWorkspacesCount,
                suspended: totalWorkspaces - activeWorkspacesCount,
                free: freeWorkspaces,
                pro: proWorkspaces
            },
            tasks: {
                total: totalTasks,
                todo: todoTasks,
                inProgress: inProgressTasks,
                done: doneTasks
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Global fuzzy search across all users
// @route   GET /api/super-admin/users/search?q=
// @access  Super Admin
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        let users;

        if (!query || query === 'undefined' || query === 'null') {
            users = await User.find()
                .select('-password')
                .populate('group', 'name isSuspended')
                .sort({ createdAt: -1 })
                .limit(100);
        } else {
            users = await User.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            })
            .select('-password')
            .populate('group', 'name isSuspended')
            .limit(100);
        }

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update a specific user's properties (role, suspension)
// @route   PUT /api/super-admin/users/:id
// @access  Super Admin
const updateUser = async (req, res) => {
    try {
        const { role, isSuspended } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (role) user.role = role;
        if (typeof isSuspended === 'boolean') user.isSuspended = isSuspended;

        await user.save();

        // Audit Log
        await AuditLog.create({
            action: 'USER_UPDATED',
            entityType: 'user',
            entityId: user._id,
            performedBy: req.user._id,
            details: { updatedFields: req.body }
        });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all announcements
// @route   GET /api/super-admin/announcements
// @access  Private (Anyone can read active)
const getAnnouncements = async (req, res) => {
    try {
        // Different behavior based on role
        const query = (req.user && req.user.role === 'superadmin') ? {} : { isActive: true };
        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create new announcement
// @route   POST /api/super-admin/announcements
// @access  Super Admin
const createAnnouncement = async (req, res) => {
    try {
        const { message, type } = req.body;
        
        const announcement = await Announcement.create({
            message,
            type: type || 'info',
            createdBy: req.user._id
        });

        await AuditLog.create({
            action: 'ANNOUNCEMENT_CREATED',
            entityType: 'system',
            performedBy: req.user._id,
            details: { announcementId: announcement._id }
        });

        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Toggle announcement status
// @route   PUT /api/super-admin/announcements/:id
// @access  Super Admin
const toggleAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            res.status(404);
            throw new Error('Announcement not found');
        }
        
        announcement.isActive = !announcement.isActive;
        await announcement.save();

        res.status(200).json(announcement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/super-admin/announcements/:id
// @access  Super Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if(!announcement){
            res.status(404);
            throw new Error('Announcement not found');
        }
        await announcement.deleteOne();
        res.status(200).json({ message: 'Announcement removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// @desc    Get audit logs
// @route   GET /api/super-admin/audit-logs
// @access  Super Admin
const getAuditLogs = async (req, res) => {
    try {
        let logs = await AuditLog.find()
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(100); // Pagination in future
        
        // Enhance logs with readable names instead of raw ObjectIDs
        logs = await Promise.all(logs.map(async (log) => {
            const logObj = log.toObject();
            
            if (logObj.details && logObj.details.announcementId) {
                const announcement = await Announcement.findById(logObj.details.announcementId);
                if (announcement) {
                    logObj.details.announcementMessage = announcement.message;
                    delete logObj.details.announcementId;
                }
            }
            
            return logObj;
        }));

        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Impersonate User
// @route   POST /api/super-admin/impersonate/:id
// @access  Super Admin
const impersonateUser = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id).select('-password');
        if (!targetUser) {
            res.status(404);
            throw new Error('User not found');
        }

        if (targetUser.role === 'superadmin') {
            res.status(403);
            throw new Error('Cannot impersonate another super admin');
        }

        await AuditLog.create({
            action: 'IMPERSONATION_STARTED',
            entityType: 'user',
            entityId: targetUser._id,
            performedBy: req.user._id
        });

        // Generate a standard JWT explicitly for the target user ID
        const token = jwt.sign({ id: targetUser._id }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '1h', // Short lived token
        });

        res.status(200).json({
            _id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            group: targetUser.group,
            token,
            isImpersonated: true // Flag to signal frontend
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getGlobalAnalytics,
    searchUsers,
    updateUser,
    getAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    getAuditLogs,
    impersonateUser
};
