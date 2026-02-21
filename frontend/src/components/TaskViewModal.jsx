import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, CircleDashed, AlertCircle, User, Calendar } from 'lucide-react';

const TaskViewModal = ({ isOpen, onClose, task }) => {
    if (!task) return null;

    const statusColors = {
        'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        'pending-approval': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };

    const priorityColors = {
        'low': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        'medium': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        'high': 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    const StatusIcon = {
        'pending': CircleDashed,
        'in-progress': Clock,
        'completed': CheckCircle,
        'pending-approval': Clock,
    }[task.status] || CircleDashed;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const isAssigned = task.assignedTo && task.assignedTo.length > 0;
    const acceptedIds = new Set((task.acceptedBy || []).map(u => u._id || u));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-card relative w-full max-w-lg shadow-2xl z-10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start p-6 pb-4 border-b border-border-main">
                            <div className="flex-1 min-w-0 pr-4">
                                <h2 className="text-xl font-bold text-text-main mb-2">{task.title}</h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[task.status] || statusColors.pending}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span className="capitalize">{task.status.replace('-', ' ')}</span>
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${priorityColors[task.priority] || priorityColors.medium}`}>
                                        {task.priority || 'Medium'} Priority
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Description</h4>
                                <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">
                                    {task.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Assignees with Acceptance Status */}
                            <div>
                                <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">
                                    {task.status === 'pending-approval' ? 'Requested By' : 'Team Members'}
                                </h4>
                                {isAssigned ? (
                                    <div className="space-y-2">
                                        {task.assignedTo.map((u, i) => {
                                            const accepted = acceptedIds.has(u._id);
                                            return (
                                                <div key={u._id || i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${accepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface border-border-main'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5 text-primary-500" />
                                                        <span className="text-text-main">{u.name || u.email || 'Unknown'}</span>
                                                    </div>
                                                    {task.status !== 'pending-approval' && (
                                                        accepted ? (
                                                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Accepted
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Pending
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-text-muted text-sm italic">Not yet assigned</p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <h4 className="text-text-muted font-semibold mb-1 uppercase tracking-wider text-xs">Created</h4>
                                    <div className="flex items-center gap-1.5 text-text-main">
                                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                        {formatDate(task.createdAt)}
                                    </div>
                                </div>
                                {task.updatedAt && task.updatedAt !== task.createdAt && (
                                    <div>
                                        <h4 className="text-text-muted font-semibold mb-1 uppercase tracking-wider text-xs">Updated</h4>
                                        <div className="flex items-center gap-1.5 text-text-main">
                                            <Clock className="w-3.5 h-3.5 text-primary-500" />
                                            {formatDate(task.updatedAt)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-4 border-t border-border-main">
                            <button onClick={onClose} className="btn-secondary w-full">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TaskViewModal;
