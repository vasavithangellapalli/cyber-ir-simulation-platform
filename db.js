// ============================================
// config/db.js — MongoDB Connection Setup
// ============================================
// This file connects our app to MongoDB using Mongoose.
// Mongoose is a library that makes talking to MongoDB easy.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect() opens the connection to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the app if DB connection fails (code 1 = failure)
    process.exit(1);
  }
};

module.exports = connectDB;
