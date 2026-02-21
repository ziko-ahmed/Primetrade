const express = require('express');
const router = express.Router();
const {
  getTasks,
  setTask,
  updateTask,
  deleteTask,
  getAnalytics,
  approveAssignment,
  acceptTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management CRUD
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Returns the list of all the tasks for logged in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the tasks
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *     responses:
 *       201:
 *         description: The created task.
 *       400:
 *         description: Bad request.
 */
router.route('/').get(protect, getTasks).post(protect, setTask);

router.get('/analytics', protect, getAnalytics);
router.put('/:id/approve', protect, approveAssignment);
router.put('/:id/accept', protect, acceptTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *     responses:
 *       200:
 *         description: The updated task
 *       404:
 *         description: The task was not found
 *   delete:
 *     summary: Delete a task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: The deleted task id
 *       404:
 *         description: The task was not found
 */
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
