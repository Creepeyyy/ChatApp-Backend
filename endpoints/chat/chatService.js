const Chat = require('./chatModel');
const User = require('../user/userModel');
const Message = require('./chatMessages/messageModel');
const logger = require('../../config/logger');

//gibt alle Chats aus zu welchem user gehört
async function getChats(userID) {
    try {
        let chats = await Chat.find();
        let userChats = [];
        for (let chat of chats) {
            if (chat.includesUser(userID)) {
                userChats.push(chat);
            }
        }
        return userChats;
    } catch (e) {
        logger.error(e);
    }
}

async function createChat(chatData, userID) {
    try {
        for (const user of chatData.users) {
            if (!await User.exists({ userID: user })) {
                logger.error("User existiert nicht" + user);
                return "not found";
            }
        }
        let chat = await Chat.create(chatData);
        chat.ownerID = userID;
        chat.users.push(userID);
        await chat.save();
        logger.info("Chat erstellt. Teilnehmer: " + chat.users);
        return chat;
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function deleteChat(chatData, user) {
    try {
        const chat = await Chat.findById(chatData._id);
        if (chat) {
            if (chat.ownerID === user) {
                await Message.deleteMany({ chatID: chatData._id });
                await Chat.deleteOne({ _id: chatData._id });
                logger.info("Chat gelöscht.");
            } else {
                logger.info("User without owner tried to delete chat.");
                return "error"
            }
        } else {
            logger.warn("Chat existiert nicht.");
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

async function updateChat(chatData, user) {
    try {
        let chat = await Chat.findOne({ _id: chatData._id });
        if (chat.ownerID !== user) {
            logger.error("User without access tried to update chat.")
            return "forbidden";
        }
        if (chat) {
            if (chatData.users) {
                for (const user of chatData.users) {
                    if (!await User.exists({ userID: user })) {
                        logger.error("User existiert nicht" + user);
                        return "not found";
                    }
                }
            }
            Object.assign(chat, chatData, {users: chat.users.concat(chatData.users)});
            await chat.save();
            return chat;
        } else {
            logger.warn("Chat existiert nicht.")
            return "not found";
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

module.exports = {
    getChats,
    createChat,
    deleteChat,
    updateChat
}