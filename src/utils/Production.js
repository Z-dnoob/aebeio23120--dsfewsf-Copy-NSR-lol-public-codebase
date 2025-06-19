const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Production', productionSchema);
