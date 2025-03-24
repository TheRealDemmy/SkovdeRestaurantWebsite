import React from 'react';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="social-icons">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <XIcon />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <InstagramIcon />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <FacebookIcon />
                    </a>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Elin's Longhouse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 