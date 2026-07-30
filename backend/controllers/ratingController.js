const { Rating, Store } = require('../models');
const { validateRating } = require('../utils/validators');

// POST /ratings  (normal user only) - submit a new rating for a store
async function createRating(req, res) {
  try {
    const { storeId, rating } = req.body;
    const ratingError = validateRating(rating);
    if (ratingError) return res.status(400).json({ message: ratingError });

    if (!storeId) return res.status(400).json({ message: 'storeId is required' });

    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const existing = await Rating.findOne({ where: { userId: req.user.id, storeId } });
    if (existing) {
      return res.status(409).json({ message: 'You have already rated this store. Use update instead.' });
    }

    const newRating = await Rating.create({ userId: req.user.id, storeId, rating });
    return res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while submitting rating' });
  }
}

// PUT /ratings/:id  (normal user only) - update own rating
async function updateRating(req, res) {
  try {
    const { rating } = req.body;
    const ratingError = validateRating(rating);
    if (ratingError) return res.status(400).json({ message: ratingError });

    const existing = await Rating.findByPk(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Rating not found' });

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own rating' });
    }

    existing.rating = rating;
    await existing.save();

    return res.json({ message: 'Rating updated successfully', rating: existing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while updating rating' });
  }
}

module.exports = { createRating, updateRating };
