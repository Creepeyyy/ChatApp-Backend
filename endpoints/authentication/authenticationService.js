const userService = require('../user/userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const logger = require('../../config/logger');

async function createToken(data) {
    if (!data) {
        logger.warn("No Auth Header");
        return;
    }
    try {
        const user = await userService.searchUserById(data.userID);
        if (user) {
            if (await bcrypt.compare(data.password, user.password)) {
                logger.info("Password correct")
                const issuedAt = new Date().getTime();
                const expirationTime = config.get("session.timeout");
                const expiresAt = issuedAt + (expirationTime * 1000);
                const privateKey = config.get("session.tokenKey");
                const token = jwt.sign({ userID: user.userID, userName: user.userName, isAdministrator: user.isAdministrator }, privateKey, { expiresIn: expiresAt, algorithm: "HS256" });
                logger.info("Created token.");
                return { user, token };
            } else {
                logger.warn("Password incorrect");
                return "password incorrect";
            }
        }
    } catch (e) {
        logger.error(e);
    }
}

module.exports = {
    createToken
}