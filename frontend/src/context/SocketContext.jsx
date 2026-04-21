import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth(); // If user is logged in

    useEffect(() => {
        // Connect to backend URL (ensure it matches the API base conceptually)
        const newSocket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (user) {
                newSocket.emit('user_online', user.id);
                newSocket.emit('register', user.id);
            }
        });

        return () => newSocket.close();
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
