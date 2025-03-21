import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    return (
        <Box className="home-container">
            <Typography
                component="h1"
                variant="h2"
                className="welcome-title"
            >
                Welcome to Elin's Longhouse
            </Typography>
            <Typography variant="h5" className="welcome-text">
                Discover the authentic flavors of Skövde. A place where tradition meets modern dining, and every meal tells a story.
            </Typography>
            <Box className="button-container">
                <Button
                    component={Link}
                    to="/restaurants"
                    variant="contained"
                    size="large"
                >
                    Explore Local Cuisine
                </Button>
                <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    size="large"
                >
                    Join Our Community
                </Button>
            </Box>
        </Box>
    );
};

export default Home; 