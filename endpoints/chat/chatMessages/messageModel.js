const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatID: String,
    message: String,
    authorID: String
}, { timestamps: true });

module.exports = mongoose.model("message", messageSchema);