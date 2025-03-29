const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const Review = require('../models/Review');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users (admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single user
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new user (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;

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

        const user = new User({
            username,
            email,
            password,
            isAdmin: isAdmin || false
        });

        await user.save();

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user profile
router.put('/:userId', verifyToken, upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const isAdminRequest = await User.findById(req.userId).select('isAdmin');
        
        // Only allow updates if user is updating their own profile or is an admin
        if (userId !== req.userId && !isAdminRequest.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this profile.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updates = { ...req.body };
        
        // Handle profile picture upload
        if (req.file) {
            console.log('Profile picture uploaded:', req.file);
            // Delete old profile picture if it exists
            if (user.profilePicture) {
                const oldFilePath = path.join(__dirname, '..', user.profilePicture);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updates.profilePicture = `/uploads/users/${req.file.filename}`;
        }

        // If email is being changed, send confirmation email
        if (updates.email && updates.email !== user.email) {
            const confirmationToken = jwt.sign(
                { userId, newEmail: updates.email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: updates.email,
                subject: 'Confirm Email Change',
                html: `
                    <h1>Confirm Email Change</h1>
                    <p>You have requested to change your email address. Click the link below to confirm:</p>
                    <a href="${process.env.CLIENT_URL}/confirm-email/${confirmationToken}">
                        Confirm Email Change
                    </a>
                `
            };

            await transporter.sendMail(mailOptions);
            return res.json({ 
                message: 'Confirmation email sent. Please check your new email to confirm the change.' 
            });
        }

        // If password is being changed, verify current password
        if (updates.newPassword) {
            const isMatch = await user.comparePassword(updates.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }
            updates.password = updates.newPassword;
            delete updates.currentPassword;
            delete updates.newPassword;
            delete updates.confirmPassword;
        }

        // Update user
        Object.assign(user, updates);
        await user.save();

        // Return updated user data without sensitive information
        res.json({
            message: 'Profile updated successfully.',
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

// Delete user
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete profile picture if it exists
        if (user.profilePicture && user.profilePicture !== '/assets/default-profile.jpg') {
            const picturePath = path.join(__dirname, '..', 'uploads', 'users', path.basename(user.profilePicture));
            if (fs.existsSync(picturePath)) {
                fs.unlinkSync(picturePath);
            }
        }

        // Delete all reviews by this user
        await Review.deleteMany({ user: user._id });

        // Delete the user
        await User.deleteOne({ _id: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Promote user to admin (admin only)
router.put('/:id/promote', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isAdmin = true;
        await user.save();
        res.json({
            message: 'User promoted to admin successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Confirm email change
router.get('/confirm-email/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.email = decoded.newEmail;
        await user.save();

        res.json({ message: 'Email updated successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
});

// Update user profile picture
router.put('/:id/profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if it exists
        if (user.profilePicture && user.profilePicture !== '/assets/default-profile.jpg') {
            const oldPicturePath = path.join(__dirname, '..', 'uploads', 'users', path.basename(user.profilePicture));
            if (fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath);
            }
        }

        // Update with new profile picture
        if (req.file) {
            user.profilePicture = `/uploads/users/${req.file.filename}`;
            await user.save();
            res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 