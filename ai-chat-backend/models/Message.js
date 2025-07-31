const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: Date,
});

module.exports = mongoose.model('Message', MessageSchema);
