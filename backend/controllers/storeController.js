const { Op, fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');
const { validateName, validateEmail, validateAddress } = require('../utils/validators');

const SORTABLE_FIELDS = ['name', 'email', 'address'];

// GET /stores - list stores with average rating; supports search & sort
// query params: name, address, sortBy, sortOrder
// If requester is a logged-in normal user, also includes their own submitted rating per store
async function listStores(req, res) {
  try {
    const { name, address, sortBy, sortOrder } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const order = [];
    if (sortBy && SORTABLE_FIELDS.includes(sortBy)) {
      order.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['id', 'ASC']);
    }

    const stores = await Store.findAll({ where, order });

    // compute average rating for each store
    const storeIds = stores.map((s) => s.id);
    const ratingRows = await Rating.findAll({
      where: { storeId: storeIds },
      attributes: ['storeId', [fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('rating')), 'count']],
      group: ['storeId'],
      raw: true,
    });
    const ratingMap = {};
    ratingRows.forEach((r) => {
      ratingMap[r.storeId] = {
        avg: Number(r.avgRating).toFixed(2),
        count: Number(r.count),
      };
    });

    // if a normal user is logged in, fetch their own ratings for these stores
    let myRatingsMap = {};
    if (req.user && req.user.role === 'user') {
      const myRatings = await Rating.findAll({
        where: { userId: req.user.id, storeId: storeIds },
        raw: true,
      });
      myRatings.forEach((r) => {
        myRatingsMap[r.storeId] = { id: r.id, rating: r.rating };
      });
    }

    const result = stores.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      averageRating: ratingMap[s.id] ? ratingMap[s.id].avg : null,
      totalRatings: ratingMap[s.id] ? ratingMap[s.id].count : 0,
      myRating: myRatingsMap[s.id] ? myRatingsMap[s.id].rating : null,
      myRatingId: myRatingsMap[s.id] ? myRatingsMap[s.id].id : null,
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching stores' });
  }
}

// POST /stores  (admin only)
async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = {
      name: name && name.length > 0 && name.length <= 60 ? null : 'Store name must be 1-60 characters',
      email: validateEmail(email),
      address: validateAddress(address),
    };
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(400).json({ message: 'ownerId does not reference an existing user' });
      }
      if (owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'ownerId must reference a user with role store_owner' });
      }
    }

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    return res.status(201).json({ message: 'Store created successfully', store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while creating store' });
  }
}

module.exports = { listStores, createStore };
