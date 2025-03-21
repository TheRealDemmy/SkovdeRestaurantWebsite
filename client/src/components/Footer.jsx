import React from 'react';
import Typography from '@mui/material/Typography';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <Typography variant="body2" className="footer-text">
                © {new Date().getFullYear()} Elin's Longhouse. All rights reserved.
            </Typography>
        </footer>
    );
};

export default Footer; 