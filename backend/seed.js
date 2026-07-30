// Run with: node seed.js
// Creates a default admin account so you can log in for the first time.
const bcrypt = require('bcrypt');
const { sequelize, User } = require('./models');
require('dotenv').config();

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { email: 'admin@storerating.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    await User.create({
      name: 'System Administrator Account', // must be 20-60 chars
      email: 'admin@storerating.com',
      password: hashedPassword,
      address: 'Head Office',
      role: 'admin',
    });

    console.log('Default admin created:');
    console.log('  email: admin@storerating.com');
    console.log('  password: Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
