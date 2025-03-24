import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import '../styles/Header.css';

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
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
                    <Link to="/login" className="dropdown-link">Login</Link>
                    <Link to="/register" className="dropdown-link">Register</Link>
                </div>
            </div>
        </header>
    );
};

export default Header; 