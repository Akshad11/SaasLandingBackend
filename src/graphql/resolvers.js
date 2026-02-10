const User = require('../models/User');
const Contact = require('../models/Contact');
const sendEmail = require('../services/emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.user) throw new Error('Not authenticated');
            return await User.findById(context.user.id);
        },
        contacts: async (_, __, context) => {
            if (!context.user || (context.user.role !== 'admin' && context.user.role !== 'super-admin')) {
                throw new Error('Not authorized');
            }
            return await Contact.find().sort({ createdAt: -1 });
        },
        contact: async (_, { id }, context) => {
            if (!context.user || (context.user.role !== 'admin' && context.user.role !== 'super-admin')) {
                throw new Error('Not authorized');
            }
            return await Contact.findById(id);
        }
    },
    Mutation: {
        register: async (_, { name, email, password }) => {
            const userExists = await User.findOne({ email });

            if (userExists) {
                throw new Error('User already exists');
            }

            const user = await User.create({
                name,
                email,
                password // Password hashing is handled in User model pre-save hook
            });

            if (user) {
                return {
                    token: generateToken(user._id),
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                };
            } else {
                throw new Error('Invalid user data');
            }
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });

            if (user && (await user.matchPassword(password))) {
                return {
                    token: generateToken(user._id),
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                };
            } else {
                throw new Error('Invalid email or password');
            }
        },
        submitContact: async (_, { name, email, message, phone, subject }) => {
            try {
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

                try {
                    await sendEmail(process.env.EMAIL_USER, `New Contact from ${name}`, message, emailContent);
                } catch (emailError) {
                    console.error('Email sending failed but contact saved:', emailError);
                }

                return true;
            } catch (error) {
                console.error(error);
                throw new Error('Server Error');
            }
        },
        deleteContact: async (_, { id }, context) => {
            if (!context.user || (context.user.role !== 'admin' && context.user.role !== 'super-admin')) {
                throw new Error('Not authorized');
            }
            const contact = await Contact.findById(id);
            if (!contact) {
                throw new Error('Message not found');
            }
            await Contact.findByIdAndDelete(id);
            return true;
        },
        replyContact: async (_, { id, message }, context) => { // 'message' here is the reply body
            if (!context.user || (context.user.role !== 'admin' && context.user.role !== 'super-admin')) {
                throw new Error('Not authorized');
            }
            const contact = await Contact.findById(id);
            if (!contact) {
                throw new Error('Contact not found');
            }

            try {
                await sendEmail(contact.email, `Re: ${contact.subject}`, message, `<p>${message.replace(/\n/g, '<br>')}</p>`);
                // Update status to Replied?
                contact.status = 'Replied';
                await contact.save();
                return true;
            } catch (error) {
                console.error("Reply Error:", error);
                throw new Error('Failed to send reply');
            }
        }
    }
};

module.exports = resolvers;
