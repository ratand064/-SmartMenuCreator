const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI);

(async () => {
  const password = await bcrypt.hash('123456', 10);

  await User.create({
    email: 'admin@yumblock.com',
    password,
    role: 'merchant'
  });

  console.log('Merchant created');
  process.exit();
})();
