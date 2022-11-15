const express = require('express')
const bodyParser = require('body-parser');
const database = require('./database/db');
const logger = require('./config/logger');
const userService = require('./endpoints/user/userService');
const cors = require('cors');
const app = express();
const https = require('https');
const fs = require('fs');
const key = fs.readFileSync('./certificates/key.pem');
const cert = fs.readFileSync('./certificates/cert.pem');

app.use(bodyParser.json());
app.use(express.json());
app.use("*", cors());
app.use(cors({
  exposedHeaders: ['Authorization'],
}));

const publicUserRoutes = require('./endpoints/user/publicUserRoute');
const authRoutes = require('./endpoints/authentication/authenticationRoute');
const userRoutes = require('./endpoints/user/userRoute');
const forumRoutes = require('./endpoints/forumThread/forumThreadRoute');
const forumMessageRoutes = require('./endpoints/forumMessage/forumMessageRoute');
const registerRoute = require('./endpoints/register/registerRoute');
const chatRoute = require('./endpoints/chat/chatRoute');
const chatMessageRoute = require('./endpoints/chat/chatMessages/messageRoute');
const newsletterRoute = require('./endpoints/newsletter/newsletterRoute');

app.use('/publicUsers', publicUserRoutes);
app.use('/authenticate', authRoutes);
app.use('/users', userRoutes);
app.use('/forumThreads', forumRoutes);
app.use('/forumMessages', forumMessageRoutes);
app.use('/register', registerRoute);
app.use('/chats', chatRoute);
app.use('/chats', chatMessageRoute);
app.use('/newsletter', newsletterRoute);

app.use(function (req, res) {
  res.status(404).json({"Error": "Can't find that."});
});

app.use(function (req, res) {
  res.status(400).json({"Error": "Something wen't wrong."});
});

async function start() {
  database.initDb(async function (err, db) {
    if (db) {
      logger.info("database angebunden");
    } else {
      logger.error("Anbindung fehlgeschlagen");
    }
  });
  await userService.createAdmin();
}

const server = https.createServer({key: key, cert: cert }, app);

server.listen(443, async function () {
  const port = server.address().port;
  await start();
  logger.info("Server started Running on port " + port);
  app.emit("started");
});
//a
module.exports = {
  server,
  app
} 