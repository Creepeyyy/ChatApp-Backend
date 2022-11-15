const mongoose = require('mongoose');
const logger = require('../../config/logger');

let forumSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: String,
    ownerID: String
}, { timestamps: true });

forumSchema.methods.info = function () {
    const output = this.description
        ? "This forum is all about:\n" + this.description
        : "This forum is about " + this.name;
    logger.silly(output);
}

module.exports = mongoose.model("forumThread", forumSchema);