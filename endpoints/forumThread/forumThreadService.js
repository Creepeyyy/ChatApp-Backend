const ForumThread = require('./forumThreadModel');
const ForumMessage = require('../forumMessage/forumMessageModel');
const logger = require('../../config/logger');

async function getForums(safe) {
    try {
        let forums = await ForumThread.find();
        forums = safeMode(forums, safe);
        return forums;
    } catch (e) {
        logger.error(e);
    }
}

async function createForum(forumData, userID) {
    try {
        let forum = await ForumThread.create(forumData);
        forum.ownerID = userID;
        await forum.save();
        logger.info("Forum erstellt.");
        forum = safeMode(forum, true);
        return forum;
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function deleteForum(forumID) {
    try {
        if (await ForumThread.exists({_id: forumID})) {
            await ForumMessage.deleteMany({forumThreadID: forumID});
            await ForumThread.deleteOne({_id: forumID});
            logger.info("Forum gelöscht.");
        } else {
            logger.warn("Forum existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return e;
    }
}

async function updateForum(forumID, forumData, safe) {
    try {
        let forum = await ForumThread.findOne({ _id: forumID });
        if (forum) {
            Object.assign(forum, forumData, {ownerID: forum.ownerID});
            await forum.save();
            forum = safeMode(forum, safe);
            return forum;
        } else {
            logger.warn("Forum existiert nicht.")
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchForumByOwnerId(ownerID) {
    try {  
        let forum = await ForumThread.find({ ownerID: ownerID });
        return forumByAusgabe(!forum.length, forum);
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchForumById(ID) {
    try {
        let forum = await ForumThread.findOne({ _id: ID });
        return forumByAusgabe(!forum, forum);
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

function forumByAusgabe(condition, forum) {
    if (condition) {
        logger.warn("Forum nicht gefunden.");
        return "not found";
    } else {
        logger.info("Forum gefunden");
        forum = safeMode(forum, true);
        return forum;
    }
}

function safeMode(forumData, safe) {
    if(safe) {
        if(forumData[Symbol.iterator]) {
            let forums = [];
            for(let forum of forumData) {
                const { _id, name, description, ownerID } = forum;
                const subset = { _id, name, description, ownerID };
                forums.push(subset);
            }
            return forums;
        } 
        const { _id, name, description, ownerID } = forumData;
        const subset = { _id, name, description, ownerID };
        return subset;
    }
    return forumData;
}

module.exports = {
    getForums,
    createForum,
    updateForum,
    deleteForum,
    searchForumByOwnerId,
    searchForumById
}