import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import '../styles/Header.css';

const Header = () => {
    return (
        <AppBar className="header">
            <Toolbar>
                <div className="logo-container">
                    <img 
                        src="/assets/SkovdeSymbol.png" 
                        alt="Skövde Symbol" 
                        className="logo-image"
                    />
                    <Typography variant="h6" component={Link} to="/" className="logo">
                        Elin's Longhouse
                    </Typography>
                </div>
                <div className="nav-buttons">
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/contact">Contact</Button>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/register">Register</Button>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 