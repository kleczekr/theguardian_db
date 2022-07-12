const mongoose = require("mongoose");

const InputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  textInput: {
    type: String,
    required: true,
  },
  nameInput: {
    type: String,
    enum: ["am", "bs", "bj", "em", "ja", "jt", "tm"],
  },
});

module.exports = mongoose.model("Input", InputSchema);
