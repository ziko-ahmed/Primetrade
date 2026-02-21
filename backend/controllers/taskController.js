const Task = require('../models/Task');
const Activity = require('../models/Activity');

// Helper to log and emit
const logActivity = async (req, action, task, details) => {
  try {
    const io = req.app.get('io');
    const activity = await Activity.create({
      user: req.user.id,
      action,
      task: task ? task._id : null,
      details
    });
    const populated = await activity.populate('user', 'name');
    if (io) io.emit('activity_logged', populated);
  } catch(err) {
    console.error('Failed to log activity', err);
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      // Admin sees all tasks
      tasks = await Task.find().populate('assignedTo', 'name email').populate('acceptedBy', 'name email');
    } else {
      // User sees tasks assigned to them OR created by them
      tasks = await Task.find({
        $or: [{ assignedTo: req.user.id }, { user: req.user.id }]
      }).populate('assignedTo', 'name email').populate('acceptedBy', 'name email');
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const setTask = async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      res.status(400);
      throw new Error('Please add a title and description');
    }

    let assignedToArray = [];
    if (req.body.assignedTo) {
      assignedToArray = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
    }

    const isAdmin = req.user.role === 'admin';
    const taskStatus = isAdmin ? (req.body.status || 'pending') : 'pending-approval';

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: taskStatus,
      priority: req.body.priority || 'medium',
      assignedTo: isAdmin ? assignedToArray : [req.user.id],
      user: req.user.id, // creator
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('acceptedBy', 'name email');

    await logActivity(req, 'created task', task, `Created new task: ${task.title}`);
    
    const io = req.app.get('io');
    if (io) io.emit('task_created', task);

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    let isTakingInitiative = false;
    if (req.body.assignedTo !== undefined) {
      const assignedToArray = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
      req.body.assignedTo = assignedToArray;
      isTakingInitiative = (!task.assignedTo || task.assignedTo.length === 0) && assignedToArray.includes(req.user.id);
    }

    const isAssigned = task.assignedTo && task.assignedTo.some(id => id.toString() === req.user.id);

    // Make sure the logged in user matches the task user OR task assignee OR user is admin
    if (
      task.user.toString() !== req.user.id &&
      !isAssigned &&
      req.user.role !== 'admin' &&
      !isTakingInitiative
    ) {
      res.status(401);
      throw new Error('User not authorized');
    }

    // Role Constraints
    if (req.user.role !== 'admin') {
      delete req.body.priority; // User Cannot Change Priority
    }

    if (isTakingInitiative && req.user.role !== 'admin') {
      req.body.status = 'pending-approval';
    }

    // Build update object
    const updateOps = { $set: req.body };

    // Auto-accept: if a non-admin user moves a task to in-progress or completed, add them to acceptedBy
    if (req.user.role !== 'admin' && req.body.status && ['in-progress', 'completed'].includes(req.body.status)) {
      updateOps.$addToSet = { acceptedBy: req.user.id };
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateOps, {
      new: true,
    }).populate('assignedTo', 'name email').populate('acceptedBy', 'name email');

    await logActivity(req, 'updated task', updatedTask, `Updated task: ${updatedTask.title}`);
    
    const io = req.app.get('io');
    if (io) io.emit('task_updated', updatedTask);

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Make sure user is admin (Constraint 2)
    if (req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Only Admins can delete tasks.');
    }

    const taskTitle = task.title;
    await task.deleteOne();

    await logActivity(req, 'deleted task', null, `Deleted task: ${taskTitle}`);
    
    const io = req.app.get('io');
    if (io) io.emit('task_deleted', req.params.id);

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get Admin Analytics
// @route   GET /api/tasks/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized');
    }
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const pendingApprovalTasks = await Task.countDocuments({ status: 'pending-approval' });

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      pendingApprovalTasks
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve Task Assignment
// @route   PUT /api/tasks/:id/approve
// @access  Private/Admin
const approveAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized');
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.status !== 'pending-approval') {
      res.status(400);
      throw new Error('Task is not pending approval');
    }

    task.status = 'pending';
    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'name email');
    await updatedTask.populate('acceptedBy', 'name email');

    await logActivity(req, 'approved task', updatedTask, `Approved assignment for task: ${updatedTask.title}`);
    
    const io = req.app.get('io');
    if (io) io.emit('task_updated', updatedTask);

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Accept Task (per-user)
// @route   PUT /api/tasks/:id/accept
// @access  Private
const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check that user is assigned to this task
    const isAssigned = task.assignedTo && task.assignedTo.some(id => id.toString() === req.user.id);
    if (!isAssigned) {
      res.status(401);
      throw new Error('You are not assigned to this task');
    }

    // Check if already accepted
    const alreadyAccepted = task.acceptedBy && task.acceptedBy.some(id => id.toString() === req.user.id);
    if (alreadyAccepted) {
      res.status(400);
      throw new Error('You have already accepted this task');
    }

    // Add user to acceptedBy
    task.acceptedBy = task.acceptedBy || [];
    task.acceptedBy.push(req.user.id);

    // Only move to in-progress once ALL assigned users have accepted
    if (task.status === 'pending') {
      const allAssignedIds = task.assignedTo.map(id => id.toString());
      const allAcceptedIds = task.acceptedBy.map(id => id.toString());
      const allAccepted = allAssignedIds.every(id => allAcceptedIds.includes(id));
      if (allAccepted) {
        task.status = 'in-progress';
      }
    }

    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'name email');
    await updatedTask.populate('acceptedBy', 'name email');

    await logActivity(req, 'accepted task', updatedTask, `Accepted task: ${updatedTask.title}`);
    
    const io = req.app.get('io');
    if (io) io.emit('task_updated', updatedTask);

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  setTask,
  updateTask,
  deleteTask,
  getAnalytics,
  approveAssignment,
  acceptTask
};
