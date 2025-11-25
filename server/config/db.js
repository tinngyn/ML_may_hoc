
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/nhahang'; 

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
    });
    console.log('Ket noi Database thanh cong!');
  } catch (error) {
    console.error('Ket noi Database that bai:', error.message);

    process.exit(1);
  }
};

module.exports = connectDB;