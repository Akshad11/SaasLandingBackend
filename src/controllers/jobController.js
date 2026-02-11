const Job = require('../models/Job');
const { ROLES } = require('../config/permissions');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (HR, Admin)
const createJob = async (req, res) => {
    try {
        const { title, slug, department, type, location, description, responsibilities, requirements, WorkMode } = req.body;

        const job = await Job.create({
            title,
            slug,
            department,
            type,
            location,
            description,
            responsibilities,
            WorkMode,
            requirements,
            postedBy: req.user.id
        });

        res.status(201).json(job);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Slug already exists' });
        }
        res.status(400).json({ message: 'Invalid job data', error: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my posted jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (HR)
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Job
// @route   PUT /api/jobs/:id
// @access  Private (HR, Admin)
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is owner (HR) or Admin
        if (req.user.role === 'hr' && job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this job' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner/Admin)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is owner or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await job.deleteOne();
        res.status(200).json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createJob,
    getJobs,
    getMyJobs,
    updateJob,
    deleteJob
};
