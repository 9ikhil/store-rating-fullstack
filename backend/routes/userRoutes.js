const express = require('express');
const router = express.Router();
const { listUsers, getUserById, createUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), listUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.post('/', authenticate, authorize('admin'), createUser);

module.exports = router;
