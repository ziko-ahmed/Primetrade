import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            console.log('Connected to real-time socket server');
        });

        newSocket.on('notification', (message) => {
            toast(message, { icon: '🔔' });
        });

        newSocket.on('activity_logged', (activity) => {
            // General background logging, can trigger soft toast if needed
            // toast(`${activity.user.name} ${activity.action} ${activity.task ? 'a task' : ''}`);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
