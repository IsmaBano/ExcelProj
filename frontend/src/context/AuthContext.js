import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockChecked, setBlockChecked] = useState(false); // ✅ important

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsBlocked(userData.isBlocked || false);
    setBlockChecked(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsBlocked(false);
    setBlockChecked(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setBlockChecked(true); // ✅ skip check if no user
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setUser(res.data.user);
          setIsBlocked(res.data.user.isBlocked || false);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Error checking block status:', err);
      } finally {
        setBlockChecked(true);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, isBlocked, blockChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
