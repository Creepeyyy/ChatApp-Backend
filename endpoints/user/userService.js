const User = require('./userModel');
const logger = require('../../config/logger');

async function getUsers(safe) {
    try {
        let users = await User.find();
        users = safeMode(users, safe);
        return users;
    } catch (e) {
        logger.error(e);
    }
}

async function createUser(userData, safe) {
    try {
        if (!await User.exists({ userID: userData.userID })) {
            let user = await User.create(userData);
            logger.info("User erstellt.");
            user = safeMode(user, safe);
            return user;
        }
        logger.error("User konnte nicht erstellt werden.");
        return "error";
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function deleteUser(userID, safe) {
    if (!userID) return "error";
    try {
        if (await User.exists({ userID: userID })) {
            await User.deleteOne({ userID: userID });
            logger.info("User gelöscht.");
        } else {
            logger.warn("User existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return e;
    }
}

async function updateUser(userID, userData, safe) {
    try {
        let user = await User.findOne({ userID: userID });
        if (user) {
            Object.assign(user, userData);
            await user.save();
            user = safeMode(user, safe);
            return user;
        } else {
            logger.warn("User existiert nicht.")
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchUserById(userID, safe) {
    try {
        let user = await User.findOne({ userID: userID })
        if (!user) {
            logger.warn("User nicht gefunden.");
            return "not found";
        } else {
            logger.info("User gefunden");
            user = safeMode(user, safe);
            return user;
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function getNewsletterUsers() {
    try {
        let user = await User.find({ newsletter: true, email: { $exists: true } });
        return user;
    } catch {
        logger.error(e);
        return [];
    }
}

async function createAdmin() {
    try {
        if (!await User.exists({ isAdministrator: true })) {
            await User.create({ userID: "admin", password: "123", isAdministrator: true, email: "admin@website.com" });
            logger.info("Created standard admin.")
        } else {
            logger.info("Admin account already exists.")
        }
    } catch (e) {
        logger.error(e);
    }
}

function safeMode(userData, safe) {
    if (safe) {
        if (userData[Symbol.iterator]) {
            let users = [];
            for (let user of userData) {
                const { userID, userName, verified, email, newsletter, isAdministrator } = user;
                const subset = { userID, userName, verified, email, newsletter, isAdministrator };
                users.push(subset);
            }
            return users;
        }
        const { userID, userName, verified, email, newsletter, isAdministrator } = userData;
        const subset = { userID, userName, verified, email, newsletter, isAdministrator };
        return subset;
    }
    return userData;
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    searchUserById,
    createAdmin,
    getNewsletterUsers
}