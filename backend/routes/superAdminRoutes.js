const express = require('express');
const router = express.Router();
const {
    getGlobalAnalytics,
    searchUsers,
    updateUser,
    getAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    getAuditLogs,
    impersonateUser
} = require('../controllers/superAdminController');

const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// Public/Protected read for announcements
router.get('/announcements', protect, getAnnouncements);

// Super Admin Only Base Routing
router.use(protect, superAdminOnly);

// Analytics
router.get('/analytics', getGlobalAnalytics);

// User Management
router.get('/users/search', searchUsers);
router.put('/users/:id', updateUser);
router.post('/impersonate/:id', impersonateUser);

// Announcements (Write)
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', toggleAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
