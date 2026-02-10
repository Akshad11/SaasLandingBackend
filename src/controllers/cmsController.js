const { TeamMember, CoreValue, TimelineEvent, Certification } = require('../models/AboutModels');
const Setting = require('../models/SiteSetting');
const Testimonial = require('../models/Testimonial');
const Partner = require('../models/Partner');

// --- Testimonials ---
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getAdminTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const submitTestimonial = async (req, res) => {
    try {
        const { name, role, company, message, rating, image } = req.body;
        const testimonial = await Testimonial.create({
            name, role, company, message, rating, image,
            isActive: false // Default to inactive for moderation
        });
        res.status(201).json({ message: 'Testimonial submitted for review', testimonial });
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json(testimonial);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!testimonial) return res.status(404).json({ message: 'Not Found' });
        res.json(testimonial);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Partners ---
const getPartners = async (req, res) => {
    try {
        const partners = await Partner.find().sort({ order: 1 });
        res.json(partners);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createPartner = async (req, res) => {
    try {
        const partner = await Partner.create(req.body);
        res.status(201).json(partner);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updatePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!partner) return res.status(404).json({ message: 'Not Found' });
        res.json(partner);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deletePartner = async (req, res) => {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Settings ---
const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({});
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const updateSetting = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (settings) {
            settings = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = await Setting.create(req.body);
        }
        res.json(settings);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

// --- Team ---
const getTeam = async (req, res) => {
    try {
        const team = await TeamMember.find().sort({ order: 1 });
        res.json(team);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createTeam = async (req, res) => {
    try {
        const member = await TeamMember.create(req.body);
        res.status(201).json(member);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updateTeam = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!member) return res.status(404).json({ message: 'Not Found' });
        res.json(member);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deleteTeam = async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Values ---
const getValues = async (req, res) => {
    try {
        const values = await CoreValue.find().sort({ order: 1 });
        res.json(values);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createValue = async (req, res) => {
    try {
        const value = await CoreValue.create(req.body);
        res.status(201).json(value);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updateValue = async (req, res) => {
    try {
        const value = await CoreValue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!value) return res.status(404).json({ message: 'Not Found' });
        res.json(value);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deleteValue = async (req, res) => {
    try {
        await CoreValue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Timeline ---
const getTimeline = async (req, res) => {
    try {
        const events = await TimelineEvent.find().sort({ year: 1 });
        res.json(events);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createTimeline = async (req, res) => {
    try {
        const event = await TimelineEvent.create(req.body);
        res.status(201).json(event);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updateTimeline = async (req, res) => {
    try {
        const event = await TimelineEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Not Found' });
        res.json(event);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deleteTimeline = async (req, res) => {
    try {
        await TimelineEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- Certs ---
const getCerts = async (req, res) => {
    try {
        const certs = await Certification.find().sort({ date: -1 });
        res.json(certs);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createCert = async (req, res) => {
    try {
        const cert = await Certification.create(req.body);
        res.status(201).json(cert);
    } catch (error) { res.status(400).json({ message: 'Invalid Data' }); }
};

const updateCert = async (req, res) => {
    try {
        const cert = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cert) return res.status(404).json({ message: 'Not Found' });
        res.json(cert);
    } catch (error) { res.status(400).json({ message: 'Update Failed' }); }
};

const deleteCert = async (req, res) => {
    try {
        await Certification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = {
    getTestimonials, getAdminTestimonials, submitTestimonial, createTestimonial, updateTestimonial, deleteTestimonial,
    getPartners, createPartner, updatePartner, deletePartner,
    getSettings, updateSetting,
    getTeam, createTeam, updateTeam, deleteTeam,
    getValues, createValue, updateValue, deleteValue,
    getTimeline, createTimeline, updateTimeline, deleteTimeline,
    getCerts, createCert, updateCert, deleteCert
};
