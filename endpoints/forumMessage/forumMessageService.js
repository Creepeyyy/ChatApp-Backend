const ForumMessage = require('./forumMessageModel');
const Forum = require('../forumThread/forumThreadModel');
const logger = require('../../config/logger');

async function getForumMessages(safe) {
    try {
        let forumMessages = await ForumMessage.find();
        forumMessages = safeMode(forumMessages, safe);
        return forumMessages;
    } catch (e) {
        logger.error(e);
    }
}

async function createForumMessage(forumMessageData, userID, safe) {
    try {
        if (await Forum.exists({ _id: forumMessageData.forumThreadID })) {
            let forumMessage = await ForumMessage.create(forumMessageData);
            forumMessage.authorID = userID;
            await forumMessage.save();
            logger.info("Message erstellt.");
            forumMessage = safeMode(forumMessage, safe);
            return forumMessage;
        } else {
            logger.info("Forum existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function deleteForumMessage(messageID) {
    try {
        if (await ForumMessage.exists({ _id: messageID })) {
            await ForumMessage.deleteOne({ _id: messageID });
            logger.info("Message gelöscht.");
        } else {
            logger.warn("Message existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return e;
    }
}

async function updateForumMessage(messageID, messageData, safe) {
    try {
        let message = await ForumMessage.findOne({ _id: messageID });
        if (message) {
            Object.assign(message, messageData, { authorID: message.authorID });
            await message.save();
            message = safeMode(message, safe);
            return message;
        } else {
            logger.warn("Message existiert nicht.")
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchMessagesByForumId(forumThreadID, safe) {
    try {
        let messages = await ForumMessage.find({ forumThreadID: forumThreadID });
        logger.info("Forum gefunden");
        messages = safeMode(messages, safe);
        return messages;
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchMessagesByAuthorId(authorID, safe) {
    try {
        let messages = await ForumMessage.find({ authorID: authorID });
        if (!messages.length) {
            logger.warn("Author nicht gefunden.");
            return "not found";
        } else {
            logger.info("Messages gefunden");
            messages = safeMode(messages, safe);
            return messages;
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function searchMessageById(ID, safe) {
    try {
        let message = await ForumMessage.findOne({ _id: ID });
        if (!message) {
            logger.warn("Forum nicht gefunden.");
            return "not found";
        } else {
            logger.info("Forum gefunden");
            message = safeMode(message, safe);
            return message;
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

function safeMode(forumMessageData, safe) {
    if (safe) {
        if (forumMessageData[Symbol.iterator]) {
            let forumMessages = [];
            for (let forumMessage of forumMessageData) {
                const { _id, forumThreadID, title, text, authorID } = forumMessage;
                const subset = { _id, forumThreadID, title, text, authorID };
                forumMessages.push(subset);
            }
            return forumMessages;
        }
        const { _id, forumThreadID, title, text, authorID } = forumMessageData;
        const subset = { _id, forumThreadID, title, text, authorID };
        return subset;
    }
    return forumMessageData;
}

module.exports = {
    getForumMessages,
    createForumMessage,
    updateForumMessage,
    deleteForumMessage,
    searchMessagesByForumId,
    searchMessageById,
    searchMessagesByAuthorId
}