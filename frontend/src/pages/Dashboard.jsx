import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskViewModal from '../components/TaskViewModal';
import AdminAnalytics from '../components/AdminAnalytics';
import ActivityFeed from '../components/ActivityFeed';
import KanbanBoard from '../components/KanbanBoard'; // Added import
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Layers, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [usersList, setUsersList] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // View modal state
    const [viewingTask, setViewingTask] = useState(null);

    // Request modal state (for users)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({ title: '', description: '', priority: 'medium' });

    useEffect(() => {
        if (user) {
            fetchTasks();
            if (user.role === 'admin') {
                fetchUsers();
            }
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/auth/users');
            setUsersList(res.data);
        } catch (err) {
            toast.error('Failed to load users');
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get('/api/tasks');
            setTasks(res.data);
        } catch (err) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskSubmit = async (taskData, id) => {
        try {
            if (id) {
                // Edit
                const res = await api.put(`/api/tasks/${id}`, taskData);
                setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
                toast.success('Task updated successfully');
            } else {
                // Create
                const res = await api.post('/api/tasks', taskData);
                setTasks([...tasks, res.data]);
                toast.success('Task created successfully');
            }
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/api/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
            toast.success('Task deleted test');
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const handleTakeInitiative = async (id) => {
        try {
            const res = await api.put(`/api/tasks/${id}`, { assignedTo: [user._id] });
            setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
            toast.success('You have taken initiative on this task!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to take initiative');
        }
    };

    const handleAcceptTask = async (id) => {
        try {
            const res = await api.put(`/api/tasks/${id}/accept`);
            setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
            toast.success('Task accepted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept task');
        }
    };

    const handleApproveRequest = async (id) => {
        try {
            const res = await api.put(`/api/tasks/${id}/approve`);
            setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
            toast.success('Task request approved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve request');
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleRequestTask = async (e) => {
        e.preventDefault();
        if (!requestForm.title.trim() || !requestForm.description.trim()) {
            toast.error('Please fill in both title and description');
            return;
        }
        try {
            const res = await api.post('/api/tasks', requestForm);
            setTasks((prev) => [...prev, res.data]);
            toast.success('Task request submitted for admin approval!');
            setRequestForm({ title: '', description: '', priority: 'medium' });
            setIsRequestModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    };

    // Filter logic
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Match priority
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

        // Match user (Admin only)
        let matchesUser = true;
        if (user?.role === 'admin' && userFilter !== 'all') {
            if (userFilter === 'unassigned') {
                matchesUser = !task.assignedTo || task.assignedTo.length === 0;
            } else {
                matchesUser = task.assignedTo?.some(u => (u._id || u) === userFilter);
            }
        }

        return matchesSearch && matchesPriority && matchesUser;
    });

    return (
        <div className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 space-y-6 w-full mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-main mb-2">
                        Dashboard
                    </h1>
                    <p className="text-text-muted">Welcome back, <span className="text-primary-500 font-medium">{user?.name}</span>. Here's your task overview.</p>
                </div>
                {user?.role === 'admin' ? (
                    <button onClick={openCreateModal} className="btn-primary w-auto md:px-6 shadow-primary-500/25">
                        <Plus className="w-5 h-5 mr-2" />
                        New Task
                    </button>
                ) : (
                    <button onClick={() => setIsRequestModalOpen(true)} className="btn-primary w-auto md:px-6 shadow-primary-500/25">
                        <Send className="w-5 h-5 mr-2" />
                        Request Task
                    </button>
                )}
            </div>

            {/* Admin Analytics Overview */}
            <AdminAnalytics />

            {/* Filters Section */}
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 bg-background/50 border-gray-300 dark:border-gray-700/50"
                    />
                </div>
                {user?.role === 'admin' && (
                    <div className="sm:w-48">
                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="input-field bg-background/50 border-gray-300 dark:border-gray-700/50 appearance-none"
                        >
                            <option value="all">All Users</option>
                            <option value="unassigned">Unassigned</option>
                            {usersList.map((u) => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="sm:w-48">
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="input-field bg-background/50 border-gray-300 dark:border-gray-700/50 appearance-none"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 w-full min-w-0">
                    {/* Tasks Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <KanbanBoard
                            tasks={filteredTasks}
                            setTasks={setTasks}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onTakeInitiative={handleTakeInitiative}
                            onAccept={handleAcceptTask}
                            onView={(task) => setViewingTask(task)}
                            onApprove={handleApproveRequest}
                            currentUser={user}
                        />
                    ) : (
                        <div className="text-center py-20 px-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface mb-4">
                                <Layers className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No tasks found</h3>
                            <p className="text-gray-500 mb-6">Create a new task to get started or adjust your filters.</p>
                            {user?.role === 'admin' && (
                                <button onClick={openCreateModal} className="btn-secondary mx-auto">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Task
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Real-time Activity Feed Sidebar */}
                <ActivityFeed />
            </div>

            {/* Modals */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTaskSubmit}
                editingTask={editingTask}
                usersList={usersList}
            />
            <TaskViewModal
                isOpen={!!viewingTask}
                onClose={() => setViewingTask(null)}
                task={viewingTask}
            />

            {/* Request Task Modal (Users) */}
            <AnimatePresence>
                {isRequestModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card relative w-full max-w-md shadow-2xl z-10"
                        >
                            <div className="p-6 border-b border-border-main">
                                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                                    <Send className="w-5 h-5 text-primary-500" />
                                    Request a Task
                                </h2>
                                <p className="text-text-muted text-sm mt-1">Submit a task request for admin approval.</p>
                            </div>
                            <form onSubmit={handleRequestTask} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={requestForm.title}
                                        onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                                        className="input-field"
                                        placeholder="E.g., Update user profile page"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={requestForm.description}
                                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                                        rows={4}
                                        className="input-field resize-none"
                                        placeholder="Describe what you'd like to work on..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5 ml-1">Priority</label>
                                    <select
                                        value={requestForm.priority}
                                        onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                                        className="input-field appearance-none cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setIsRequestModalOpen(false)} className="btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary flex-1">
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
