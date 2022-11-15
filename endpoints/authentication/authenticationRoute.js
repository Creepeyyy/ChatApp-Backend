const express = require('express');
const router = express.Router();
const authenticationService = require('./authenticationService');

router.get('/', async function (req, res) {
    try {
        if(!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
            res.status(401).setHeader("WWW-Authenticate", 'Basic realm="Secure Area"').send("Missing authorization");
            return;
        }
        const base64 = req.headers.authorization.split(" ")[1];
        const credentials = Buffer.from(base64, "base64").toString("utf-8");
        const [userID, password] = credentials.split(":");
        const data = await authenticationService.createToken({ userID: userID, password: password });
        if(data == "password incorrect") {
            res.status(401).json({"Error": "Couldn't create token."});
            return;
        }
        const user = data.user;
        const token = data.token;
        if (user) {
            res.header("Authorization", "Bearer " + token);
            const { userID, userName, email } = user;
            const subset = { userID, userName, email };
            res.status(200).json(subset);
        } else {
            res.status(400).json({"Error": "Couldn't create token."});
        }
    } catch (e) {
        res.status(400).json({"Error": "Authentication wen't wrong."});
    }
});

module.exports = router;