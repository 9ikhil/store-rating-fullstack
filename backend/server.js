const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const seedAdminIfMissing = require('./utils/seedAdmin');

const app = express();

app.use(cors());
app.use(express.json());

app.use(cors({ origin: 'https://store-rating-app.vercel.app' }));

app.get('/', (req, res) => {
  res.json({ message: 'Store Rating API is running' });
});

app.use('/api', authRoutes); // /api/register, /api/login, /api/change-password
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// generic error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // sync models (creates tables if they don't exist)
    await sequelize.sync();
console.log('Models synced');

await seedAdminIfMissing();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
