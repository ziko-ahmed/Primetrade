const Activity = require('../models/Activity');

// @desc    Get activity feed
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email avatar')
      .populate('task', 'title priority status')
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 activities
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActivities
};
