import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import api from '../utils/axios';

const AnnouncementBanner = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        // Load dismissed IDs from local storage so banners don't keep popping up
        try {
            return JSON.parse(localStorage.getItem('dismissedAnnouncements')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        // Only fetch if logged in
        if (!user) return;

        const fetchAnnouncements = async () => {
            try {
                // Returns active announcements only (unless super admin, but endpoint filters based on token)
                const res = await api.get('/api/super-admin/announcements');
                // Filter out ones the user locally dismissed
                setAnnouncements(res.data.filter(a => a.isActive && !dismissedIds.includes(a._id)));
            } catch (err) {
                console.error('Failed to fetch announcements:', err);
            }
        };

        fetchAnnouncements();
    }, [user, dismissedIds]);

    const handleDismiss = (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
        setAnnouncements(prev => prev.filter(a => a._id !== id));
    };

    if (announcements.length === 0) return null;

    return (
        <div className="flex flex-col w-full z-50">
            {announcements.map(announcement => {
                let bgClass = "bg-primary-500";
                let icon = <Info className="w-5 h-5 opacity-80" />;

                if (announcement.type === 'warning') {
                    bgClass = "bg-amber-500";
                    icon = <AlertTriangle className="w-5 h-5 opacity-80" />;
                } else if (announcement.type === 'alert') {
                    bgClass = "bg-red-500";
                    icon = <AlertCircle className="w-5 h-5 opacity-80" />;
                }

                return (
                    <div key={announcement._id} className={`${bgClass} text-white px-4 py-3 flex items-start sm:items-center justify-between shadow-md relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start sm:items-center gap-3 relative z-10 w-full pr-8">
                            <span className="flex-shrink-0 mt-0.5 sm:mt-0">{icon}</span>
                            <p className="text-sm font-medium leading-snug">{announcement.message}</p>
                        </div>
                        <button
                            onClick={() => handleDismiss(announcement._id)}
                            className="absolute right-2 top-2 sm:top-auto p-1.5 hover:bg-black/20 rounded-lg transition-colors z-20"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default AnnouncementBanner;
