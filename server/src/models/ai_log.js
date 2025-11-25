// server/src/models/ai_log.js
const mongoose = require('mongoose');

const AILogSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  sentiment: {
    type: String,
    required: true,
  },
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AI_Log', AILogSchema);
