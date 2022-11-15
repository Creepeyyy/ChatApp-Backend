const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');

let userSchema = new mongoose.Schema({
    userID: { type: String, unique: true, required: true },
    userName: String,
    email: String,
    newsletter: {type: Boolean, default: true},
    verified: {type: Boolean, default: false},
    password: { type: String, required: true },
    isAdministrator: {type: Boolean, default: false}
}, { timestamps: true });

userSchema.methods.whoAmI = function () {
    var output = this.userName
        ? "My name is " + this.userName
        : "I don't have a name";
    logger.silly(output);
}

userSchema.pre('save', async function (next) {
    var user = this;
    if (!user.isModified('password')) {
        next();
        return; 
    }
    try {
        user.password = await bcrypt.hash(user.password, 10);
    } catch (e) {
        logger.error(e);
    }
        next();
})

module.exports = mongoose.model("user", userSchema);