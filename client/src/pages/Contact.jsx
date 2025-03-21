import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper } from '@mui/material';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we'll handle the form submission later
        console.log('Form submitted:', formData);
    };

    return (
        <Container maxWidth="lg" className="contact-container">
            <Typography variant="h3" className="contact-title">
                Contact Elin's Longhouse
            </Typography>
            
            <Grid container spacing={4}>
                {/* Contact Information */}
                <Grid item xs={12} md={4}>
                    <Paper className="contact-info">
                        <Typography variant="h5" gutterBottom>
                            Get in Touch
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Have questions about local dining in Skövde? We're here to help you discover the authentic flavors of our city.
                        </Typography>
                        <Box className="info-item">
                            <Typography variant="subtitle1">Email</Typography>
                            <Typography variant="body1">contact@elinslonghouse.com</Typography>
                        </Box>
                        <Box className="info-item">
                            <Typography variant="subtitle1">Location</Typography>
                            <Typography variant="body1">Skövde, Sweden</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Contact Form */}
                <Grid item xs={12} md={8}>
                    <Paper className="contact-form">
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Message"
                                        name="message"
                                        multiline
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        className="submit-button"
                                    >
                                        Send Message
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Contact; 