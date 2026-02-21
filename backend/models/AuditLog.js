const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        enum: ['group', 'user', 'task', 'system'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Might be null for system-wide actions
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    details: {
        type: Object, // Stores unstructured metadata about the action (e.g. { previousPlan: 'free', newPlan: 'pro' })
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
