const express = require('express');
const router = express.Router();
const chatService = require('./chatService');
const verification = require('../utility/verification');
const util = require('util');

router.get('/', verification.verifyUser, async function (req, res) {
    try {
        const chats = await chatService.getChats(req.user.userID);
        if (chats.length) {
            res.status(200).json(Object.values(chats));
        } else {
            res.status(204).json({ "Success": "No Chats exist." });
        }
    } catch (e) {
        res.status(400);
    }
});

router.post('/', verification.verifyUser, async function (req, res) {
    try {
        const answer = await chatService.createChat(req.body, req.user.userID);
        if (answer === "error" || answer === "not found") {
            res.status(400).json({ "Error": "Couldn't create Chat." });
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});

router.delete('/', verification.verifyUser, async function (req, res) {
    try {
        const answer = await chatService.deleteChat(req.body, req.user.userID);
        if (!answer) {
            res.status(200).json({ "Error": "Deleted Chat." });
        } else if (answer == "not found") {
            res.status(404).json({ "Error": "Forum not found." });
        } else {
            res.status(400).json({ "Error": "Couldn't delete forum." });
        }
    } catch (e) {
        res.status(400);
    }
});

router.put('/', verification.verifyUser, async function (req, res) {
    try {
        let answer = await chatService.updateChat(req.body, req.user.userID);
        if (answer == "error") {
            res.status(400);
        } else if (answer == "not found") {
            res.status(404).json({ "Error": "Chat not found." });
        } else if (answer == "forbidden") {
            res.status(403).json({ "Error": "You aren't owner of this chat." });
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});

module.exports = router;