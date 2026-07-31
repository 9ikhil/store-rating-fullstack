const bcrypt = require('bcrypt');
const { User } = require('../models');

async function seedAdminIfMissing() {
  try {
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log('Admin already exists, skipping auto-seed.');
      return;
    }

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@storerating.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: 'System Administrator Account',
      email,
      password: hashedPassword,
      address: 'Head Office',
      role: 'admin',
    });

    console.log('==============================================');
    console.log('No admin found — created a default admin:');
    console.log(`  email: ${email}`);
    console.log(`  password: ${password}`);
    console.log('Change this password after logging in.');
    console.log('==============================================');
  } catch (err) {
    console.error('Auto-seed failed (non-fatal, server will continue):', err.message);
  }
}

module.exports = seedAdminIfMissing;