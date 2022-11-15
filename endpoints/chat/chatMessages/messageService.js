const Message = require('./messageModel');
const logger = require('../../../config/logger');
const Chat = require('../chatModel');

async function getMessagesByChatID(chatID, userID) {
    try {
        const chat = await Chat.findOne({ _id: chatID });
        if (chat) {
            for (const user of chat.users) {
                if (user === userID) {
                    const messages = await Message.find({ chatID: chatID });
                    logger.info("Messages werden ausgegeben");
                    return messages;
                }
            }
        } else {
            logger.warn("User ohne access wollte auf Chat zugreifen.");
            return "error";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function createMessage(messageData, authorID) {
    try {
        const chat = await Chat.findOne({ _id: messageData.chatID });
        if (chat) {
            for (const user of chat.users) {
                if (user === authorID) {
                    let message = await Message.create(messageData);
                    message.authorID = authorID;
                    await message.save();
                    logger.info("Chat erstellt. Teilnehmer: " + chat.users);
                    return message;
                }
            }
            logger.warn("User ohne Rechte hat versucht eine Nachricht zu erzeugen.");
        } else {
            logger.warn("Chat nicht gefunden.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function deleteMessage(messageData, author) {
    try {
        const message = await Message.findById(messageData._id);
        if (message) {
            if (message.authorID === author) {
                await Message.deleteOne({ _id: messageData._id });
                logger.info("Message gelöscht.");
            }
        } else {
            logger.warn("Message existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return e;
    }
}

async function updateMessage(messageData, author) {
    try {
        let message = await Message.findOne({ _id: messageData._id });
        if (message && message.authorID === author) {
            Object.assign(message, messageData, { authorID: message.authorID });
            await message.save();
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

module.exports = {
    getMessagesByChatID,
    createMessage,
    deleteMessage,
    updateMessage
}