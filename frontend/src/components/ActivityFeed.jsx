import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { History } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ActivityFeed = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                if (!user || !user.token) return;
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_URL}/api/activities`, config);
                setActivities(res.data);
            } catch (err) {
                console.error("Failed to fetch activity feed", err);
            }
        };

        if (user) {
            fetchActivities();
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.on('activity_logged', (newActivity) => {
                setActivities((prev) => [newActivity, ...prev].slice(0, 50));
            });
        }
        return () => {
            if (socket) socket.off('activity_logged');
        };
    }, [socket]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <div className="glass-card h-[600px] flex flex-col w-full lg:w-72 xl:w-80 shrink-0 sticky top-6">
            <div className="p-4 border-b border-border-main flex items-center gap-2 bg-surface/50 rounded-t-2xl">
                <History className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-main">Live Activity</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center text-text-muted py-10 text-sm">No activity yet</div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity._id} className="relative pl-6 pb-4 border-l-2 border-border-main last:border-l-0 last:pb-0">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                            <div className="flex flex-col gap-1 w-full">
                                <div className="text-sm font-medium text-text-main flex items-center flex-wrap">
                                    <span className="text-primary-500 mr-1 truncate max-w-[140px] inline-block align-bottom" title={activity.user?.name}>{activity.user?.name}</span>
                                    <span>{activity.action}</span>
                                </div>
                                {activity.details && (
                                    <div className="text-xs text-text-muted leading-snug break-words">
                                        {activity.details}
                                    </div>
                                )}
                                <span className="text-[10px] text-text-muted font-medium">
                                    {formatTime(activity.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
