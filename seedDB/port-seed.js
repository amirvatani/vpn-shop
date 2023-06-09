const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Port = require("../models/port");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
connectDB();

async function seedDB() {
  async function seedPort(number) {
    try {
      const port = await new Port({ port: number });
      await port.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }
  await seedPort(59018);
  await seedPort(27522);
  await seedPort(59606);
  await seedPort(50945);
  await seedPort(43811);
  await seedPort(16862);

  await closeDB();
}

seedDB();
