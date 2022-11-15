const express = require('express');
const router = express.Router();
const newsletterService = require('./newsletterService');
const userService = require('../user/userService');
const verification = require('../utility/verification');
const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../config/logger');

router.get("/unsubscribe/:token", async function (req, res) {
    try {
        let userID;
        const privateKey = config.get("email.tokenKey");
        jwt.verify(req.params.token, privateKey, (err, user) => {
            if (err) {
                logger.error(err);
                res.status(401).json({ "Error": "Invalid token" });
                return;
            } else {
                logger.info("Token is valid");
                userID = user.user;
            }
        });
        await userService.updateUser(userID, {newsletter: false }, true);
        res.status(200).send({ "Success": "You sucessfully unsubscribed." });
    } catch (e) {
        logger.error(e);
        res.status(400);
    }
});

router.post('/', verification.verifyUser, verification.verifyAdmin, async function (req, res) {
    try {
        if (await newsletterService.createMail(req)) {
            res.status(200).json({ "Success": "Mails send." });
        } else {
            res.status(400).json({ "Error": "Couldn't send mails." });
        }
    } catch (e) {
        res.status(400);
    }
});

module.exports = router;