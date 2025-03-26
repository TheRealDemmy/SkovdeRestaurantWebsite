import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { isAuthenticated, isAdmin, logout } = useAuth();

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleLogout = () => {
        logout();
        setShowMenu(false);
    };

    return (
        <header className={`header ${showMenu ? 'dropdown-active' : ''}`}>
            <div className="header-content">
                <button className="menu-button" onClick={toggleMenu}>
                    <MenuIcon />
                    <span>Menu</span>
                </button>
                <div className="logo-container">
                    <img 
                        src="/assets/SkovdeSymbol.png" 
                        alt="Skövde Symbol" 
                        className="logo-image"
                    />
                    <Link to="/" className="logo">
                        Elin's Longhouse
                    </Link>
                </div>
                <div className={`dropdown-menu ${showMenu ? 'show' : ''}`}>
                    <Link to="/" className="dropdown-link">Home</Link>
                    <Link to="/contact" className="dropdown-link">Contact</Link>
                    {!isAuthenticated ? (
                        <Link to="/signup" className="dropdown-link">Sign Up</Link>
                    ) : (
                        <>
                            <Link to="/profile" className="dropdown-link">My Profile</Link>
                            {isAdmin && (
                                <Link to="/admin" className="dropdown-link">Admin</Link>
                            )}
                            <button onClick={handleLogout} className="dropdown-link logout-button">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 