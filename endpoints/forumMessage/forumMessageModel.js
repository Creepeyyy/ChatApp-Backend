const mongoose = require('mongoose');

let forumMessageSchema = new mongoose.Schema({
    forumThreadID: { type: mongoose.Types.ObjectId, required: true, unique: false },
    title: String,
    text: String,
    authorID: String
}, { timestamps: true });

module.exports = mongoose.model("forumMessage", forumMessageSchema);