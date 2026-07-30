const { fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');

// GET /dashboard/admin  (admin only)
async function adminDashboard(req, res) {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching admin dashboard' });
  }
}

// GET /dashboard/owner  (store_owner only)
async function ownerDashboard(req, res) {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const ratingStats = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('rating')), 'count']],
      raw: true,
    });

    const raters = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      store: { id: store.id, name: store.name, address: store.address },
      averageRating: ratingStats.avgRating ? Number(ratingStats.avgRating).toFixed(2) : null,
      totalRatings: Number(ratingStats.count) || 0,
      raters: raters.map((r) => ({
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        rating: r.rating,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching owner dashboard' });
  }
}

module.exports = { adminDashboard, ownerDashboard };
