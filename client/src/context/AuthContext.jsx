import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        } else {
            // Clear any invalid state
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        if (!userData) {
            console.error('No user data provided to login function');
            return;
        }
        // Ensure isAdmin is properly set
        const userWithAdmin = {
            ...userData,
            isAdmin: userData.isAdmin || false
        };
        setUser(userWithAdmin);
        localStorage.setItem('user', JSON.stringify(userWithAdmin));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        window.location.href = '/signup';
    };

    const isAuthenticated = Boolean(user && localStorage.getItem('token'));
    const isAdmin = Boolean(user?.isAdmin);

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 