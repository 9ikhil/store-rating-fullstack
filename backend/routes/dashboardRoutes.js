const express = require('express');
const router = express.Router();
const { adminDashboard, ownerDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/admin', authenticate, authorize('admin'), adminDashboard);
router.get('/owner', authenticate, authorize('store_owner'), ownerDashboard);

module.exports = router;
