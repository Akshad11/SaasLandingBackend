
const express = require('express');
const router = express.Router();
const sendEmail = require('../services/emailService');

const Contact = require('../models/Contact');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    try {
        // Save to Database
        await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        const emailContent = `
            <h3>New Contact Request</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Send to admin (you can customize the recipient)
        try {
            await sendEmail(process.env.EMAIL_USER, `New Contact from ${name}`, message, emailContent);
        } catch (emailError) {
            console.error('Email sending failed but contact saved:', emailError);
            // We don't fail the request if email fails, as DB save is more critical for record keeping
        }

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin/Super Admin)
router.get('/', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin/Super Admin)
router.delete('/:id', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/contact/reply
// @desc    Reply to a contact message
// @access  Private (Admin/Super Admin)
router.post('/reply', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    const { email, subject, message } = req.body;
    try {
        await sendEmail(email, subject, message, `<p>${message.replace(/\n/g, '<br>')}</p>`);
        res.json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.error("Reply Error:", error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
});

module.exports = router;
