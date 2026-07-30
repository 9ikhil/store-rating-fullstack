const express = require('express');
const router = express.Router();
const { listStores, createStore } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

// Stores list is viewable by any logged-in user (admin, user, store_owner)
router.get('/', authenticate, listStores);
router.post('/', authenticate, authorize('admin'), createStore);

module.exports = router;
