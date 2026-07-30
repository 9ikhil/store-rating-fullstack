const bcrypt = require('bcrypt');
const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

const ALLOWED_ROLES = ['admin', 'user', 'store_owner'];
const SORTABLE_FIELDS = ['name', 'email', 'address', 'role'];

// GET /users  (admin only) - supports filters + sorting
// query params: name, email, address, role, sortBy, sortOrder
async function listUsers(req, res) {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (role) where.role = role;

    const order = [];
    if (sortBy && SORTABLE_FIELDS.includes(sortBy)) {
      order.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['id', 'ASC']);
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      order,
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching users' });
  }
}

// GET /users/:id  (admin only) - user details; if store_owner, include store rating
async function getUserById(req, res) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = user.toJSON();

    if (user.role === 'store_owner') {
      const store = await Store.findOne({ where: { ownerId: user.id } });
      if (store) {
        const ratingStats = await Rating.findOne({
          where: { storeId: store.id },
          attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('rating')), 'count']],
          raw: true,
        });
        result.store = {
          id: store.id,
          name: store.name,
          averageRating: ratingStats.avgRating ? Number(ratingStats.avgRating).toFixed(2) : null,
          totalRatings: Number(ratingStats.count) || 0,
        };
      }
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching user' });
  }
}

// POST /users  (admin only) - can create admin, normal user, or store_owner
async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      address: validateAddress(address),
    };
    if (role && !ALLOWED_ROLES.includes(role)) {
      errors.role = 'Role must be one of admin, user, store_owner';
    }
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'user',
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while creating user' });
  }
}

module.exports = { listUsers, getUserById, createUser };
