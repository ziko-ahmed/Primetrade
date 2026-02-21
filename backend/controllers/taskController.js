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
    let query = {};
    if (req.user.role === 'superadmin') {
      // Superadmin sees all tasks globally
      query = {};
    } else if (req.user.role === 'admin') {
      // Group Admin sees all tasks in their group
      query = { group: req.user.group };
    } else {
      // User sees tasks assigned to them OR created by them, inside their group
      query = {
        group: req.user.group,
        $or: [{ assignedTo: req.user.id }, { user: req.user.id }]
      };
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('acceptedBy', 'name email');
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

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const taskStatus = isAdmin ? (req.body.status || 'pending') : 'pending-approval';

    let targetGroup = req.user.group;
    if (req.user.role === 'superadmin' && req.body.group) {
        targetGroup = req.body.group;
    }

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: taskStatus,
      priority: req.body.priority || 'medium',
      assignedTo: isAdmin ? assignedToArray : [req.user.id],
      user: req.user.id, // creator
      group: targetGroup, // Scoped to workspace/group
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
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    // Access Control: Superadmin is god. Admin must match group. User must match owner or assignee.
    if (req.user.role !== 'superadmin') {
      if (task.group && task.group.toString() !== req.user.group.toString()) {
        res.status(403);
        throw new Error('You cannot modify tasks outside your workspace');
      }

      if (task.user.toString() !== req.user.id && !isAssigned && req.user.role !== 'admin' && !isTakingInitiative) {
        res.status(401);
        throw new Error('User not authorized');
      }
    }

    // Role Constraints
    if (!isAdmin) {
      delete req.body.priority; // User Cannot Change Priority
    }

    if (isTakingInitiative && !isAdmin) {
      req.body.status = 'pending-approval';
    }

    // Build update object
    const updateOps = { $set: req.body };

    // Auto-accept: if a non-admin user moves a task to in-progress or completed
    if (!isAdmin && req.body.status && ['in-progress', 'completed'].includes(req.body.status)) {
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

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) {
      res.status(401);
      throw new Error('Only Admins can delete tasks.');
    }

    if (req.user.role !== 'superadmin' && task.group && task.group.toString() !== req.user.group.toString()) {
      res.status(403);
      throw new Error('Cannot delete tasks outside your workspace');
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
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(401);
      throw new Error('Not authorized');
    }

    let query = {};
    if (req.user.role === 'admin') {
      query.group = req.user.group;
    }

    const totalTasks = await Task.countDocuments(query);
    const completedTasks = await Task.countDocuments({ ...query, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...query, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...query, status: 'in-progress' });
    const pendingApprovalTasks = await Task.countDocuments({ ...query, status: 'pending-approval' });

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
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      res.status(401);
      throw new Error('Not authorized');
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role !== 'superadmin' && task.group && task.group.toString() !== req.user.group.toString()) {
      res.status(403);
      throw new Error('Cannot approve tasks outside your workspace');
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

    if (task.group && task.group.toString() !== req.user.group.toString() && req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error('Cannot modify tasks outside your workspace');
    }

    const isAssigned = task.assignedTo && task.assignedTo.some(id => id.toString() === req.user.id);
    if (!isAssigned && req.user.role !== 'superadmin') {
      res.status(401);
      throw new Error('You are not assigned to this task');
    }

    const alreadyAccepted = task.acceptedBy && task.acceptedBy.some(id => id.toString() === req.user.id);
    if (alreadyAccepted) {
      res.status(400);
      throw new Error('You have already accepted this task');
    }

    task.acceptedBy = task.acceptedBy || [];
    task.acceptedBy.push(req.user.id);

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
