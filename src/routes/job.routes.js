const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getMyJobs,
    updateJob,
    deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole, checkPermission } = require('../middleware/rbacMiddleware');
const { ROLES, PERMISSIONS } = require('../config/permissions');

router.post('/', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), createJob);
router.get('/', getJobs); // Public for job board
router.get('/my-jobs', protect, checkRole(ROLES.HR), getMyJobs);
router.put('/:id', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), updateJob);
router.delete('/:id', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteJob);

module.exports = router;
