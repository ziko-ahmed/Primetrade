import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, UserX, UserCheck, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty pass

                const res = await api.put(`/api/users/${editingUser._id}`, payload);
                setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
                toast.success('User updated successfully');
            } else {
                if (!formData.password) {
                    toast.error("Password is required for new users.");
                    setIsSubmitting(false);
                    return;
                }
                const res = await api.post('/api/users', formData);
                setUsers([...users, res.data]);
                toast.success('User created successfully');
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuspend = async (id) => {
        if (window.confirm("Are you sure you want to toggle this user's active status?")) {
            try {
                const res = await api.put(`/api/users/${id}/suspend`);
                setUsers(users.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
                toast.success(`User ${res.data.isActive ? 'unsuspended' : 'suspended'}`);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update user status');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this user?")) {
            try {
                await api.delete(`/api/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
                toast.success('User deleted successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 space-y-6 w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
                        User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage all registered users, roles, and access.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary w-auto md:px-6 shadow-primary-500/25">
                    <Plus className="w-5 h-5 mr-2" />
                    Add User
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700/50 bg-surface/30">
                                <th className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200">Name</th>
                                <th className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200">Email</th>
                                <th className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200">Role</th>
                                <th className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200">Status</th>
                                <th className="py-4 px-6 font-semibold text-gray-800 dark:text-gray-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u._id} className="border-b border-gray-700/20 hover:bg-surface/20 transition-colors">
                                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">{u.name}</td>
                                    <td className="py-4 px-6 text-gray-500">{u.email}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center w-fit gap-1.5 ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                                            {u.role === 'admin' && <Shield className="w-3 h-3" />}
                                            <span className="capitalize">{u.role}</span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-surface-hover transition-colors" title="Edit User">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleSuspend(u._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-surface-hover transition-colors" title={u.isActive ? "Suspend User" : "Unsuspend User"}>
                                                {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-surface-hover transition-colors" title="Delete User">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inline Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-md shadow-2xl z-10 p-6">
                            <button onClick={handleCloseModal} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-surface rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{editingUser ? 'Edit User' : 'Create User'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">{editingUser ? 'Password (leave blank to keep)' : 'Password'}</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Role</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-field appearance-none cursor-pointer">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
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

export default AdminUsers;
