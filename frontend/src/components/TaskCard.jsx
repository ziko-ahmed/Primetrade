import { motion } from 'framer-motion';
import { Edit2, Trash2, Clock, CheckCircle, CircleDashed, Rocket, User, AlertCircle, Eye, ShieldCheck } from 'lucide-react';

const LifespanVisualizer = ({ createdAt, status }) => {
    if (status !== 'pending' && status !== 'pending-approval') return null;

    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now - createdDate) / (1000 * 60 * 60);
    const maxHours = 48;
    let percentage = Math.min((hoursElapsed / maxHours) * 100, 100);

    let colorClass = 'bg-emerald-500';
    if (percentage > 50) colorClass = 'bg-yellow-500';
    if (percentage > 80) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';

    return (
        <div className="w-full bg-border-main/50 rounded-full h-1.5 mt-2 mb-4 overflow-hidden" title={`${Math.round(hoursElapsed)} hours since creation`}>
            <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${colorClass}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

const TaskCard = ({ task, onEdit, onDelete, onTakeInitiative, onAccept, onView, onApprove, currentUser }) => {
    const statusColors = {
        'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        'pending-approval': 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    };

    const priorityColors = {
        'low': 'text-text-muted',
        'medium': 'text-blue-500',
        'high': 'text-red-500 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'
    };

    const StatusIcon = {
        'pending': CircleDashed,
        'in-progress': Clock,
        'completed': CheckCircle,
        'pending-approval': AlertCircle
    }[task.status];

    const Icon = StatusIcon || CircleDashed;

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const isAssigned = task.assignedTo && task.assignedTo.length > 0;
    const isAssignedToMe = isAssigned && task.assignedTo.some(u => (u._id || u) === currentUser?._id);
    const hasAccepted = task.acceptedBy && task.acceptedBy.some(id => (id._id || id) === currentUser?._id);
    const isPendingApproval = task.status === 'pending-approval';
    const isCompleted = task.status === 'completed';
    const canTakeInitiative = !isAssigned && currentUser?.role !== 'admin' && !isPendingApproval;
    // Show accept if: assigned to me, I haven't accepted yet, task isn't completed or pending-approval
    const needsAcceptance = isAssignedToMe && !hasAccepted && !isCompleted && !isPendingApproval && currentUser?.role !== 'admin';
    const canApprove = isPendingApproval && currentUser?.role === 'admin';
    const canEdit = currentUser?.role === 'admin';
    const canDelete = currentUser?.role === 'admin';
    const acceptedCount = (task.acceptedBy || []).length;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`glass-card group flex flex-col transition-all duration-300 ${needsAcceptance ? 'border-primary-500/80 shadow-[0_0_15px_rgba(56,189,248,0.2)]' :
                (task.priority === 'high' ? 'border-red-500/30 hover:border-red-500/50' : 'hover:border-primary-500/30')
                }`}
        >
            <div className="flex flex-wrap justify-between items-start mb-3 gap-y-2 gap-x-3">
                <h3 className="text-lg font-semibold text-text-main line-clamp-1 flex-1">{task.title}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${statusColors[task.status] || statusColors.pending}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded-md border border-border-main">
                    <AlertCircle className={`w-3.5 h-3.5 ${priorityColors[task.priority] || priorityColors.medium}`} />
                    <span className="capitalize text-text-muted">{task.priority || 'Medium'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-text-muted">
                    <User className="w-3.5 h-3.5" />
                    {isAssigned ? (
                        task.assignedTo.length > 1 ? (
                            <span className="truncate max-w-[140px] flex items-center gap-1">
                                {`${task.assignedTo.length} members`}
                                {task.status !== 'pending-approval' && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${acceptedCount === task.assignedTo.length ? 'bg-emerald-500/15 text-emerald-600' :
                                        acceptedCount > 0 ? 'bg-amber-500/15 text-amber-600' : 'bg-surface text-text-muted'
                                        }`}>
                                        {acceptedCount}/{task.assignedTo.length}
                                    </span>
                                )}
                            </span>
                        ) : (
                            <span className="truncate max-w-[120px]">{task.assignedTo[0].name}</span>
                        )
                    ) : (
                        <span>Unassigned</span>
                    )}
                </div>
            </div>

            <p className="text-text-muted text-sm mb-4 flex-1 line-clamp-2">
                {task.description}
            </p>

            <LifespanVisualizer createdAt={task.createdAt} status={task.status} />

            {canTakeInitiative && (
                <button
                    onClick={() => onTakeInitiative(task._id)}
                    className="w-full py-2.5 mb-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
                >
                    <Rocket className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    Take Initiative
                </button>
            )}

            {needsAcceptance && (
                <button
                    onClick={() => onAccept && onAccept(task._id)}
                    className="w-full py-2.5 mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
                >
                    <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Accept Task
                </button>
            )}

            {canApprove && (
                <button
                    onClick={() => onApprove && onApprove(task._id)}
                    className="w-full py-2.5 mb-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
                >
                    <ShieldCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Approve Request
                </button>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-main mt-auto">
                <span className="text-xs text-text-muted font-medium">
                    {formatDate(task.updatedAt || task.createdAt)}
                </span>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View button for everyone */}
                    <button
                        onClick={() => onView && onView(task)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary-500 hover:bg-surface-hover transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary-500 hover:bg-surface-hover transition-colors"
                            title="Edit Task"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(task._id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-surface-hover transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
