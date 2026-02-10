const express = require('express');
const router = express.Router();
const {
    getTestimonials, getAdminTestimonials, submitTestimonial, createTestimonial, updateTestimonial, deleteTestimonial,
    getPartners, createPartner, updatePartner, deletePartner,
    getSettings, updateSetting,
    getTeam, createTeam, updateTeam, deleteTeam,
    getValues, createValue, updateValue, deleteValue,
    getTimeline, createTimeline, updateTimeline, deleteTimeline,
    getCerts, createCert, updateCert, deleteCert
} = require('../controllers/cmsController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// Public Access
router.get('/testimonials', getTestimonials);
router.post('/testimonials/submit', submitTestimonial); // Public submission
router.get('/partners', getPartners);
router.get('/settings', getSettings);
router.get('/team', getTeam);
router.get('/values', getValues);
router.get('/timeline', getTimeline);
router.get('/certs', getCerts);

// Admin Access
const adminAuth = [protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

// Testimonials
router.get('/admin/testimonials', ...adminAuth, getAdminTestimonials); // Admin view all
router.post('/testimonials', ...adminAuth, createTestimonial);
router.put('/testimonials/:id', ...adminAuth, updateTestimonial);
router.delete('/testimonials/:id', ...adminAuth, deleteTestimonial);

// Partners
router.post('/partners', ...adminAuth, createPartner);
router.put('/partners/:id', ...adminAuth, updatePartner);
router.delete('/partners/:id', ...adminAuth, deletePartner);

// Settings
router.post('/settings', protect, checkRole(ROLES.SUPER_ADMIN), updateSetting);

// Team
router.post('/team', ...adminAuth, createTeam);
router.put('/team/:id', ...adminAuth, updateTeam);
router.delete('/team/:id', ...adminAuth, deleteTeam);

// Values
router.post('/values', ...adminAuth, createValue);
router.put('/values/:id', ...adminAuth, updateValue);
router.delete('/values/:id', ...adminAuth, deleteValue);

// Timeline
router.post('/timeline', ...adminAuth, createTimeline);
router.put('/timeline/:id', ...adminAuth, updateTimeline);
router.delete('/timeline/:id', ...adminAuth, deleteTimeline);

// Certs
router.post('/certs', ...adminAuth, createCert);
router.put('/certs/:id', ...adminAuth, updateCert);
router.delete('/certs/:id', ...adminAuth, deleteCert);

module.exports = router;
