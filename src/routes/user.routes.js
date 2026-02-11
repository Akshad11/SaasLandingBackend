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

// @desc    Get current user's theme preference
// @route   GET /api/users/me/theme
// @access  Private (All authenticated users)
router.get('/me/theme', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('theme');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            theme: user.theme || 'light'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Update current user's theme preference
// @route   PUT /api/users/me/theme
// @access  Private (All authenticated users)
router.put('/me/theme', protect, async (req, res) => {
    try {
        const { theme } = req.body;

        // Validate theme value
        if (!theme || !['light', 'dark'].includes(theme)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid theme. Must be "light" or "dark"'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.theme = theme;
        await user.save();

        res.json({
            success: true,
            message: 'Theme updated successfully',
            theme: user.theme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @desc    Get current user profile (including theme)
// @route   GET /api/users/me
// @access  Private (All authenticated users)
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                theme: user.theme || 'light',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
