const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  suspendUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminOnly, getUsers)
  .post(protect, adminOnly, createUser);

router.route('/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

router.put('/:id/suspend', protect, adminOnly, suspendUser);

module.exports = router;
