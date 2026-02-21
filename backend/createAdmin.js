require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ziko120204:aBDEwZcO3N6w23fF@primetrade.n1m6m.mongodb.net/test?retryWrites=true&w=majority&appName=Primetrade');

const createAdmin = async () => {
  const email = 'admin@primetrade.com';
  const password = 'adminparessword';
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('Admin already exists: admin@primetrade.com / adminpassword');
    process.exit();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Admin created: admin@primetrade.com / adminpassword');
  process.exit();
}

createAdmin();
