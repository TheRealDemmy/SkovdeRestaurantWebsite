import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <h1>Skövde Restaurant</h1>
                    </Link>
                </div>

                <button className="mobile-menu-button" onClick={toggleMenu}>
                    <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
                </button>

                <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <ul>
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                        <li><Link to="/menu" onClick={() => setIsMenuOpen(false)}>Menu</Link></li>
                        <li><Link to="/reservations" onClick={() => setIsMenuOpen(false)}>Reservations</Link></li>
                        <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                        <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
