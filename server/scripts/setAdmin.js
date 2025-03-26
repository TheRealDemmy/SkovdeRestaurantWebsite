const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const setAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const result = await User.findOneAndUpdate(
            { username: 'TheRealDemmy' },
            { isAdmin: true },
            { new: true }
        );

        if (result) {
            console.log('Successfully set TheRealDemmy as admin');
        } else {
            console.log('User TheRealDemmy not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setAdmin(); 