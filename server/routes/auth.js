const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Sign up route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? 
                    'Email is already registered' : 
                    'Username is already taken' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                reviews: user.reviews,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by either email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid email/username or password' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid email/username or password' 
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                reviews: user.reviews,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 