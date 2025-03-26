import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SignUp.css';

const SignUp = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        identifier: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateUsername = (username) => {
        return username.length >= 3;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                if (!formData.identifier || !formData.password) {
                    throw new Error('Please fill in all fields');
                }
            } else {
                if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
                    throw new Error('Please fill in all fields');
                }

                if (!validateEmail(formData.email)) {
                    throw new Error('Please enter a valid email address');
                }

                if (!validateUsername(formData.username)) {
                    throw new Error('Username must be at least 3 characters long');
                }

                if (!validatePassword(formData.password)) {
                    throw new Error('Password must be at least 6 characters long');
                }

                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
            }

            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const requestData = isLogin 
                ? { 
                    identifier: formData.identifier, 
                    password: formData.password 
                }
                : { 
                    username: formData.username, 
                    email: formData.email, 
                    password: formData.password 
                };

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            if (!data.token || !data.user) {
                throw new Error('Invalid server response');
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            
            // Login user
            await login(data.user);

            // Clear form
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                identifier: ''
            });

            // Redirect to home page
            navigate('/');
        } catch (err) {
            console.error('Authentication error:', err);
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="auth-container">
                <div className="auth-tabs">
                    <button 
                        type="button"
                        className={`tab-button ${isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(true);
                            setError('');
                        }}
                        disabled={isLoading}
                    >
                        Login
                    </button>
                    <button 
                        type="button"
                        className={`tab-button ${!isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(false);
                            setError('');
                        }}
                        disabled={isLoading}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {isLogin ? (
                        <div className="form-group">
                            <label htmlFor="identifier">Email or Username</label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                placeholder="Enter your email or username"
                                autoComplete="username"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    placeholder="Choose a username"
                                    autoComplete="username"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter your password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>
                    )}
                    {error && (
                        <div className="error-message shake">
                            {error}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp; 