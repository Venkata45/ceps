import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token if needed, for now just decoding or trusting simple storage for MVP
                    // In a real app, call /api/auth/me
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if (storedUser) setUser(storedUser);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password, role = 'student') => {
        try {
            setAuthLoading(true);
            const res = await api.post('/auth/login', { email, password, role });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);

            // Show loading screen for 2 seconds for better UX
            setTimeout(() => {
                setAuthLoading(false);
            }, 2000);

            return { success: true };
        } catch (error) {
            setAuthLoading(false);
            if (error.response?.status === 403) {
                return { success: false, message: error.response?.data?.msg || 'Account is locked' };
            }
            // Extract the actual error message from the server
            const errorMessage = error.response?.data?.msg || 'Invalid credentials';
            return { success: false, message: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            setAuthLoading(true);
            const res = await api.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);

            // Show loading screen for 2 seconds for better UX
            setTimeout(() => {
                setAuthLoading(false);
            }, 2000);

            return { success: true };
        } catch (error) {
            setAuthLoading(false);
            // Extract error message without logging to console
            const errorMessage = error.response?.data?.msg || 'Registration failed';
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, authLoading }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : authLoading ? (
                <LoadingScreen />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
