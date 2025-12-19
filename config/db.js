const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB ga yaxshi ulandi");
  } catch (err) {
    console.log("MongoDB ulanish xatosi:", err.message);
  }
}

module.exports = connectDB;
