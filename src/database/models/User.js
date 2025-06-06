const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  id: String,
  name: String
});

const userSchema = new mongoose.Schema({
  userId: String,
  ryo: { type: Number, default: 0 },
  cinnabarElixir: { type: Number, default: 0 },
  hiddenScroll: { type: Number, default: 0 },
  characters: [characterSchema],
  startedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
