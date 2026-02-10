const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Contact = require('../models/Contact');
const Log = require('../models/Log');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin/Super Admin)
router.get('/stats', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeJobs = await Job.countDocuments(); // Assuming all jobs in DB are "active" for now
        const newInquiries = await Contact.countDocuments(); // Total inquiries

        // Calculate recent activity (e.g. last 24h) for "New Inquiries" trend if needed, 
        // but for now let's just return totals.

        res.json({
            users: totalUsers,
            jobs: activeJobs,
            inquiries: newInquiries
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get Recent Activity (Logs)
// @route   GET /api/admin/activity
// @access  Private (Admin/Super Admin)
router.get('/activity', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .limit(10);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get All Logs with Filtering/Pagination
// @route   GET /api/admin/logs
// @access  Private (Admin/Super Admin)
router.get('/logs', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { message: { $regex: search, $options: 'i' } },
                { user: { $regex: search, $options: 'i' } },
                { ip: { $regex: search, $options: 'i' } }
            ];
        }

        const logs = await Log.find(query).sort({ timestamp: -1 }).limit(100); // Limit 100 for now
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get Admin Dashboard Chart Data (Traffic)
// @route   GET /api/admin/chart-data
// @access  Private (Admin/Super Admin)
router.get('/chart-data', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const dates = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        const analyticsService = require('../services/AnalyticsService'); // Lazy load to avoid circular dependency if any

        const chartData = await Promise.all(dates.map(async (date) => {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Get estimates for visits (page_view) and clicks (if tracked, else 0 or another metric)
            // Assuming 'page_view' metric exists.
            const visits = await analyticsService.getEstimate('page_view', 'global', startOfDay, endOfDay);
            // Assuming 'click' or similar exists, otherwise we can simulate or just return 0
            const clicks = await analyticsService.getEstimate('click', 'global', startOfDay, endOfDay);

            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                visits: visits || 0,
                clicks: clicks || 0
            };
        }));

        res.json(chartData);
    } catch (error) {
        console.error('Chart Data Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
