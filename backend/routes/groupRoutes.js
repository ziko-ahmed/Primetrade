const express = require('express');
const router = express.Router();
const { getGroups, updateGroupPlan, getMyGroup, suspendGroup, deleteGroup } = require('../controllers/groupController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, superAdminOnly, getGroups);
router.get('/my-group', protect, getMyGroup);
router.put('/:id', protect, superAdminOnly, updateGroupPlan);
router.put('/:id/suspend', protect, superAdminOnly, suspendGroup);
router.delete('/:id', protect, superAdminOnly, deleteGroup);

module.exports = router;
