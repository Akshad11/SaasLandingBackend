const express = require('express');
const router = express.Router();
const sendEmail = require('../services/emailService');
const {
    createContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// Public Routes
// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    try {
        // Create contact using controller
        await createContact(req, res);

        // If contact was created successfully, send email notification
        if (res.statusCode === 201) {
            const { name, email, phone, subject, message } = req.body;

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
                await sendEmail(
                    process.env.EMAIL_USER,
                    `New Contact from ${name}`,
                    message,
                    emailContent
                );
            } catch (emailError) {
                console.error('Email sending failed but contact saved:', emailError);
                // We don't fail the request if email fails, as DB save is more critical
            }
        }
    } catch (error) {
        console.error('Contact error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
});

// Protected Routes - Admin/HR Access
// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private (HR, Admin, Super Admin)
router.get('/stats', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), getContactStats);

// @route   GET /api/contact
// @desc    Get all contact messages with filtering and pagination
// @access  Private (HR, Admin, Super Admin)
router.get('/', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), getContacts);

// @route   GET /api/contact/:id
// @desc    Get single contact message (auto-marks as read)
// @access  Private (HR, Admin, Super Admin)
router.get('/:id', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), getContactById);

// @route   PUT /api/contact/:id/status
// @desc    Update contact status (New, Read, Replied)
// @access  Private (HR, Admin, Super Admin)
router.put('/:id/status', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), updateContactStatus);

// @route   POST /api/contact/reply
// @desc    Reply to a contact message
// @access  Private (HR, Admin, Super Admin)
router.post('/reply', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    const { contactId, email, subject, message } = req.body;

    try {
        // Send email reply
        await sendEmail(
            email,
            subject,
            message,
            `<p>${message.replace(/\n/g, '<br>')}</p>`
        );

        // Update contact status to 'Replied' if contactId is provided
        if (contactId) {
            const Contact = require('../models/Contact');
            const contact = await Contact.findById(contactId);
            if (contact) {
                contact.status = 'Replied';
                await contact.save();
            }
        }

        res.json({
            success: true,
            message: 'Reply sent successfully'
        });
    } catch (error) {
        console.error("Reply Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply'
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin, Super Admin only)
router.delete('/:id', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteContact);

module.exports = router;
