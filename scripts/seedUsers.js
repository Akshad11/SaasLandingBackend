require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const users = [
    {
        name: 'Super Admin',
        email: 'superadmin@aarvion.com',
        password: 'SuperAdmin@123',
        role: 'super-admin'
    },
    {
        name: 'Admin User',
        email: 'admin@aarvion.com',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        name: 'HR Manager',
        email: 'hr@aarvion.com',
        password: 'HR@123',
        role: 'hr'
    }
];

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected for seeding...');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});
        // console.log('Existing users cleared');

        // Check if users already exist and create only if they don't
        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`User with email ${userData.email} already exists. Skipping...`);
            } else {
                const user = await User.create(userData);
                console.log(`✓ Created ${user.role}: ${user.name} (${user.email})`);
            }
        }

        console.log('\n✅ Seeding completed successfully!');
        console.log('\nDefault credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        users.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
        });
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
