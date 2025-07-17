    import { useEffect } from 'react';
    import axios from 'axios';
    import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../api/api';

    export default function useBlockChecker() {
    const { user, setIsBlocked } = useAuth();

    useEffect(() => {
        if (!user) {
        setIsBlocked(false);
        return;
        }

        const fetchBlockStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
            setIsBlocked(res.data.user.isBlocked || false);
            }
        } catch (error) {
            console.error('Error checking block status:', error);
        }
        };

        fetchBlockStatus();

        const interval = setInterval(fetchBlockStatus, 10000);
        return () => clearInterval(interval);
    }, [user, setIsBlocked]);

    return user?.isBlocked || false;
    }
