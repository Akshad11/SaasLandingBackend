require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const verifyUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB\n');

        const users = await User.find({}).select('-password');

        console.log(`Total users in database: ${users.length}\n`);

        users.forEach(user => {
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Created: ${user.createdAt}`);
            console.log('─'.repeat(50));
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyUsers();
