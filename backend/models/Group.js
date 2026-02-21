const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a group name'],
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true
    },
    isSuspended: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
