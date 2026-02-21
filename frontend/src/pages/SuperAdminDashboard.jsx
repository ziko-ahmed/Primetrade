import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Loader2, Shield, Users, Layers, AlertTriangle, Search, Activity, Megaphone, Trash2, Ban, Lock, PlayCircle, BarChart, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const { user, loginWithToken } = useAuth();
    const [activeTab, setActiveTab] = useState('workspaces');
    const [loading, setLoading] = useState(true);

    // Data states
    const [groups, setGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?.role === 'superadmin') {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchGroups(),
                fetchAllUsers(),
                fetchAnalytics(),
                fetchAnnouncements(),
                fetchAuditLogs()
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await api.get('/api/super-admin/users/search?q=');
            setAllUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGroups = async () => {
        const res = await api.get('/api/groups');
        setGroups(res.data);
    };

    const fetchAnalytics = async () => {
        const res = await api.get('/api/super-admin/analytics');
        setAnalytics(res.data);
    };

    const fetchAnnouncements = async () => {
        const res = await api.get('/api/super-admin/announcements');
        setAnnouncements(res.data);
    };

    const fetchAuditLogs = async () => {
        const res = await api.get('/api/super-admin/audit-logs');
        setAuditLogs(res.data);
    };

    const handleSearchUsers = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const res = await api.get(`/api/super-admin/users/search?q=${searchQuery}`);
            setAllUsers(res.data);
            if (res.data.length === 0) toast.info('No users found.');
        } catch (err) {
            toast.error('Search failed');
        }
    };

    // --- Actions: Workspaces ---
    const handlePlanChange = async (id, currentPlan) => {
        const newPlan = currentPlan === 'free' ? 'pro' : 'free';
        if (!window.confirm(`Change workspace plan to ${newPlan.toUpperCase()}?`)) return;
        try {
            const res = await api.put(`/api/groups/${id}`, { plan: newPlan });
            setGroups(groups.map(g => g._id === id ? { ...g, plan: res.data.plan } : g));
            toast.success(`Plan updated to ${newPlan}`);
        } catch (err) {
            toast.error('Failed to update plan');
        }
    };

    const handleSuspendGroup = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'SUSPEND' : 'RESTORE'} this workspace? ALL users inside will be locked out.`)) return;
        try {
            const res = await api.put(`/api/groups/${id}/suspend`, { isSuspended: newStatus });
            setGroups(groups.map(g => g._id === id ? { ...g, isSuspended: res.data.isSuspended } : g));
            toast.success(newStatus ? 'Workspace Suspended.' : 'Workspace Restored.');
        } catch (err) {
            toast.error('Failed to suspend workspace.');
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("CRITICAL WARNING: This will permanently delete the workspace, all its users, and all its tasks. This cannot be undone. Proceed?")) return;
        try {
            await api.delete(`/api/groups/${id}`);
            setGroups(groups.filter(g => g._id !== id));
            toast.success('Workspace permanently deleted.');
            fetchAnalytics(); // Refresh counts
        } catch (err) {
            toast.error('Failed to delete workspace.');
        }
    };

    // --- Actions: Users ---
    const handleUpdateUser = async (id, field, value) => {
        try {
            const res = await api.put(`/api/super-admin/users/${id}`, { [field]: value });
            setAllUsers(allUsers.map(u => u._id === id ? res.data : u));
            toast.success(`User updated successfully`);
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    const handleImpersonate = async (id) => {
        if (!window.confirm("You are about to securely impersonate this user. Proceed?")) return;
        try {
            const res = await api.post(`/api/super-admin/impersonate/${id}`);
            loginWithToken(res.data);
            toast.success(`Successfully impersonating ${res.data.name}`);
        } catch (err) {
            toast.error('Impersonation failed.');
        }
    };


    // --- Actions: Announcements ---
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        const msg = e.target.message.value;
        const type = e.target.type.value;
        if (!msg) return;

        try {
            const res = await api.post('/api/super-admin/announcements', { message: msg, type });
            e.target.reset();
            toast.success('Announcement broadcasted!');
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to create announcement');
        }
    };

    const handleToggleAnnouncement = async (id) => {
        try {
            await api.put(`/api/super-admin/announcements/${id}`);
            fetchAnnouncements();
            toast.success('Announcement toggled.');
        } catch (err) {
            toast.error('Failed to toggle announcement.');
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Delete this broadcast globally?")) return;
        try {
            await api.delete(`/api/super-admin/announcements/${id}`);
            fetchAnnouncements();
            toast.success('Deleted.');
        } catch (err) {
            toast.error('Failed to delete.');
        }
    };


    // --- Rendering ---
    if (user?.role !== 'superadmin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-text-main">Access Denied</h2>
                <p className="text-text-muted mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'workspaces', label: 'Workspaces', icon: Layers },
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
        { id: 'audit', label: 'Audit Logs', icon: FileText }
    ];

    return (
        <div className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 space-y-6 w-full mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-text-main flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary-500" />
                        Command Center
                    </h1>
                    <p className="text-text-muted mt-2 text-lg">Omniscient platform control and oversight.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-surface rounded-xl border border-border-main mb-6">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${isActive
                                ? 'bg-background shadow-md text-primary-400 border border-border-main/50'
                                : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    )
                })}
            </div>

            {loading ? (
                <div className="flex justify-center flex-col gap-4 items-center py-32">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    <p className="text-text-muted animate-pulse">Establishing secure connection...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* WORKSPACES TAB */}
                    {activeTab === 'workspaces' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div key={group._id} className={`glass-card p-6 flex flex-col h-full border transition-all ${group.isSuspended ? 'border-red-500/50 bg-red-500/5 opacity-80' : 'hover:border-primary-500/30'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 pr-2 flex-1">
                                            <h3 className="text-xl font-bold text-text-main truncate flex items-center gap-2">
                                                {group.isSuspended && <Ban className="w-5 h-5 text-red-500 shrink-0" />}
                                                {group.name}
                                            </h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${group.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-surface-hover text-gray-400'}`}>
                                            {group.plan} Plan
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6 flex-1 flex flex-col">
                                        <div className="text-sm text-text-muted flex justify-between items-center mb-1">
                                            <span>Join Code:</span>
                                            <span className="font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">{group.joinCode || 'N/A'}</span>
                                        </div>
                                        <div className="mt-2 pt-4 border-t border-gray-700/50 flex-1 flex flex-col min-h-0">
                                            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center justify-between">
                                                <span>Users</span>
                                                <span className="bg-surface-hover px-2 py-0.5 rounded text-xs">{group.userCount}</span>
                                            </h4>
                                            <div className="space-y-2 overflow-y-auto pr-1 max-h-40 custom-scrollbar">
                                                {group.users?.map(u => (
                                                    <div key={u._id} className="flex justify-between items-center bg-surface/50 p-2 rounded-lg border border-border-main/50">
                                                        <div className="min-w-0 pr-2">
                                                            <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{u.email}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-primary-400 uppercase">{u.role}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border-main/50">
                                        <button onClick={() => handlePlanChange(group._id, group.plan)} className="w-full py-2 rounded-lg text-xs font-semibold bg-surface border-border-main hover:bg-indigo-500/20 hover:text-indigo-400 text-text-main transition-colors border">
                                            Toggle {group.plan === 'free' ? 'PRO' : 'FREE'} Plan
                                        </button>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSuspendGroup(group._id, group.isSuspended)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors border ${group.isSuspended ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30'}`}>
                                                {group.isSuspended ? 'RESTORE' : 'SUSPEND'}
                                            </button>
                                            <button onClick={() => handleDeleteGroup(group._id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/30" title="Permanently Delete Workspace">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="glass-card p-6">
                            <form onSubmit={handleSearchUsers} className="flex gap-4 mb-8">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search any user by name or email across all workspaces..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border-main rounded-xl text-white outline-none focus:border-primary-500 transition-colors placeholder:text-gray-500"
                                    />
                                </div>
                                <button type="submit" className="btn-primary !w-auto px-8">Search Users</button>
                            </form>

                            {allUsers.length > 0 && (
                                <div className="space-y-4">
                                    {allUsers.map(u => (
                                        <div key={u._id} className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 rounded-xl border transition-all ${u.isSuspended ? 'border-red-500/30 bg-red-500/5' : 'border-border-main bg-background'}`}>
                                            <div>
                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                    {u.name} {u.isSuspended && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">Suspended</span>}
                                                </h4>
                                                <p className="text-sm text-gray-400">{u.email}</p>
                                                <p className="text-xs text-primary-400 mt-1">Workspace: {u.group ? u.group.name : 'None'} {u.group?.isSuspended && '(Workspace Suspended)'}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateUser(u._id, 'role', e.target.value)}
                                                    className="bg-surface border border-border-main text-xs rounded-lg px-3 py-2 text-text-main outline-none focus:border-primary-500"
                                                >
                                                    <option value="user">USER</option>
                                                    <option value="admin">ADMIN</option>
                                                </select>

                                                <button
                                                    onClick={() => handleUpdateUser(u._id, 'isSuspended', !u.isSuspended)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${u.isSuspended ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30'}`}
                                                >
                                                    {u.isSuspended ? 'RESTORE' : 'SUSPEND'}
                                                </button>

                                                <button onClick={() => handleImpersonate(u._id)} className="px-4 py-2 text-xs font-bold rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-2">
                                                    <PlayCircle className="w-4 h-4" /> IMPERSONATE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 flex flex-col justify-center gap-4 bg-gradient-to-br from-surface to-background border-primary-500/20">
                                <div className="text-gray-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-400" /> Platform Users
                                </div>
                                <div className="text-6xl font-black text-white">{analytics.users.total}</div>
                                <div className="flex gap-4 mt-2">
                                    <div className="text-sm bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">{analytics.users.active} Active</div>
                                    <div className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded-full">{analytics.users.suspended} Suspended</div>
                                </div>
                            </div>

                            <div className="glass-card p-8 flex flex-col justify-center gap-4 bg-gradient-to-br from-surface to-background border-indigo-500/20">
                                <div className="text-gray-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-400" /> Total Workspaces
                                </div>
                                <div className="text-6xl font-black text-white">{analytics.workspaces.total}</div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="text-sm bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full">{analytics.workspaces.active} Active</div>
                                    <div className="text-sm bg-red-500/10 text-red-400 px-2 py-1 rounded-full">{analytics.workspaces.suspended} Suspended</div>
                                    <div className="text-sm bg-gray-500/10 text-gray-400 px-2 py-1 rounded-full">{analytics.workspaces.free} Free Plan</div>
                                    <div className="text-sm bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">{analytics.workspaces.pro} Pro Plan</div>
                                </div>
                            </div>

                            <div className="glass-card p-8 flex flex-col justify-center gap-4 bg-gradient-to-br from-surface to-background border-amber-500/20 md:col-span-2">
                                <div className="text-gray-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-amber-400" /> Global Tasks Created
                                </div>
                                <div className="text-6xl font-black text-white">{analytics.tasks.total}</div>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span className="text-sm text-gray-300">{analytics.tasks.todo} To Do</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm text-gray-300">{analytics.tasks.inProgress} In Progress</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm text-gray-300">{analytics.tasks.done} Done</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ANNOUNCEMENTS TAB */}
                    {activeTab === 'announcements' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 glass-card p-6 h-fit">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-primary-400" /> Broadcast Message
                                </h3>
                                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows="4"
                                            className="w-full bg-surface border border-border-main rounded-xl p-3 text-text-main outline-none focus:border-primary-500 resize-none"
                                            placeholder="Enter system broadcast message here..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Severity</label>
                                        <select name="type" className="w-full bg-surface border border-border-main rounded-xl p-3 text-text-main outline-none focus:border-primary-500">
                                            <option value="info">Info (Blue)</option>
                                            <option value="warning">Warning (Yellow)</option>
                                            <option value="alert">Alert (Red)</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary w-full">Publish Global Banner</button>
                                </form>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-lg font-bold text-white px-2">Active & Previous Broadcasts</h3>
                                {announcements.map(a => (
                                    <div key={a._id} className={`glass-card p-5 border-l-4 ${a.type === 'alert' ? 'border-l-red-500' : a.type === 'warning' ? 'border-l-amber-500' : 'border-l-primary-500'}`}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white text-sm mb-2">{a.message}</p>
                                                <p className="text-xs text-gray-500">Published by: {a.createdBy?.name || 'System'} • {new Date(a.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleAnnouncement(a._id)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${a.isActive ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'}`}
                                                >
                                                    {a.isActive ? 'DEACTIVATE' : 'REACTIVATE'}
                                                </button>
                                                <button onClick={() => handleDeleteAnnouncement(a._id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {announcements.length === 0 && <p className="text-gray-500 italic p-4">No announcements made yet.</p>}
                            </div>
                        </div>
                    )}

                    {/* AUDIT LOGS TAB */}
                    {activeTab === 'audit' && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 border-b border-border-main flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary-400" /> Security Feed
                                </h3>
                                <span className="text-xs text-gray-500 font-mono">Last 100 System Events</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface/50 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="p-4 font-medium border-b border-border-main">Timestamp</th>
                                            <th className="p-4 font-medium border-b border-border-main">Action</th>
                                            <th className="p-4 font-medium border-b border-border-main">Performed By</th>
                                            <th className="p-4 font-medium border-b border-border-main">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-border-main/50">
                                        {auditLogs.map(log => (
                                            <tr key={log._id} className="hover:bg-surface/30 transition-colors">
                                                <td className="p-4 text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                                <td className="p-4 text-white font-mono text-xs"><span className="bg-surface px-2 py-1 rounded border border-border-main">{log.action}</span></td>
                                                <td className="p-4 text-primary-400">{log.performedBy?.email || 'Unknown User'}</td>
                                                <td className="p-4 text-xs text-gray-400">
                                                    {log.details ? (
                                                        <div className="flex flex-col gap-1 max-w-[300px] max-h-24 overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.entries(log.details).map(([key, value]) => (
                                                                <div key={key} className="flex flex-wrap gap-1 items-start bg-surface-hover/50 p-1.5 rounded">
                                                                    <span className="font-semibold text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                                    <span className="text-gray-400 break-all">
                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 italic">No additional details recorded.</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {auditLogs.length === 0 && (
                                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No events recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
