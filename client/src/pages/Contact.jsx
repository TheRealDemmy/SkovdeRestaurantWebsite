import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import '../styles/Contact.css';

const Contact = () => {
    return (
        <div className="contact-page">
            <div className="contact-title-container">
                <h2 className="contact-title">Contact Us</h2>
            </div>
            <div className="contact-content">
                <div className="contact-container">
                    <div className="contact-info-card">
                        <div className="contact-info-content">
                            <h3 className="contact-section-title">Interested in featuring your restaurant on our website?</h3>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <PhoneIcon className="contact-icon" />
                                    <div className="contact-text">
                                        <h6>Phone</h6>
                                        <p>+46 123 456 789</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <EmailIcon className="contact-icon" />
                                    <div className="contact-text">
                                        <h6>Email</h6>
                                        <p>info@skovderestaurant.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="contact-image-container">
                    <img 
                        src='/src/assets/SkovdeCenter.jpg'
                        alt="Skovde Center" 
                        className="contact-image"
                    />
                </div>
            </div>
            <div className="opening-hours-container">
                <h2 className="opening-hours-title">We're available from 9 AM to 5 PM!</h2>
            </div>
            <hr className="opening-hours-line"/>
        </div>
    );
};

export default Contact; 