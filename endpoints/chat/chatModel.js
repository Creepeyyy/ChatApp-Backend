const mongoose = require('mongoose');

let chatSchema = new mongoose.Schema({
    chatName: String,
    chatDescription: String,
    ownerID: String,
    users: Array
}, { timestamps: true });

chatSchema.methods.includesUser = function (user) {
    const users = this.users;
    if (users.includes(user)) {
        return true;
    }
    return false;
}

chatSchema.pre("save", async function (next) {
    let users = this.users;
    users = users.sort().filter(function (value, index, array) {
        return value != array[index - 1];
    });
    next();
});

module.exports = mongoose.model("chat", chatSchema);