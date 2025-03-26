import React from 'react';
import '../styles/AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us-page">
            <div className="about-us-container">
                <div className="about-us-content">
                    <div className="about-us-text">
                        <h1>About Us</h1>
                        <p>Welcome to Skövde Restaurant Guide, your premier destination for discovering the best dining experiences in Skövde, Sweden. Our platform is dedicated to helping locals and visitors alike find the perfect restaurant for any occasion.</p>
                        
                        <h2>Our Mission</h2>
                        <p>We strive to connect food enthusiasts with the finest dining establishments in Skövde. Our curated collection of restaurants represents the diverse culinary landscape of our city, from traditional Swedish cuisine to international flavors.</p>
                        
                        <h2>What We Offer</h2>
                        <ul>
                            <li>Comprehensive restaurant listings with detailed information</li>
                            <li>User reviews and ratings to help you make informed decisions</li>
                            <li>Interactive map to easily locate restaurants</li>
                            <li>Featured restaurants highlighting the best of Skövde's dining scene</li>
                        </ul>
                        
                        <h2>Our Commitment</h2>
                        <p>We are committed to providing accurate, up-to-date information about restaurants in Skövde. Our platform is regularly updated with new establishments and user reviews to ensure you have access to the latest information.</p>
                    </div>
                    <div className="about-us-image">
                        <div className="image-placeholder">
                            <p>Image Placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs; 