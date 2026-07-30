const express = require('express');
const router = express.Router();
const { createRating, updateRating } = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('user'), createRating);
router.put('/:id', authenticate, authorize('user'), updateRating);

module.exports = router;
