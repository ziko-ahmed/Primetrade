const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password').populate('group', 'isSuspended');
      
      if (!req.user || req.user.isActive === false || req.user.isSuspended) {
        res.status(403);
        throw new Error('Not authorized or account suspended');
      }

      if (req.user.role !== 'superadmin' && req.user.group && req.user.group.isSuspended) {
          res.status(403);
          throw new Error('This workspace has been suspended by the platform administrator.');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a super admin');
  }
};

module.exports = { protect, adminOnly, superAdminOnly };
