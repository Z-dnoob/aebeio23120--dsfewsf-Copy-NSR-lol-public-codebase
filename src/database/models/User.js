const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  hp: { type: Number, default: 100 },
  chakra: { type: Number, default: 100 },
  attack: { type: Number, default: 10 },
  defense: { type: Number, default: 10 },
  agility: { type: Number, default: 10 },
  yin: { type: Number, default: 0 },   
  yang: { type: Number, default: 0 }, 
  productionNumber: { type: Number, default: 1 }
}, { _id: true });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  ryo: { type: Number, default: 0 },
  cinnabarElixir: { type: Number, default: 0 },
  hiddenScroll: { type: Number, default: 0 },
  characters: { type: [characterSchema], default: [] },
  startedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
