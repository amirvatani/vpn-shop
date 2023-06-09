const mongoose = require("mongoose");

const portSchema = new mongoose.Schema({
  port: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Port", portSchema);
