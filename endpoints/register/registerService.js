const User = require('../user/userModel');
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

async function createMail(user) {
    try {
        const privateKey = config.get("email.tokenKey");
        const token = jwt.sign({ "user": user.userID }, privateKey, { expiresIn: "14d", algorithm: "HS256" });
        const url = `https://localhost/register/verification/${token}`;
        transporter.sendMail({
            from: '"Verificator" <verification@mail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Verify your account", // Subject line
            html: `Please verify your account with the following link in the next 14days:\n <a href="${url}">Verification</a>`
        });
        logger.info("Email send.");
    } catch (e) {
        logger.error(e);
    }
}

async function registerUser(userData) {
    try {
        let user = await User.create(userData);
        user.verification = false;
        user.isAdministrator = false;
        await user.save();
        logger.info("User erstellt.");
        if (user.email) {
            await createMail(user);
        }
    } catch (e) {
        logger.error(e);
        return "error";
    }
}

module.exports = {
    registerUser,
    createMail
}
