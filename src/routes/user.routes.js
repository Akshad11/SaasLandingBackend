const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin)
router.get('/', protect, checkRole(ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create User (Invite)
// @route   POST /api/users
// @access  Private (Super Admin)
router.post('/', protect, checkRole(ROLES.SUPER_ADMIN), async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check exist
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create (Password hashing handles in pre-save)
    try {
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
router.delete('/:id', protect, checkRole(ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update User
// @route   PUT /api/users/:id
// @access  Private (Super Admin)
router.put('/:id', protect, checkRole(ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
