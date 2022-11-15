const express = require('express');
const router = express.Router();
const forumService = require('./forumThreadService');
const forumMessageService = require('../forumMessage/forumMessageService');
const verification = require('../utility/verification');

router.get('/', async function (req, res, next) {
    try {
        if (req.query.ownerID) {
            const answer = await forumService.searchForumByOwnerId(req.query.ownerID, req.safe);
            getByOwnerIDAusgabe(res, answer);
        } else {
            const forums = await forumService.getForums(true);
            if (forums) {
                res.status(200).json(Object.values(forums));
            } else {
                res.status(400);
            }
        }
    } catch (e) {
        res.status(400);
    }
});

router.post('/', verification.verifyUser, async function (req, res) {
    try {
        const answer = await forumService.createForum(req.body, req.user.userID);
        if (answer == "error") {
            res.status(400).json({ "Error": "Couldn't create forum." });
        } else {
            res.status(201).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});

router.delete('/:forumID', verification.verifyUser, async function (req, res) {
    try {
        let answer = await forumService.searchForumById(req.params.forumID, req.safe);
        if (req.user.isAdministrator === true || req.user.userID === answer.ownerID) {
            answer = await forumService.deleteForum(req.params.forumID, req.safe);
            if (answer == "not found") {
                res.status(404).json({ "Error": "Forum not found." });
            } else if (!answer) {
                res.status(200).json({ "Success": "Deleted forum." });
            } else {
                res.status(400).json({ "Error": "Couldn't delete forum." });
            }
        } else {
            res.status(403).json({ "Error": "You don't have permissions." });
        }
    } catch (e) {
        res.status(400);
    }
});

router.get('/myForumThreads', verification.verifyUser, async function (req, res) {
    try {
        const answer = await forumService.searchForumByOwnerId(req.user.userID, req.safe);
        getByOwnerIDAusgabe(res, answer);
    } catch (e) {
        res.status(400);

    }
});

router.get('/:forumID', async function (req, res) {
    try {
        const answer = await forumService.searchForumById(req.params.forumID, req.safe);
        if (answer == "error") {
            res.status(400);
        } else if (answer == "not found") {
            res.status(404).json({ "Error": "Forum not found." });
        } else {
            res.status(200).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});


function getByOwnerIDAusgabe(res, answer) {
    if (answer == "error") {
        res.status(400).json({ "Error": answer });
    } else if (answer == "not found") {
        res.status(200).json([]);
    } else {
        res.status(200).json(answer);
    }
}

router.put('/:forumID', verification.verifyUser, async function (req, res) {
    try {
        const oldForum = await forumService.searchForumById(req.params.forumID, req.safe);
        if (req.user.isAdministrator === true || req.user.userID === oldForum.ownerID) {
            const newForum = await forumService.updateForum(req.params.forumID, req.body, req.safe);
            if (newForum == "error") {
                res.status(400);
            } else if (newForum == "not found") {
                res.status(404).json({ "Error": "Forum not found." });
            } else {
                res.status(201).json(newForum);
            }
        } else {
            res.status(403).json({ "Error": "You don't have permissions." });
        }
    } catch (e) {
        res.status(400);
    }
});

router.get('/:forumID/forumMessages', async function (req, res) {
    try {
        const answer = await forumMessageService.searchMessagesByForumId(req.params.forumID, req.safe);
        if (answer == "error") {
            res.status(400).json({ "Error": answer });
        } else {
            res.status(200).json(answer);
        }
    } catch (e) {
        res.status(400);
    }
});

module.exports = router;