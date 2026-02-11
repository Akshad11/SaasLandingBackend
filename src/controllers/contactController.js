const Contact = require('../models/Contact');

// @desc    Create a new contact message
// @route   POST /api/contacts
// @access  Public
const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                message: 'Please provide name, email, and message'
            });
        }

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Contact message sent successfully',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to send contact message',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private (HR, Admin)
const getContacts = async (req, res) => {
    try {
        const { status, search, limit = 50, page = 1 } = req.query;

        // Build query
        const query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Search by name, email, or subject
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Contact.countDocuments(query);

        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single contact message
// @route   GET /api/contacts/:id
// @access  Private (HR, Admin)
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        // Auto-mark as read when viewed
        if (contact.status === 'New') {
            contact.status = 'Read';
            await contact.save();
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update contact status
// @route   PUT /api/contacts/:id/status
// @access  Private (HR, Admin)
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['New', 'Read', 'Replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be New, Read, or Replied'
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        contact.status = status;
        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contacts/:id
// @access  Private (Admin only)
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        await contact.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private (HR, Admin)
const getContactStats = async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        const newMessages = await Contact.countDocuments({ status: 'New' });
        const readMessages = await Contact.countDocuments({ status: 'Read' });
        const repliedMessages = await Contact.countDocuments({ status: 'Replied' });

        // Get recent contacts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                new: newMessages,
                read: readMessages,
                replied: repliedMessages,
                recentContacts,
                unreadCount: newMessages
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};
