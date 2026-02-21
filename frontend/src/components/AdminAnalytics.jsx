import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AdminAnalytics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'admin') {
            setLoading(false);
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const stored = localStorage.getItem('user');
                const token = stored ? JSON.parse(stored).token : null;
                if (!token) return;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_URL}/api/tasks/analytics`, config);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    if (user?.role !== 'admin' || loading || !stats) return null;

    const statCards = [
        { label: 'Total Tasks', value: stats.totalTasks, icon: BarChart3, bg: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
        { label: 'Completed', value: stats.completedTasks, icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
        { label: 'In Progress', value: stats.inProgressTasks, icon: PlayCircle, bg: 'bg-violet-50 border-violet-200', iconColor: 'text-violet-600', valueColor: 'text-violet-700' },
        { label: 'Pending', value: stats.pendingTasks, icon: Clock, bg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
        { label: 'Requests', value: stats.pendingApprovalTasks, icon: AlertCircle, bg: 'bg-rose-50 border-rose-200', iconColor: 'text-rose-600', valueColor: 'text-rose-700' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 mt-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className={`relative overflow-hidden rounded-2xl p-5 border ${stat.bg} shadow-sm transform transition-transform hover:-translate-y-1 hover:shadow-md`}>
                        <div className={`absolute top-0 right-0 -mt-4 -mr-4 opacity-10 pointer-events-none ${stat.iconColor}`}>
                            <Icon className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                                <span className="text-text-muted font-medium text-sm">{stat.label}</span>
                            </div>
                            <div className={`font-bold text-3xl ${stat.valueColor}`}>
                                {stat.value}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminAnalytics;
