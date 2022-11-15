const userService = require('../user/userService');
const logger = require('../../config/logger');
const jwt = require('jsonwebtoken');
const config = require('config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: config.get("email.host"),
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.get("email.user"), // generated ethereal user
        pass: config.get("email.pass"), // generated ethereal password
    },
});

async function createMail(req) {
    try {
        const privateKey = config.get("email.tokenKey");
        const admin = await userService.searchUserById(req.user.userID);
        if (admin.email) {
            let userList = await userService.getNewsletterUsers();
            for (let user of userList) {
                const token = jwt.sign({ "user": user.userID }, privateKey, { expiresIn: "1d", algorithm: "HS256" });
                const url = `https://localhost/newsletter/unsubscribe/${token}`;
                transporter.sendMail({
                    from: `${admin.userName ? admin.userName : admin.userID} <${admin.email}>`, // sender address
                    to: `${user.email}`, // list of receivers
                    subject: `${req.body.subject}`, // Subject line
                    html: `${req.body.text} <br> <a href="${url}">Unsubscribe</a>`
                });
            }
            logger.info("Email send.");
            return "send";
        }
        logger.info("Admin has no Mail or users dont subscribed to newsletter");
    } catch (e) {
        logger.error(e);
    }
}

module.exports = {
    createMail
}