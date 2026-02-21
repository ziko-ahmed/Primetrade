import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, onSubmit, editingTask, usersList = [] }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingTask) {
            let initialAssigned = [];
            if (Array.isArray(editingTask.assignedTo)) {
                initialAssigned = editingTask.assignedTo.map(u => u._id || u);
            } else if (editingTask.assignedTo) {
                initialAssigned = [editingTask.assignedTo._id || editingTask.assignedTo];
            }
            setFormData({
                title: editingTask.title,
                description: editingTask.description,
                status: editingTask.status,
                priority: editingTask.priority || 'medium',
                assignedTo: initialAssigned
            });
        } else {
            setFormData({ title: '', description: '', status: 'pending', priority: 'medium', assignedTo: [] });
        }
    }, [editingTask, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            toast.error('Please fill out all text fields.');
            return;
        }
        setIsSubmitting(true);
        await onSubmit(formData, editingTask?._id);
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-card relative w-full max-w-lg shadow-2xl z-10 p-0 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-surface/50">
                            <h2 className="text-xl font-semibold">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-surface transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    placeholder="E.g., Design homepage UI"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Task details and requirements..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field appearance-none cursor-pointer"
                                >
                                    <option value="pending" disabled={editingTask && (editingTask.status === 'in-progress' || editingTask.status === 'completed')}>
                                        Pending {editingTask && (editingTask.status === 'in-progress' || editingTask.status === 'completed') ? '(Disabled)' : ''}
                                    </option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {user?.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="input-field appearance-none cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            )}

                            {user?.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Assign To (Multiple)</label>
                                    <div className="input-field max-h-32 overflow-y-auto flex flex-col gap-1 p-2">
                                        {usersList?.map(u => {
                                            const isSelected = formData.assignedTo.includes(u._id);
                                            return (
                                                <label key={u._id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white/5 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({ ...formData, assignedTo: [...formData.assignedTo, u._id] });
                                                            } else {
                                                                setFormData({ ...formData, assignedTo: formData.assignedTo.filter(id => id !== u._id) });
                                                            }
                                                        }}
                                                        className="rounded border-gray-600 bg-surface/50 text-primary-500 w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{u.name} <span className="text-gray-500 text-xs">({u.email})</span></span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary flex-1"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        editingTask ? 'Save Changes' : 'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TaskModal;
