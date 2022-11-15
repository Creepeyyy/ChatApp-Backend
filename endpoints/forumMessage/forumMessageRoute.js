const express = require('express');
const router = express.Router();
const forumMessageService = require('./forumMessageService');
const verification = require('../utility/verification');

router.get('/', async function (req, res) {
    try {
        if (req.query.forumThreadID) {
            const answer = await forumMessageService.searchMessagesByForumId(req.query.forumThreadID, req.safe);
            getByAusgabe(res, answer);
        } else {
            const messages = await forumMessageService.getForumMessages(true);
            if (messages) {
                res.status(200).json(Object.values(messages));
            }
        }
    } catch (e) {
        res.status(400);
    }
});

router.post('/', verification.verifyUser, async function (req, res) {
    try {
        const answer = await forumMessageService.createForumMessage(req.body, req.user.userID, req.safe);
        if (answer == "not found" || answer == "error") {
            res.status(400).json({ "Error": "Couldn't create message." });
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});

router.delete('/:messageID', verification.verifyUser, async function (req, res) {
    try {
        let answer = await forumMessageService.searchMessageById(req.params.messageID, req.safe);
        if (req.user.isAdministrator === true || req.user.userID === answer.authorID) {
            answer = await forumMessageService.deleteForumMessage(req.params.messageID, req.safe);
            if (!answer) {
                res.status(200).json({ "Success": "Deleted message." });
            } else if (answer == "not found") {
                res.status(404).json({ "Error": "Message not found." });
            } else {
                res.status(400).json({ "Error": "Couldn't delete message." });
            }
        } else {
            res.status(403).json({ "Error": "You don't have permissions." });
        }
    } catch (e) {
        res.status(400);
    }
});

router.get('/myForumMessages', verification.verifyUser, async function (req, res) {
    try {
        const answer = await forumMessageService.searchMessagesByAuthorId(req.user.userID, req.safe);
        getByAusgabe(res, answer);
    } catch (e) {
        res.status(400);

    }
});

router.get('/getByAuthorID/:authorID', verification.verifyUser, verification.verifyAdmin, async function (req, res) {
    try {
        const answer = await forumMessageService.searchMessagesByAuthorId(req.params.authorID, req.safe);
        getByAusgabe(res, answer);
    } catch (e) {
        res.status(400);
    }
});

function getByAusgabe(res, answer) {
    if (answer == "error") {
        res.status(400).json({ "Error": answer });
    } else if (answer == "not found") {
        res.status(200).json([]);
    } else {
        res.status(200).json(answer);
    }
}

router.put('/:messageID', verification.verifyUser, async function (req, res) {
    try {
        let oldMessage = await forumMessageService.searchMessageById(req.params.messageID, req.safe);
        if (req.user.isAdministrator === true || req.user.userID === oldMessage.authorID) {
            if (req.body.messageText === "") {
                await forumMessageService.deleteForumMessage(req.params.messageID, req.safe);
                res.status(200).json({ "Success": "Deleted message." });
                return;
            }
            let newMessage = await forumMessageService.updateForumMessage(req.params.messageID, req.body, req.safe);
            if (newMessage === "error") {
                res.status(400);
            } else if (newMessage === "not found") {
                res.status(404).json({ "Error": "Forum not found."});
            } else {
                res.status(201).json(newMessage);
            }
        } else {
            res.status(403).json({ "Error": "You don't have permissions." });
        }
    } catch (e) {
        res.status(400);
    }
});

module.exports = router;