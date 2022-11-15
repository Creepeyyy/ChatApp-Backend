const express = require('express');
const router = express.Router();
const registerService = require('./registerService');
const userService = require('../user/userService');
const verification = require('../utility/verification');
const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../config/logger');

router.get("/verification/:token", async function (req, res) {
    try {
        const privateKey = config.get("email.tokenKey");
        jwt.verify(req.params.token, privateKey, async (err, user) => {
            if (err) {
                logger.error(err);
                res.status(401).json({ "Error": "Invalid token" });
                return;
            } else {
                logger.info("Token is valid");
                await userService.updateUser(user.user, { verified: true }, true);
                res.status(200).json({ "Success": "You are now verified." });
            }
        });
    } catch (e) {
        logger.error(e);
        res.status(400).json({ "Error": "error" });
    }
});

router.post('/verification', verification.verifyUser, async function (req, res) {
    try {
        await userService.updateUser(req.user.userID, { email: req.body.email });
        const answer = await userService.searchUserById(req.user.userID);
        if (answer == "not found" || answer == "error") {
            res.status(400).json({ "Error": "Something went wrong. Try again." });
        } else {
            logger.debug(answer.email);
            if (answer.email) {
                await registerService.createMail(answer);
                res.status(200).json({ "Success": "Send verification email." });
            } else {
                res.status(400).json({ "Error": "User has no email." });
            }
        }
    } catch (e) {
        res.status(400).json({ "Error": "error" });
    }
});

router.post('/', async function (req, res) {
    try {
        const answer = await registerService.registerUser(req.body);
        if (answer != "error") {
            res.status(201).send({ "Success": "User created." });
        } else {
            res.status(400).send({ "Error": "Couldn't create user." });
        }
    } catch (e) {
        res.status(400).send({ "Error": "error" });
    }
});

module.exports = router;