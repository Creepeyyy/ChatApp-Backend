const logger = require('../../config/logger');
const config = require('config');
const jwt = require('jsonwebtoken');

async function verifyAdmin(req, res, next) {
    if (req.user.isAdministrator) {
        logger.info("User is admin and has permission.");
        next();
    } else {
        logger.warn("User without admin permissions tried admin operation.");
        res.status(403).json({ "Error": "You don't have permission to do that." });
    }
}

async function verifyAdminOrSelf(req, res, next) {
    try {
        if (req.user.isAdministrator || req.user.userID === req.params.userID) {
            logger.info("User is admin and has permission.");
            next();
        } else {
            logger.warn("User without admin permissions tried admin operation.");
            res.status(403).json({ "Error": "You don't have permission to do that." });
        }
    } catch (e) {
        logger.error(e);
        res.status(400).json({ "Error": "Something wen't wrong." });
    }
}

function verifyUser(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(req.body);
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        const privateKey = config.get("session.tokenKey");
        jwt.verify(token, privateKey, async (err, user) => {
            if (err) {
                logger.error("Token is invalid");
                res.status(401).json({ "Error": "Invalid token" });
                return;
            } else {
                logger.info("Token is valid");
                req.user = user;
                req.safe = true;
                next();
            }
        });
    } else {
        logger.error("No auth header");
        res.status(401).json({ "Error": "No auth header" });
        return;
    }
}

module.exports = {
    verifyAdmin,
    verifyUser,
    verifyAdminOrSelf
}
