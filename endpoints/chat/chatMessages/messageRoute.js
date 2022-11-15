const express = require('express');
const router = express.Router();
const messageService = require('./messageService');
const verification = require('../../utility/verification');
const util = require('util');

router.get('/:id', verification.verifyUser, async function (req, res) {
    try {
        const messages = await messageService.getMessagesByChatID(req.params.id, req.user.userID);
        if (messages === "error") {
            res.status(400).json({ "Error": "Something went wrong :/" });
        } else if (messages.length) {
            res.status(200).json(Object.values(messages));
        } else {
            res.status(204).json({ "Success": "No messages exist." });
        }
    } catch (e) {
        res.status(400).json({ "Error": "Error" });
    }
});

router.post('/:id', verification.verifyUser, async function (req, res) {
    try {
        req.body.chatID = req.params.id;
        const answer = await messageService.createMessage(req.body, req.user.userID);
        if (answer == "not found" || answer == "error") {
            res.status(400).json({ "Error": "Couldn't create message." });
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400).json({ "Error": "Error" });
    }
});

router.delete('/:id', verification.verifyUser, async function (req, res) {
    try {
        req.body.chatID = req.params.id;
        const answer = await messageService.deleteMessage(req.body, req.user.userID);
        if (answer == "not found") {
            res.status(404).json({ "Error": "Message not found." });
        } else if (!answer) {
            res.status(200).json({ "Success": "Deleted message." });
        } else {
            res.status(400).json({ "Error": "Couldn't delete message." });
        }
    } catch (e) {
        res.status(400).json({ "Error": "Error" });
    }
});

router.put('/:id', verification.verifyUser, async function (req, res) {
    try {
        req.body.chatID = req.params.id;
        const answer = await messageService.updateMessage(req.body, req.user.userID);
        if (answer === "error") {
            res.status(400).json({ "Error": "Error" });
        } else if (answer === "not found") {
            res.status(404).json({ "Error": "Message not found or you dont have permission." })
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400).json({ "Error": "Error" });
    }
});

module.exports = router;